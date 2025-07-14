import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../../src/store/useRoutineStore';
import useProgressStore from '../../../src/store/useProgressStore';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../src/components/Header';

const ActionBubbles = ({ actions, actionStatuses }) => (
  <View style={styles.actionBubblesContainer}>
    {actions.map(action => {
      const status = actionStatuses[action.id];
      let icon = <Ionicons name="ellipse-outline" size={18} color="#8b949e" />;
      if (status === 'completed') {
        icon = <Ionicons name="checkmark-circle" size={18} color="#2da44e" />;
      } else if (status === 'active') {
        icon = <Ionicons name="ellipse" size={18} color="#007bff" />;
      }
      return <View key={action.id} style={styles.actionBubble}>{icon}</View>;
    })}
  </View>
);

const BlockRow = ({ routine, block, status, actionStatuses }) => {
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
    <Link href={{ pathname: `/block/${block.id}`, params: { routineId: routine.id, routineTitle: routine.title } }} asChild>
      <TouchableOpacity style={styles.blockRow}>
        <View style={styles.blockInfo}>
          {getStatusIcon()}
          <Text style={styles.blockTitle}>{block.name}</Text>
        </View>
        <ActionBubbles actions={block.actions} actionStatuses={actionStatuses} />
      </TouchableOpacity>
    </Link>
  );
};

export default function RoutineScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines, loadRoutines } = useRoutineStore();
  const { progress, actions, loadProgress } = useProgressStore();

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
            <Ionicons name="arrow-back" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        }
        rightElement={<Text style={styles.headerRightText}>Blocks</Text>}
      />
      <FlatList
        data={routine?.blocks || []}
        renderItem={({ item }) => (
          <BlockRow
            routine={routine}
            block={item}
            status={progress[item.id]}
            actionStatuses={actions}
          />
        )}
        keyExtractor={item => item.id}
      />
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
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    backgroundColor: '#1f1e25',
  },
  blockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    marginLeft: 15,
    color: '#c9d1d9',
  },
  actionBubblesContainer: {
    flexDirection: 'row',
  },
  actionBubble: {
    marginLeft: 5,
  },
});
