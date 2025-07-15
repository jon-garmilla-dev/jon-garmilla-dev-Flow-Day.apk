import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../../src/store/useRoutineStore';
import useProgressStore from '../../../src/store/useProgressStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../src/components/Header';
import AddActionModal from '../../../src/components/modals/AddActionModal';
import { theme } from '../../../src/constants/theme';

const ActionRow = ({ action, status }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <View style={[styles.actionRow, isActive && styles.actionRowActive]}>
      <View style={styles.actionIconContainer}>
        <Ionicons 
          name={action.icon || 'barbell-outline'} 
          size={28} 
          color={isCompleted ? theme.colors.gray : theme.colors.primary} 
        />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionTitle, isCompleted && styles.actionTitleCompleted]}>
          {action.name}
        </Text>
        {action.type === 'timer' && action.duration > 0 && (
          <Text style={[styles.actionSubtitle, isCompleted && styles.actionTitleCompleted]}>
            {Math.floor(action.duration / 60)}m {action.duration % 60}s
          </Text>
        )}
      </View>
      {isCompleted && (
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
      )}
    </View>
  );
};

export default function BlockScreen() {
  const { id: blockId, routineId, routineTitle } = useLocalSearchParams();
  const router = useRouter();
  const { routines, loadRoutines, addAction: addActionToStore } = useRoutineStore();
  const { actions } = useProgressStore(); // Only need actions for status
  const [isModalVisible, setModalVisible] = useState(false);

  const routine = routines.find(r => r.id === routineId);
  const block = routine?.blocks.find(b => b.id === blockId);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleAddAction = (actionData) => {
    addActionToStore(routineId, blockId, actionData);
  };

  return (
    <View style={styles.container}>
      <AddActionModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddAction}
      />
      <Header 
        title={`${routineTitle} / ${block?.name || 'Block'}`}
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={<Text style={styles.headerRightText}>Actions</Text>}
      />
      <FlatList
        data={block?.actions || []}
        renderItem={({ item }) => (
          <ActionRow
            action={item}
            status={actions[item.id]}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {block && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
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
  headerRightText: {
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.gray,
    fontSize: theme.typography.fontSizes.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionRowActive: {
    backgroundColor: theme.colors.background,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  actionIconContainer: {
    marginRight: theme.layout.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
  },
  actionTitleCompleted: {
    color: theme.colors.gray,
    textDecorationLine: 'line-through',
  },
  actionSubtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },
  fab: {
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
