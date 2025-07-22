import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import CircularProgress from "react-native-circular-progress-indicator";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import Header from "../../../../src/components/Header";
import Spinner from "../../../../src/components/ui/Spinner";
import CompletionAnimation from "../../../../src/components/animations/CompletionAnimation";
import { theme } from "../../../../src/constants/theme";
import useProgressStore from "../../../../src/store/useProgressStore";
import useRoutineStore from "../../../../src/store/useRoutineStore";

// --- Helper Functions ---
const findCurrentTaskInfo = (routine, blockId, actions) => {
  if (!routine || !Array.isArray(routine.blocks)) return null;
  const block = routine.blocks.find((b) => b && b.id === blockId);
  if (!block || !Array.isArray(block.actions)) return null;

  const firstPendingActionIndex = block.actions.findIndex(
    (action) => action && actions[action.id] !== "completed",
  );
  if (firstPendingActionIndex === -1) {
    return {
      block,
      currentTask: null,
      nextTask: null,
      currentIndex: -1,
      totalTasks: block.actions.length,
    };
  }
  const currentTask = block.actions[firstPendingActionIndex]
    ? { block, action: block.actions[firstPendingActionIndex] }
    : null;
  const nextTask =
    firstPendingActionIndex !== -1 && firstPendingActionIndex + 1 < block.actions.length
      ? { block, action: block.actions[firstPendingActionIndex + 1] }
      : null;
  return {
    block,
    currentTask,
    nextTask,
    currentIndex: firstPendingActionIndex,
    totalTasks: block.actions.length,
  };
};

