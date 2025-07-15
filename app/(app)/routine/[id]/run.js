import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CircularProgress from 'react-native-circular-progress-indicator';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolate } from 'react-native-reanimated';
import { theme } from '../../../../src/constants/theme';
import Header from '../../../../src/components/Header';
import useRoutineStore from '../../../../src/store/useRoutineStore';
import useProgressStore from '../../../../src/store/useProgressStore';

// --- Helper Functions ---
const findCurrentTaskInfo = (routine, blockId, actions) => {
  if (!routine || !routine.blocks) return null;
  const block = routine.blocks.find(b => b.id === blockId);
  if (!block) return null;
  const firstPendingActionIndex = block.actions.findIndex(action => actions[action.id] !== 'completed');
  if (firstPendingActionIndex === -1) {
    return { block, currentTask: null, nextTask: null, currentIndex: -1, totalTasks: block.actions.length };
  }
  const currentTask = { block, action: block.actions[firstPendingActionIndex] };
  const nextTask = firstPendingActionIndex + 1 < block.actions.length 
    ? { block, action: block.actions[firstPendingActionIndex + 1] } 
    : null;
  return { block, currentTask, nextTask, currentIndex: firstPendingActionIndex, totalTasks: block.actions.length };
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// --- Animated Components ---
const AnimatedProgressBar = ({ current, total, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const width = total > 0 ? ((current / total) * 100) : 0;
    return {
      width: `${width}%`,
      opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolate.CLAMP),
    };
  });
  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
};

