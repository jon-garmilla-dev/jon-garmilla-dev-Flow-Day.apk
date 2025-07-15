import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
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
    () => findCurrentTaskInfo(routine, blockId, actions) || {}, 
    [routine, blockId, actions]
  );

  // Effects
  useEffect(() => {
    if (routine) loadProgress(routine);
  }, [routine, loadProgress]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (focusProgress.value > 0.5 && isFocusLocked) {
          return true; // Block back press in focus mode
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isFocusLocked])
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
    if (!currentTask || (focusProgress.value > 0.5 && isActionLocked)) return;

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

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(() => {
      // Si estamos en focus mode y el candado está activado, no permitir salir
      if (focusProgress.value > 0.5 && isFocusLocked) {
        return;
      }
      
      const targetValue = focusProgress.value > 0.5 ? 0 : 1;
      
      focusProgress.value = withTiming(targetValue, {
        duration: 350,
        easing: Easing.inOut(Easing.ease),
      });
    });

  // --- Animated Styles ---
  const animatedMainContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0, 0.5], [1, 0], Extrapolate.CLAMP),
  }));

  const animatedFocusOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(focusProgress.value, [0.5, 1], [0, 1], Extrapolate.CLAMP),
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
        <View style={styles.blockCompleteOverlay}>
          <View style={styles.blockCompleteContent}>
            <Ionicons name="trophy" size={80} color={theme.colors.success} />
            <Text style={styles.blockCompleteTitle}>{block?.name || 'Block'} Complete</Text>
          </View>
          <TouchableOpacity style={styles.completeButton} onPress={() => router.back()}>
            <Ionicons name="checkmark-done" size={40} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedMainContentStyle]}>
          <Header title={routine.title} leftElement={<TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color={theme.colors.text} /></TouchableOpacity>} rightElement={<View style={styles.timerContainer}><Ionicons name="timer-outline" size={20} color={theme.colors.primary} /><Text style={styles.timerText}>{currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? formatTime(countdown) : formatTime(elapsedTime)}</Text></View>} />
          <View style={styles.content}>
            <View style={styles.card}>
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
            </View>
          </View>
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
        </Animated.View>

      <Animated.View 
        style={[styles.focusOverlay, animatedFocusOpacity]}
      >
          <TouchableOpacity style={styles.focusLock} onPress={() => setIsFocusLocked(!isFocusLocked)}>
            <Ionicons name={isFocusLocked ? "lock-closed" : "lock-open"} size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.focusCard}>
            <View style={styles.blockHeader}>
              <Ionicons name={currentTask.action.icon || 'ellipse-outline'} size={22} color={'white'} />
              <Text style={[styles.blockTitle, {color: 'white'}]}>{currentTask.action.name}</Text>
              <Text style={[styles.progressText, {color: 'rgba(255,255,255,0.7)'}]}>{`${currentIndex + 1}/${totalTasks}`}</Text>
            </View>
            <View style={styles.focusProgressContainer}>
              <View style={[styles.focusProgressBar, { width: `${totalTasks > 0 ? ((currentIndex + 1) / totalTasks) * 100 : 0}%` }]} />
            </View>
          </View>
          <View style={styles.actionContent}>
            {currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? (
              <CircularProgress value={countdown} maxValue={currentTask.action.duration} radius={120} duration={0} progressValueColor={'white'} activeStrokeColor={theme.colors.primary} inActiveStrokeColor={'rgba(255,255,255,0.2)'} inActiveStrokeOpacity={0.5} inActiveStrokeWidth={20} activeStrokeWidth={20} title={formatTime(countdown)} titleStyle={[styles.timerTitle, {color: 'white'}]} showProgressValue={false} />
            ) : (
              <Animated.View style={[{alignItems: 'center'}, animatedMainIconSize]}>
                <Ionicons name={currentTask.action.icon || 'barbell-outline'} size={80} color={'white'} />
                <Animated.Text style={[styles.actionTitle, {color: 'white', fontSize: 40, marginTop: 20}, animatedActionTitleStyle]}>{currentTask.action.name}</Animated.Text>
              </Animated.View>
            )}
          </View>
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={[styles.completeButton, isActionLocked && styles.completeButtonLocked]} onPress={handleComplete} disabled={isActionLocked}>
              <Ionicons name="checkmark-done" size={40} color={theme.colors.background} />
            </TouchableOpacity>
            {isActionLocked && (
              <TouchableOpacity style={styles.unlockButton} onPress={() => setIsActionLocked(false)}>
                <Ionicons name="lock-open-outline" size={24} color={'white'} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', paddingTop: 20 },
  card: { 
    width: '90%',
    height: '70%',
    backgroundColor: theme.colors.surface, 
    justifyContent: 'space-between', 
    overflow: 'hidden',
    borderRadius: 20,
    padding: theme.layout.spacing.lg,
  },
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
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  focusLock: { position: 'absolute', top: 100, right: 20, padding: 10 },
  focusHeader: {
    width: '100%',
  },
  focusHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.lg,
  },
  focusRoutineTitle: {
    color: 'white',
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
  },
  focusTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: theme.layout.spacing.xs,
    paddingHorizontal: theme.layout.spacing.sm,
    borderRadius: 8,
  },
  focusTimerText: {
    color: 'white',
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
    marginLeft: theme.layout.spacing.xs,
  },
  checkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusProgressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: theme.layout.spacing.md,
  },
  focusProgressBar: { 
    height: '100%', 
    backgroundColor: theme.colors.primary, 
    borderRadius: 4 
  },
  blockCompleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blockCompleteContent: {
    alignItems: 'center',
    marginBottom: 80,
  },
  blockCompleteTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});
