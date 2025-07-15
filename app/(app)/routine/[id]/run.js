import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CircularProgress from 'react-native-circular-progress-indicator';
import { theme } from '../../../../src/constants/theme';
import Header from '../../../../src/components/Header';
import useRoutineStore from '../../../../src/store/useRoutineStore';
import useProgressStore from '../../../../src/store/useProgressStore';

// Helper to find the current task and its context within a specific block
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

  return { 
    block, 
    currentTask, 
    nextTask, 
    currentIndex: firstPendingActionIndex, 
    totalTasks: block.actions.length 
  };
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
  const [isLocked, setIsLocked] = useState(false);

  const routine = useRoutineStore(state => state.routines.find(r => r.id === routineId));
  const { actions, loadProgress, startAction, completeAction } = useProgressStore();

  useEffect(() => {
    if (routine) {
      loadProgress(routine);
    }
  }, [routine, loadProgress]);

  const { block, currentTask, nextTask, currentIndex, totalTasks } = useMemo(
    () => findCurrentTaskInfo(routine, blockId, actions), 
    [routine, blockId, actions]
  );

  const handleComplete = () => {
    if (!currentTask) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const { action } = currentTask;
    completeAction(routine, action.id);

    // The useMemo will trigger a re-render, and the useEffect will start the next task
  };
  
  const handleStart = () => {
    if (currentTask) {
      startAction(routine, currentTask.block.id);
    }
  };

  // Auto-start the first task if no task is active
  useEffect(() => {
    const isActive = Object.values(actions).includes('active');
    if (currentTask && actions[currentTask.action.id] !== 'active' && !isActive) {
      handleStart();
    }
  }, [currentTask, actions]);

  // Countdown and total timer effect
  useEffect(() => {
    let totalTimer;
    if (currentTask) {
      totalTimer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }

    let countdownTimer;
    const isTimerAction = currentTask?.action.type === 'timer' && currentTask.action.duration > 0;
    
    setIsLocked(isTimerAction); // Lock the button if it's a timer action

    if (isTimerAction) {
      setCountdown(currentTask.action.duration);
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setIsLocked(false); // Unlock when timer finishes
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


  if (!routine) {
    return <View style={styles.container}><Text style={styles.actionTitle}>Routine not found.</Text></View>;
  }

  if (!currentTask) {
    return (
      <View style={styles.container}>
        <Header title="Block Complete!" />
        <View style={styles.content}>
          <View style={styles.card}>
            <Ionicons name="trophy" size={64} color={theme.colors.success} />
            <Text style={styles.actionTitle}>{block?.name || 'Block'} Complete</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.completeButton} onPress={() => router.back()}>
          <Text style={styles.completeButtonText}>Back to Workflow</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={routine.title}
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <View style={styles.timerContainer}>
            <Ionicons name="timer-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        }
      />
      <View style={styles.content}>
        <View style={styles.card}>
          <View>
            <ProgressBar current={currentIndex} total={totalTasks} />
            <View style={styles.blockHeader}>
              <Ionicons name={currentTask.action.icon || 'ellipse-outline'} size={18} color={theme.colors.gray} />
              <Text style={styles.blockTitle}>{currentTask.block.name}</Text>
              <Text style={styles.progressText}>{`${currentIndex + 1} / ${totalTasks}`}</Text>
            </View>
          </View>
          
          <View style={styles.actionContent}>
            {currentTask.action.type === 'timer' && currentTask.action.duration > 0 ? (
              <CircularProgress
                value={countdown}
                maxValue={currentTask.action.duration}
                radius={100}
                duration={0}
                progressValueColor={theme.colors.text}
                activeStrokeColor={theme.colors.primary}
                inActiveStrokeColor={theme.colors.border}
                inActiveStrokeOpacity={0.5}
                inActiveStrokeWidth={20}
                activeStrokeWidth={20}
                title={formatTime(countdown)}
                titleStyle={styles.timerTitle}
                showProgressValue={false} // Hide the raw second value
              />
            ) : (
              <>
                <Ionicons 
                  name={currentTask.action.icon || 'barbell-outline'} 
                  size={64} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.actionTitle}>{currentTask.action.name}</Text>
              </>
            )}
          </View>

          <View style={styles.footer}>
            {nextTask ? (
              <Text style={styles.nextUpText}>Up next: {nextTask.action.name}</Text>
            ) : (
              <Text style={styles.nextUpText}>Last action!</Text>
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.completeButton, isLocked && styles.completeButtonLocked]} 
        onPress={handleComplete}
        disabled={isLocked}
      >
        <Ionicons name="checkmark-done" size={32} color={theme.colors.background} />
        <Text style={styles.completeButtonText}>Complete Action</Text>
      </TouchableOpacity>
      {isLocked && (
        <TouchableOpacity style={styles.unlockButton} onPress={() => setIsLocked(false)}>
          <Ionicons name="lock-open-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.layout.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.layout.spacing.lg,
    width: '100%',
    flex: 0.9,
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.layout.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.sm,
    color: 'rgba(88, 166, 255, 0.7)', // Opaque blue
    letterSpacing: 1,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.sm,
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray,
    flex: 1,
    textAlign: 'center',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 42,
    color: theme.colors.text,
  },
  actionTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: 32,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.layout.spacing.md,
  },
  actionDuration: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.gray,
    marginTop: theme.layout.spacing.sm,
  },
  footer: {
    alignItems: 'flex-end',
  },
  nextUpText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    marginHorizontal: theme.layout.spacing.md,
    marginBottom: theme.layout.spacing.md,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonLocked: {
    backgroundColor: theme.colors.gray,
  },
  unlockButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    padding: 10,
  },
  completeButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fonts.bold,
    marginLeft: theme.layout.spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  }
});
