import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../../../src/constants/theme';
import Header from '../../../../src/components/Header';
import useRoutineStore from '../../../../src/store/useRoutineStore';
import useProgressStore from '../../../../src/store/useProgressStore';

// Helper to find the current task within a specific block
const findCurrentTask = (routine, blockId, actions) => {
  if (!routine || !routine.blocks) return null;

  const block = routine.blocks.find(b => b.id === blockId);
  if (!block) return null;

  for (const action of block.actions) {
    if (actions[action.id] !== 'completed') {
      return { block, action };
    }
  }
  return null; // All tasks in this block completed
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function RoutineRunnerScreen() {
  const { id: routineId, blockId } = useLocalSearchParams();
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);

  const routine = useRoutineStore(state => state.routines.find(r => r.id === routineId));
  const { progress, actions, loadProgress, startAction, completeAction } = useProgressStore();

  useEffect(() => {
    if (routine) {
      loadProgress(routine);
    }
  }, [routine, loadProgress]);

  const currentTask = useMemo(() => findCurrentTask(routine, blockId, actions), [routine, blockId, actions]);

  const handleComplete = () => {
    if (!currentTask) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const { block, action } = currentTask;
    completeAction(routine, action.id);

    // Find and start the next action immediately within the same block
    const nextTask = findCurrentTask(routine, blockId, useProgressStore.getState().actions);
    if (nextTask) {
      startAction(routine, nextTask.block.id);
    }
  };
  
  const handleStart = () => {
    if (currentTask) {
      startAction(routine, currentTask.block.id);
    }
  };

  // Auto-start the first task if no task is active
  useEffect(() => {
    const isActive = Object.values(actions).includes('active');
    if (currentTask && !isActive) {
      handleStart();
    }
  }, [currentTask]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (currentTask) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [currentTask]);


  if (!routine) {
    return <View style={styles.container}><Text style={styles.actionTitle}>Routine not found.</Text></View>;
  }

  if (!currentTask) {
    const block = routine?.blocks.find(b => b.id === blockId);
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
          <Text style={styles.label}>BLOCK</Text>
          <Text style={styles.blockTitle}>{currentTask.block.name}</Text>
          
          <View style={styles.actionContent}>
            <Ionicons 
              name={currentTask.action.icon || 'barbell-outline'} 
              size={48} 
              color={theme.colors.primary} 
            />
            <View style={styles.actionTextWrapper}>
              <Text style={styles.label}>ACTION</Text>
              <Text style={styles.actionTitle}>{currentTask.action.name}</Text>
            </View>
          </View>

        </View>
      </View>
      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Ionicons name="checkmark-done" size={32} color={theme.colors.background} />
        <Text style={styles.completeButtonText}>Complete Action</Text>
      </TouchableOpacity>
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
    borderRadius: 15,
    padding: theme.layout.spacing.lg,
    width: '100%',
    minHeight: 250,
    justifyContent: 'space-around',
  },
  label: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.gray,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: theme.layout.spacing.lg,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTextWrapper: {
    marginTop: theme.layout.spacing.md,
  },
  actionTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.xl,
    color: theme.colors.text,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    margin: theme.layout.spacing.md,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
