import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../../src/store/useRoutineStore';
import useProgressStore from '../../../src/store/useProgressStore';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../src/components/Header';

const ActionRow = ({ action, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={32} color="#2da44e" />;
      case 'active':
        return <Ionicons name="ellipse" size={32} color="#007bff" />;
      default:
        return <Ionicons name="ellipse-outline" size={32} color="#8b949e" />;
    }
  };

  return (
    <View style={styles.actionRow}>
      {getStatusIcon()}
      <Text style={styles.actionTitle}>{action.name}</Text>
    </View>
  );
};

export default function BlockScreen() {
  const { id: blockId, routineId, routineTitle } = useLocalSearchParams();
  const router = useRouter();
  const { routines, loadRoutines } = useRoutineStore();
  const { actions, currentActionId, completeAction, startAction } = useProgressStore();

  const routine = routines.find(r => r.id === routineId);
  const block = routine?.blocks.find(b => b.id === blockId);
  const currentAction = block?.actions.find(a => a.id === currentActionId);
  const isBlockComplete = block?.actions.every(a => actions[a.id] === 'completed');

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleFabPress = () => {
    if (isBlockComplete) {
      router.back();
      return;
    }

    if (currentAction) {
      completeAction(routine, currentAction.id);
    } else {
      startAction(routine, blockId);
    }
  };

  const getFabIcon = () => {
    if (isBlockComplete) return "arrow-back";
    if (currentAction) return "checkmark-done";
    return "play";
  };

  const getFabColor = () => {
    if (isBlockComplete) return "#8b949e"; // Grey for back
    if (currentAction) return "#007bff"; // Blue for active
    return "#238636"; // Green for play
  };

  return (
    <View style={styles.container}>
      <Header 
        title={`${routineTitle} / ${block?.name || 'Block'}`}
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#c9d1d9" />
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
      />
      {block && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: getFabColor() }]}
          onPress={handleFabPress}
        >
          <Ionicons name={getFabIcon()} size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  headerRightText: {
    fontFamily: 'NunitoSans_400Regular',
    color: '#8b949e',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    backgroundColor: '#1f1e25',
  },
  actionTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    marginLeft: 15,
    color: '#c9d1d9',
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
  },
});