const formatTime = (seconds) => {
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// --- Animated Components ---
const AnimatedProgressBar = ({ progress, primaryColor, secondaryColor }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });
  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]}>
        <LinearGradient
          colors={[primaryColor, secondaryColor]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

// --- Main Component ---
export default function RoutineRunnerScreen() {
  const { id: routineId, blockId } = useLocalSearchParams();
  const router = useRouter();

  // State
  const [countdown, setCountdown] = useState(0);
  const [totalRemainingTime, setTotalRemainingTime] = useState(0);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [isFocusLocked, setIsFocusLocked] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Animation
  const focusProgress = useSharedValue(0);
  const progress = useSharedValue(0);
  const breathingValue = useSharedValue(1);

  // Stores
  const routine = useRoutineStore((state) =>
    state.routines.find((r) => r.id === routineId),
  );
  const {
    actions,
    loadProgress,
    startAction,
    completeAction,
    pauseAction,
    pausedTimers,
  } = useProgressStore();

  // Memos
  const taskInfo = useMemo(() => {
    const info = findCurrentTaskInfo(routine, blockId, actions);
    return info || {
      block: null,
      currentTask: null,
      nextTask: null,
      currentIndex: -1,
      totalTasks: 0
    };
  }, [routine, blockId, actions]);

  const { block, currentTask, nextTask, currentIndex, totalTasks } = taskInfo;

  // --- Foreground Service Logic ---
  useEffect(() => {
    // Set a notification handler for the app
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const startForegroundService = async () => {
    try {
      await Notifications.requestPermissionsAsync();

      await Notifications.setNotificationChannelAsync("routine-timer", {
        name: "Routine Timer",
        importance: Notifications.AndroidImportance.LOW,
      });

      if (routine) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Flow Day",
            body: `"${routine.title}" is running...`,
            data: {},
            sound: false,
            sticky: true, // This is for the foreground service
            color: theme.colors.primary,
          },
          trigger: null, // Show immediately
        });
      }
    } catch (e) {
      console.error("Failed to start foreground service:", e);
    }
  };

  const stopForegroundService = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
    } catch (e) {
      console.error("Failed to stop foreground service:", e);
    }
  };

  const effectiveDurations = useMemo(() => {
    if (!block) return { durations: [], total: 0 };
    const timedActions = block.actions.filter(
      (a) => a.duration && a.duration > 0,
    );
    let averageDuration = 0;
    if (timedActions.length > 0) {
      const totalTimedDuration = timedActions.reduce(
        (sum, a) => sum + a.duration,
        0,
      );
      averageDuration = totalTimedDuration / timedActions.length;
    } else {
      averageDuration = 1;
    }
    const durations = block.actions.map(
      (a) => (a.duration && a.duration > 0 ? a.duration : averageDuration) || 1,
    );
    const total = durations.reduce((sum, d) => sum + d, 0);
    return { durations, total };
  }, [block]);

  // Effects
  useEffect(() => {
    if (routine) {
      loadProgress(routine);
    }
  }, [routine, loadProgress]);

  useEffect(() => {
    if (routine && !block) {
      setIsLoading(false);
      return;
    }
    if (routine && block && taskInfo) {
      setIsLoading(false);
    }
  }, [routine, block, taskInfo]);

  useEffect(() => {
    if (!currentTask || !currentTask.action) return;

    const remainingBlockDuration = block.actions
      .slice(currentIndex)
      .filter((a) => a && a.type === "timer" && a.duration)
      .reduce((sum, a) => sum + a.duration, 0);

    const pausedTime = pausedTimers[currentTask.action.id];
    const initialCountdown = pausedTime !== undefined ? pausedTime : currentTask.action.duration || 0;

    let initialTotal = remainingBlockDuration;
    if (pausedTime !== undefined && currentTask.action.duration) {
      const elapsed = currentTask.action.duration - pausedTime;
      initialTotal -= elapsed;
    }

    setCountdown(initialCountdown);
    setTotalRemainingTime(Math.max(0, initialTotal));
    
    setIsPaused(pausedTime !== undefined);

  }, [currentTask]);

  useEffect(() => {
    const isTimerAction = currentTask?.action?.type === "timer" && currentTask.action.duration > 0;
    setIsActionLocked(isTimerAction);

    if (isPaused || !isTimerAction || !currentTask) {
      stopForegroundService();
      return;
    }

    startForegroundService();

    const timerId = setInterval(() => {
      setCountdown((prevCountdown) => {
        const newCountdown = prevCountdown - 1;

        if (newCountdown < 1) {
          handleComplete();
          clearInterval(timerId);
          return 0;
        }
        
        setTotalRemainingTime((prevTotal) => prevTotal - 1);
        return newCountdown;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
      stopForegroundService();
    };
  }, [isPaused, currentTask, handleComplete]);


  useEffect(() => {
    if (effectiveDurations.total > 0) {
      const completedEffectiveDuration = effectiveDurations.durations
        .slice(0, currentIndex)
        .reduce((sum, d) => sum + d, 0);
      const newProgress =
        (completedEffectiveDuration / effectiveDurations.total) * 100;
      progress.value = withTiming(newProgress, { duration: 500 });
    } else {
      progress.value = withTiming(0);
    }
  }, [currentIndex, effectiveDurations, progress]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isFocusLocked) {
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [isFocusLocked]),
  );

  useEffect(() => {
    if (currentTask?.action.name === 'Break') {
      breathingValue.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      breathingValue.value = withTiming(1, { duration: 500 });
    }
  }, [currentTask, breathingValue]);

  const handleComplete = useCallback(() => {
    if (!currentTask || !currentTask.action || (focusProgress.value > 0.5 && isActionLocked)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeAction(routine, currentTask.action.id);
  }, [
    currentTask,
    isActionLocked,
    routine,
    completeAction,
    focusProgress,
  ]);

  const handleStart = useCallback(() => {
    if (currentTask && currentTask.block) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      startAction(routine, currentTask.block.id);
    }
  }, [currentTask, routine, startAction]);

  const handleTogglePause = () => {
    if (!currentTask || !currentTask.action) return;
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    if (newPausedState) {
      pauseAction(routine.id, currentTask.action.id, countdown);
    } else {
      pauseAction(routine.id, currentTask.action.id, null);
    }
  };

  useEffect(() => {
    if (currentTask && currentTask.action && actions[currentTask.action.id] !== "active") {
      const timer = setTimeout(() => {
        handleStart();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentTask, actions, handleStart]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(() => {
      if (focusProgress.value > 0.5 && isFocusLocked) {
        return;
      }
      const targetValue = focusProgress.value > 0.5 ? 0 : 1;
      focusProgress.value = withTiming(targetValue, {
        duration: 350,
        easing: Easing.inOut(Easing.ease),
      });
    });

  const animatedMainContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      focusProgress.value,
      [0, 0.5],
      [1, 0],
      Extrapolate.CLAMP,
    ),
  }));

  const animatedFocusOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      focusProgress.value,
      [0.5, 1],
      [0, 1],
      Extrapolate.CLAMP,
    ),
    pointerEvents: focusProgress.value > 0.5 ? 'auto' : 'none',
  }));

  const animatedActionTitleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(focusProgress.value, [0, 1], [32, 40]),
    marginTop: theme.layout.spacing.md,
  }));

  const animatedMainIconSize = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(focusProgress.value, [0, 1], [1, 1.2]),
      },
    ],
  }));

  const animatedBlinkStyle = useAnimatedStyle(() => {
    return {
      opacity: isPaused ? 0.5 : 1,
    };
  });

  const animatedBreathingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingValue.value }],
    };
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );
  }

  if (!routine || !block) {
    return (
      <View style={styles.container}>
        <Header title="Error" />
        <View style={styles.content}>
          <Text style={styles.actionTitle}>Routine or Block not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.nextUpText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentTask) {
    return <CompletionAnimation onAnimationEnd={() => router.back()} />;
  }

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={styles.container}>
        <Animated.View
          style={[StyleSheet.absoluteFill, animatedMainContentStyle]}
        >
          <Header
            title={routine.title}
            leftElement={
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            }
            rightElement={
              <View style={styles.timerContainer}>
                <Ionicons
                  name="timer-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.timerText}>
                  {formatTime(totalRemainingTime)}
                </Text>
              </View>
            }
          />
          <View style={styles.content}>
            <View style={styles.card}>
              <View>
                <View style={styles.blockHeader}>
                  <Ionicons
                    name={currentTask.action?.icon || "ellipse-outline"}
                    size={22}
                    color={theme.colors.gray}
                  />
                  <Text style={styles.blockTitle}>
                    {currentTask.action?.name}
                  </Text>
                  <Text
                    style={styles.progressText}
                  >{`${currentIndex + 1}/${totalTasks}`}</Text>
                </View>
                <AnimatedProgressBar
                  progress={progress}
                  primaryColor={theme.colors.primary}
                  secondaryColor={currentTask.action?.color || theme.colors.primary}
                />
              </View>

              <View style={styles.actionContent}>
                {currentTask.action?.type === "timer" &&
                currentTask.action?.duration > 0 ? (
                  <Animated.View style={animatedBreathingStyle}>
                    <CircularProgress
                      key={`main-${currentTask.action.id}`}
                      value={countdown}
                      maxValue={currentTask.action.duration}
                      radius={100}
                      duration={400}
                      progressValueColor={theme.colors.text}
                      activeStrokeColor={currentTask.action?.color || theme.colors.primary}
                      inActiveStrokeColor={theme.colors.border}
                      inActiveStrokeOpacity={0.5}
                      inActiveStrokeWidth={20}
                      activeStrokeWidth={20}
                      showProgressValue={false}
                    />
                    <View style={styles.timerTextContainer}>
                      <Animated.Text style={[styles.timerTitle, animatedBlinkStyle]}>
                        {formatTime(countdown)}
                      </Animated.Text>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[{ alignItems: "center" }, animatedMainIconSize]}
                  >
                    <Ionicons
                      name={currentTask.action?.icon || "barbell-outline"}
                      size={64}
                      color={theme.colors.primary}
                    />
                    <Animated.Text
                      style={[styles.actionTitle, animatedActionTitleStyle]}
                    >
                      {currentTask.action?.name}
                    </Animated.Text>
                  </Animated.View>
                )}
              </View>

              <View style={styles.footer}>
                {nextTask && nextTask.action ? (
                  <Text style={styles.nextUpText}>
                    Up next: {nextTask.action.name}
                  </Text>
                ) : (
                  <Text style={styles.nextUpText}>Last action!</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            {currentTask.action?.type === "timer" &&
            currentTask.action?.duration > 0 ? (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleTogglePause}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={32}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButton} />
            )}
            <TouchableOpacity
              style={[
                styles.completeButton,
                isActionLocked && styles.completeButtonLocked,
              ]}
              onPress={handleComplete}
              disabled={isActionLocked}
            >
              <Ionicons
                name="checkmark-done"
                size={40}
                color={theme.colors.background}
              />
            </TouchableOpacity>
            {isActionLocked ? (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setIsActionLocked(false)}
              >
                <Ionicons
                  name="lock-open-outline"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButton} />
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.focusOverlay, animatedFocusOpacity]}>
          <TouchableOpacity
            style={styles.focusLock}
            onPress={() => setIsFocusLocked(!isFocusLocked)}
          >
            <Ionicons
              name={isFocusLocked ? "lock-closed" : "lock-open"}
              size={28}
              color="white"
            />
          </TouchableOpacity>
          <View style={styles.focusCard}>
            <View style={styles.blockHeader}>
              <Ionicons
                name={currentTask.action?.icon || "ellipse-outline"}
                size={22}
                color="white"
              />
              <Text style={[styles.blockTitle, { color: "white" }]}>
                {currentTask.action?.name}
              </Text>
              <Text
                style={[
                  styles.progressText,
                  { color: "rgba(255,255,255,0.7)" },
                ]}
              >{`${currentIndex + 1}/${totalTasks}`}</Text>
            </View>
            <AnimatedProgressBar
              progress={progress}
              primaryColor={theme.colors.primary}
              secondaryColor={currentTask.action?.color || theme.colors.primary}
            />
          </View>
          <View style={styles.actionContent}>
            {currentTask.action?.type === "timer" &&
            currentTask.action?.duration > 0 ? (
              <Animated.View>
                <CircularProgress
                  key={`focus-${currentTask.action.id}`}
                  value={countdown}
                  maxValue={currentTask.action.duration}
                  radius={120}
                  duration={400}
                  progressValueColor="white"
                  activeStrokeColor={
                    currentTask.action?.color || theme.colors.primary
                  }
                  inActiveStrokeColor="rgba(255,255,255,0.2)"
                  inActiveStrokeOpacity={0.5}
                  inActiveStrokeWidth={20}
                  activeStrokeWidth={20}
                  showProgressValue={false}
                />
                <View style={styles.timerTextContainer}>
                  <Animated.Text
                    style={[
                      styles.timerTitle,
                      { color: "white" },
                      animatedBlinkStyle,
                    ]}
                  >
                    {formatTime(countdown)}
                  </Animated.Text>
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                style={[{ alignItems: "center" }, animatedMainIconSize]}
              >
                <Ionicons
                  name={currentTask.action?.icon || "barbell-outline"}
                  size={80}
                  color="white"
                />
                <Animated.Text
                  style={[
                    styles.actionTitle,
                    { color: "white", fontSize: 40, marginTop: 20 },
                    animatedActionTitleStyle,
                  ]}
                >
                  {currentTask.action?.name}
                </Animated.Text>
              </Animated.View>
            )}
          </View>
          <View style={styles.bottomContainer}>
            {currentTask.action?.type === "timer" &&
            currentTask.action?.duration > 0 ? (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleTogglePause}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={32}
                  color="white"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButton} />
            )}
            <TouchableOpacity
              style={[
                styles.completeButton,
                isActionLocked && styles.completeButtonLocked,
              ]}
              onPress={handleComplete}
              disabled={isActionLocked}
            >
              <Ionicons
                name="checkmark-done"
                size={40}
                color={theme.colors.background}
              />
            </TouchableOpacity>
            {isActionLocked ? (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setIsActionLocked(false)}
              >
                <Ionicons name="lock-open-outline" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButton} />
            )}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: "center", paddingTop: 20 },
  card: {
    width: "90%",
    height: "70%",
    backgroundColor: theme.colors.surface,
    justifyContent: "space-between",
    overflow: "hidden",
    borderRadius: 20,
    padding: theme.layout.spacing.lg,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: theme.layout.spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.sm,
    color: "rgba(88, 166, 255, 0.7)",
    letterSpacing: 1,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: theme.layout.spacing.sm,
  },
  actionContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  timerTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  timerTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 42,
    color: theme.colors.text,
  },
  actionTitle: {
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  footer: { alignItems: "center", paddingBottom: theme.layout.spacing.sm },
  nextUpText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completeButtonLocked: { backgroundColor: theme.colors.gray },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.layout.spacing.xs,
    paddingHorizontal: theme.layout.spacing.sm,
    borderRadius: 8,
  },
  timerText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
    marginLeft: theme.layout.spacing.xs,
  },
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  focusLock: { position: "absolute", top: 100, right: 20, padding: 10 },
  focusHeader: {
    width: "100%",
  },
  focusHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.layout.spacing.lg,
  },
  focusRoutineTitle: {
    color: "white",
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
  },
  focusTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: theme.layout.spacing.xs,
    paddingHorizontal: theme.layout.spacing.sm,
    borderRadius: 8,
  },
  focusTimerText: {
    color: "white",
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
    marginLeft: theme.layout.spacing.xs,
  },
  checkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  focusProgressContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: theme.layout.spacing.md,
  },
  focusProgressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  blockCompleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  blockCompleteContent: {
    alignItems: "center",
    marginBottom: 80,
  },
  blockCompleteTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 28,
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  pauseContainer: {
    alignItems: "center",
    marginVertical: theme.layout.spacing.md,
  },
  pauseButton: {
    padding: theme.layout.spacing.sm,
  },
});