// --- Main Component ---
export default function RoutineRunnerScreen() {
  const { id: routineId, blockId } = useLocalSearchParams();
  const router = useRouter();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  // State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [isFocusLocked, setIsFocusLocked] = useState(true);

  // Animation
  const focusProgress = useSharedValue(0);

  // Stores
  const routine = useRoutineStore(state => state.routines.find(r => r.id === routineId));
  const { actions, loadProgress, startAction, completeAction } = useProgressStore();

  // Memos
  const { block, currentTask, nextTask, currentIndex, totalTasks } = useMemo(
    () => findCurrentTaskInfo(routine, blockId, actions), 
    [routine, blockId, actions]
  );

  // Effects
  useEffect(() => {
    if (routine) loadProgress(routine);
  }, [routine, loadProgress]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Directly use the shared value in the callback, which is fine.
        if (focusProgress.value > 0.5 && isFocusLocked) {
          return true; // Block back press in focus mode
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isFocusLocked]) // Removed focusProgress from dependencies
  );

  useEffect(() => {
    let totalTimer;
    if (currentTask) {
      totalTimer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }

    let countdownTimer;
    const isTimerAction = currentTask?.action.type === 'timer' && currentTask.action.duration > 0;
    setIsActionLocked(isTimerAction);

    if (isTimerAction) {
      setCountdown(currentTask.action.duration);
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setIsActionLocked(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (totalTimer) clearInterval(totalTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [currentTask]);

  // Handlers
  const handleComplete = () => {
    if (!currentTask) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeAction(routine, currentTask.action.id);
  };
  
  const handleStart = () => {
    if (currentTask) startAction(routine, currentTask.block.id);
  };

  useEffect(() => {
    const isActive = Object.values(actions).includes('active');
    if (currentTask && actions[currentTask.action.id] !== 'active' && !isActive) {
      handleStart();
    }
  }, [currentTask, actions]);

  const onDoubleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const targetValue = focusProgress.value > 0.5 ? 0 : 1;
      focusProgress.value = withTiming(targetValue, {
        duration: 350,
        easing: Easing.inOut(Easing.ease),
      });
    }
  };

  // --- Animated Styles ---
  const animatedCardStyle = useAnimatedStyle(() => {
    const cardWidth = interpolate(focusProgress.value, [0, 1], [screenWidth * 0.9, screenWidth]);
    const cardHeight = interpolate(focusProgress.value, [0, 1], [screenHeight * 0.7, screenHeight]);
    const borderRadius = interpolate(focusProgress.value, [0, 1], [20, 0]);
    const padding = interpolate(focusProgress.value, [0, 1], [theme.layout.spacing.lg, theme.layout.spacing.md]);
    return {
      width: cardWidth,
      height: cardHeight,
      borderRadius,
      padding,
    };
  });

  const animatedFocusOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0.7, 1], [0, 1]),
  }));

  const animatedActionTitleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(focusProgress.value, [0, 1], [32, 40]),
    marginTop: theme.layout.spacing.md,
  }));

  const animatedMainIconSize = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(focusProgress.value, [0, 1], [1, 1.2]),
    }]
  }));

  // --- Render Logic ---
  if (!routine) return <View style={styles.container}><Text style={styles.actionTitle}>Routine not found.</Text></View>;

  if (!currentTask) {
    return (
      <View style={styles.container}>
        <Header title="Block Complete!" />
        <View style={styles.content}>
          <View style={[styles.card, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="trophy" size={64} color={theme.colors.success} />
            <Text style={styles.actionTitle}>{block?.name || 'Block'} Complete</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.completeButton} onPress={() => router.back()}>
          <Ionicons name="checkmark-done" size={32} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={routine.title} leftElement={<TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color={theme.colors.text} /></TouchableOpacity>} rightElement={<View style={styles.timerContainer}><Ionicons name="timer-outline" size={20} color={theme.colors.primary} /><Text style={styles.timerText}>{currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? formatTime(countdown) : formatTime(elapsedTime)}</Text></View>} />

      <TapGestureHandler onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
        <View style={styles.content}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            {/* Card Header */}
            <View>
              <View style={styles.blockHeader}>
                <Ionicons name={currentTask.action.icon || 'ellipse-outline'} size={22} color={theme.colors.gray} />
                <Text style={styles.blockTitle}>{currentTask.action.name}</Text>
                <Text style={styles.progressText}>{`${currentIndex + 1}/${totalTasks}`}</Text>
              </View>
              <AnimatedProgressBar current={currentIndex + 1} total={totalTasks} progress={focusProgress} />
            </View>

            {/* Main Content */}
            <View style={styles.actionContent}>
              {currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? (
                <CircularProgress value={countdown} maxValue={currentTask.action.duration} radius={100} duration={0} progressValueColor={theme.colors.text} activeStrokeColor={theme.colors.primary} inActiveStrokeColor={theme.colors.border} inActiveStrokeOpacity={0.5} inActiveStrokeWidth={20} activeStrokeWidth={20} title={formatTime(countdown)} titleStyle={styles.timerTitle} showProgressValue={false} />
              ) : (
                <Animated.View style={[{alignItems: 'center'}, animatedMainIconSize]}>
                  <Ionicons name={currentTask.action.icon || 'barbell-outline'} size={64} color={theme.colors.primary} />
                  <Animated.Text style={[styles.actionTitle, animatedActionTitleStyle]}>{currentTask.action.name}</Animated.Text>
                </Animated.View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>{nextTask ? <Text style={styles.nextUpText}>Up next: {nextTask.action.name}</Text> : <Text style={styles.nextUpText}>Last action!</Text>}</View>
          </Animated.View>
        </View>
      </TapGestureHandler>

      {/* Focus Mode Elements */}
      <Animated.View style={[styles.focusLock, animatedFocusOpacity]}>
        <TouchableOpacity onPress={() => setIsFocusLocked(!isFocusLocked)}>
          <Ionicons name={isFocusLocked ? "lock-closed" : "lock-open"} size={28} color={theme.colors.gray} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.completeButton, isActionLocked && styles.completeButtonLocked]} onPress={handleComplete} disabled={isActionLocked}>
          <Ionicons name="checkmark-done" size={40} color={theme.colors.background} />
        </TouchableOpacity>
        {isActionLocked && (
          <TouchableOpacity style={styles.unlockButton} onPress={() => setIsActionLocked(false)}>
            <Ionicons name="lock-open-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center' },
  content: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20 },
  card: { backgroundColor: theme.colors.surface, justifyContent: 'space-between', overflow: 'hidden' },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: theme.layout.spacing.md,
  },
  progressBar: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  progressText: { fontFamily: theme.typography.fonts.bold, fontSize: theme.typography.fontSizes.sm, color: 'rgba(88, 166, 255, 0.7)', letterSpacing: 1 },
  blockHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  blockTitle: { 
    fontFamily: theme.typography.fonts.bold, 
    fontSize: theme.typography.fontSizes.lg, 
    color: theme.colors.text, 
    flex: 1, 
    textAlign: 'center',
    marginHorizontal: theme.layout.spacing.sm,
  },
  actionContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerTitle: { fontFamily: theme.typography.fonts.bold, fontSize: 42, color: theme.colors.text },
  actionTitle: { fontFamily: theme.typography.fonts.bold, color: theme.colors.text, textAlign: 'center' },
  footer: { alignItems: 'center', paddingBottom: theme.layout.spacing.sm },
  nextUpText: { fontFamily: theme.typography.fonts.regular, fontSize: theme.typography.fontSizes.sm, color: theme.colors.gray },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completeButtonLocked: { backgroundColor: theme.colors.gray },
  unlockButton: { position: 'absolute', bottom: 0, right: 0, padding: 10 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingVertical: theme.layout.spacing.xs, paddingHorizontal: theme.layout.spacing.sm, borderRadius: 8 },
  timerText: { color: theme.colors.primary, fontFamily: theme.typography.fonts.bold, fontSize: theme.typography.fontSizes.md, marginLeft: theme.layout.spacing.xs },
  focusLock: { position: 'absolute', top: 60, right: 20, padding: 10, zIndex: 10 },
});
