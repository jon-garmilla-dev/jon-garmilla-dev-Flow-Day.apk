import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { theme } from '../../../src/constants/theme';
import useRoutineStore from '../../../src/store/useRoutineStore';
import useProgressStore from '../../../src/store/useProgressStore';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../src/components/Header';

const ActionBubbles = ({ actions, actionStatuses }) => (
  <View style={styles.actionBubblesContainer}>
    {actions.slice(0, 7).map(action => { // Show up to 7 icons
      const status = actionStatuses[action.id];
      
      const getIconColor = () => {
        if (status === 'completed') {
          return theme.colors.success;
        }
        if (status === 'active') {
          return theme.colors.primary;
        }
        return theme.colors.gray;
      };

      return (
        <View key={action.id} style={styles.actionBubble}>
          <Ionicons 
            name={action.icon || 'ellipse-outline'} 
            size={18} 
            color={getIconColor()} 
          />
        </View>
      );
    })}
    {actions.length > 7 && <Text style={styles.actionBubbleText}>...</Text>}
  </View>
);

const BlockRow = ({ routine, block, status, actionStatuses, isEditMode }) => {
  const router = useRouter();
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />;
      case 'active':
        return <Ionicons name="play-circle" size={28} color={theme.colors.primary} />;
      default:
        return <Ionicons name="ellipse-outline" size={28} color={theme.colors.gray} />;
    }
  };

  const calculateBlockDuration = () => {
    const totalSeconds = block.actions.reduce((sum, action) => {
      return action.type === 'timer' && action.duration ? sum + action.duration : sum;
    }, 0);

    if (totalSeconds === 0) return null;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (seconds === 0) return `${minutes}m`;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const duration = calculateBlockDuration();

  const handlePress = () => {
    if (isEditMode) {
      router.push({ pathname: `/block/${block.id}`, params: { routineId: routine.id, routineTitle: routine.title } });
    } else {
      router.push({ pathname: `/routine/${routine.id}/run`, params: { blockId: block.id } });
    }
  };

  return (
    <TouchableOpacity style={styles.blockRow} onPress={handlePress}>
      <View style={styles.blockInfo}>
        <View style={styles.blockTitleContainer}>
          {getStatusIcon()}
          <Text style={styles.blockTitle}>{block.name}</Text>
        </View>
        {duration && (
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>
      <ActionBubbles actions={block.actions} actionStatuses={actionStatuses} />
    </TouchableOpacity>
  );
};

export default function RoutineScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines, loadRoutines } = useRoutineStore();
  const { progress, actions, loadProgress, resetProgress } = useProgressStore();
  const [isEditMode, setEditMode] = useState(false);

  const routine = routines.find(r => r.id === id);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    if (routine) {
      loadProgress(routine);
    }
  }, [routine, loadProgress]);

  return (
    <View style={styles.container}>
      <Header 
        title={routine?.title || 'Routine'} 
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <View style={styles.headerRightContainer}>
            {!isEditMode && (
              <TouchableOpacity onPress={() => resetProgress(routine)} style={styles.headerButton}>
                <Ionicons name="refresh" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setEditMode(!isEditMode)} style={styles.headerButton}>
              <Ionicons name={isEditMode ? "checkmark-done" : "pencil"} size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      <FlatList
        data={routine?.blocks || []}
        renderItem={({ item }) => (
          <BlockRow
            routine={routine}
            block={item}
            status={progress[item.id]}
            actionStatuses={actions}
            isEditMode={isEditMode}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: isEditMode ? 100 : 0 }}
      />
      {isEditMode && (
        <TouchableOpacity style={styles.addBlockFab}>
          <Ionicons name="add" size={32} color={theme.colors.text} />
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: theme.layout.spacing.md,
  },
  headerEditText: {
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
  },
  blockRow: {
    padding: theme.layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  blockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.md,
  },
  blockTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    marginLeft: theme.layout.spacing.md,
    color: theme.colors.text,
  },
  actionBubblesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBubble: {
    marginRight: theme.layout.spacing.sm,
  },
  actionBubbleText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.fonts.bold,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  durationText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.fonts.bold,
    fontSize: 12,
    marginLeft: 4,
  },
  addBlockFab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    backgroundColor: theme.colors.primary,
  },
});
