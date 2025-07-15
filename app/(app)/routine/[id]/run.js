import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, UIManager, LayoutAnimation, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CircularProgress from 'react-native-circular-progress-indicator';
import { theme } from '../../../../src/constants/theme';
import Header from '../../../../src/components/Header';
import useRoutineStore from '../../../../src/store/useRoutineStore';
import useProgressStore from '../../../../src/store/useProgressStore';
import { startForegroundNotification, stopForegroundNotification, updateNotificationContent } from '../../../../src/services/notificationService';

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

const ProgressBar = ({ current, total }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );
};

export default function RoutineRunnerScreen() {
  const { id: routineId, blockId } = useLocalSearchParams();
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isActionLocked, setIsActionLocked] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFocusLocked, setIsFocusLocked] = useState(true);

  const routine = useRoutineStore(state => state.routines.find(r => r.id === routineId));
  const { actions, loadProgress, startAction, completeAction } = useProgressStore();

  useEffect(() => {
    if (routine) loadProgress(routine);
  }, [routine, loadProgress]);

  const { block, currentTask, nextTask, currentIndex, totalTasks } = useMemo(
    () => findCurrentTaskInfo(routine, blockId, actions), 
    [routine, blockId, actions]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isFocusMode && isFocusLocked) {
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isFocusMode, isFocusLocked])
  );

  const handleComplete = () => {
    if (!currentTask) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const { action } = currentTask;
    completeAction(routine, action.id);
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

  useEffect(() => {
    if (currentTask) startForegroundNotification(routine, currentTask.block);
    else stopForegroundNotification();

    let totalTimer;
    if (currentTask) {
      totalTimer = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          const title = `Workflow: ${routine.title} (${currentIndex + 1}/${totalTasks})`;
          const body = `Current: ${currentTask.action.name} | Total Time: ${formatTime(newTime)}`;
          updateNotificationContent(title, body);
          return newTime;
        });
      }, 1000);
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
      stopForegroundNotification();
    };
  }, [currentTask]);

  const onDoubleTap = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsFocusMode(prev => !prev);
    }
  };

  const renderFocusMode = () => (
    <View style={styles.focusContainer}>
      <ProgressBar current={currentIndex} total={totalTasks} />
      <TouchableOpacity style={styles.focusLock} onPress={() => setIsFocusLocked(!isFocusLocked)}>
        <Ionicons name={isFocusLocked ? "lock-closed" : "lock-open"} size={28} color={theme.colors.gray} />
      </TouchableOpacity>
      
      <View style={styles.focusHeader}>
        <View style={styles.blockHeader}>
            <Ionicons name={currentTask.action.icon || 'ellipse-outline'} size={22} color={theme.colors.gray} />
            <Text style={styles.blockTitle}>{currentTask.action.name}</Text>
            <Text style={styles.progressText}>{`${currentIndex + 1} / ${totalTasks}`}</Text>
        </View>
        <ProgressBar current={currentIndex + 1} total={totalTasks} />
      </View>

      <View style={styles.actionContent}>
        {currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? (
          <CircularProgress value={countdown} maxValue={currentTask.action.duration} radius={120} duration={0} progressValueColor={theme.colors.text} activeStrokeColor={theme.colors.primary} inActiveStrokeColor={theme.colors.border} inActiveStrokeOpacity={0.5} inActiveStrokeWidth={25} activeStrokeWidth={25} title={formatTime(countdown)} titleStyle={styles.timerTitle} showProgressValue={false} />
        ) : (
          <>
            <Ionicons name={currentTask.action.icon || 'barbell-outline'} size={80} color={theme.colors.primary} />
            <Text style={[styles.actionTitle, { fontSize: 40 }]}>{currentTask.action.name}</Text>
          </>
        )}
      </View>

      <View style={styles.focusFooter}>
        <TouchableOpacity style={[styles.completeButton, styles.focusCompleteButton, isActionLocked && styles.completeButtonLocked]} onPress={handleComplete} disabled={isActionLocked}>
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

  if (isFocusMode) {
    return renderFocusMode();
  }

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <View style={styles.container}>
      <Header title={routine.title} leftElement={<TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color={theme.colors.text} /></TouchableOpacity>} rightElement={<View style={styles.timerContainer}><Ionicons name="timer-outline" size={20} color={theme.colors.primary} /><Text style={styles.timerText}>{currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? formatTime(countdown) : formatTime(elapsedTime)}</Text></View>} />
      <View style={styles.content}>
        <TapGestureHandler onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
          <View style={styles.card}>
            <View>
              <View style={styles.blockHeader}>
                <Ionicons name={currentTask.action.icon || 'ellipse-outline'} size={22} color={theme.colors.gray} />
                <Text style={styles.blockTitle}>{currentTask.action.name}</Text>
                <Text style={styles.progressText}>{`${currentIndex + 1}/${totalTasks}`}</Text>
              </View>
              <ProgressBar current={currentIndex + 1} total={totalTasks} />
            </View>
            <View style={styles.actionContent}>
              {currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? (
                <CircularProgress value={countdown} maxValue={currentTask.action.duration} radius={100} duration={0} progressValueColor={theme.colors.text} activeStrokeColor={theme.colors.primary} inActiveStrokeColor={theme.colors.border} inActiveStrokeOpacity={0.5} inActiveStrokeWidth={20} activeStrokeWidth={20} title={formatTime(countdown)} titleStyle={styles.timerTitle} showProgressValue={false} />
              ) : (
                <>
                  <Ionicons name={currentTask.action.icon || 'barbell-outline'} size={64} color={theme.colors.primary} />
                  <Text style={styles.actionTitle}>{currentTask.action.name}</Text>
                </>
              )}
            </View>
            <View style={styles.footer}>{nextTask ? <Text style={styles.nextUpText}>Up next: {nextTask.action.name}</Text> : <Text style={styles.nextUpText}>Last action!</Text>}</View>
          </View>
        </TapGestureHandler>
      </View>
      <TouchableOpacity style={[styles.completeButton, isActionLocked && styles.completeButtonLocked]} onPress={handleComplete} disabled={isActionLocked}>
        <Ionicons name="checkmark-done" size={32} color={theme.colors.background} />
        <Text style={styles.completeButtonText}>Complete Action</Text>
      </TouchableOpacity>
      {isActionLocked && (
        <TouchableOpacity style={styles.unlockButton} onPress={() => setIsActionLocked(false)}>
          <Ionicons name="lock-open-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  focusContainer: { flex: 1, backgroundColor: theme.colors.surface, justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  focusHeader: {
    width: '100%',
    paddingHorizontal: theme.layout.spacing.md,
    marginTop: 40,
  },
  focusLock: { position: 'absolute', top: 15, right: 15, padding: 10, zIndex: 10 },
  focusFooter: {
    width: '100%',
    paddingHorizontal: theme.layout.spacing.md,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.layout.spacing.md },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: theme.layout.spacing.lg, width: '100%', flex: 0.9, justifyContent: 'space-between' },
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
    paddingHorizontal: theme.layout.spacing.sm, 
    marginTop: theme.layout.spacing.md 
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
  actionTitle: { fontFamily: theme.typography.fonts.bold, fontSize: 32, color: theme.colors.text, textAlign: 'center', marginTop: theme.layout.spacing.md },
  actionDuration: { fontFamily: theme.typography.fonts.regular, fontSize: theme.typography.fontSizes.lg, color: theme.colors.gray, marginTop: theme.layout.spacing.sm },
  footer: { alignItems: 'flex-end' },
  nextUpText: { fontFamily: theme.typography.fonts.regular, fontSize: theme.typography.fontSizes.sm, color: theme.colors.gray },
  completeButton: { backgroundColor: theme.colors.success, marginHorizontal: theme.layout.spacing.md, marginBottom: theme.layout.spacing.md, paddingVertical: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  focusCompleteButton: { opacity: 0.8 },
  completeButtonLocked: { backgroundColor: theme.colors.gray },
  unlockButton: { position: 'absolute', bottom: 30, right: 30, padding: 10 },
  completeButtonText: { color: theme.colors.background, fontSize: theme.typography.fontSizes.lg, fontFamily: theme.typography.fonts.bold, marginLeft: theme.layout.spacing.md },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingVertical: theme.layout.spacing.xs, paddingHorizontal: theme.layout.spacing.sm, borderRadius: 8 },
  timerText: { color: theme.colors.primary, fontFamily: theme.typography.fonts.bold, fontSize: theme.typography.fontSizes.md, marginLeft: theme.layout.spacing.xs }
});
