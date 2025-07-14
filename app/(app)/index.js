import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import { usePageLayout } from '../../src/components/layout/PageLayout';

const formatDuration = (totalMinutes) => {
  if (totalMinutes === 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let duration = '';
  if (hours > 0) duration += `${hours}h `;
  if (minutes > 0) duration += `${minutes}m`;
  return duration.trim();
};

const calculateRoutineDuration = (routine) => {
  if (!routine || !routine.blocks) return 0;
  return routine.blocks.reduce((total, block) => {
    const blockTotal = (block.actions || []).reduce((blockSum, action) => {
      if (action.type === 'text' || action.type === 'focus') {
        return blockSum + (parseInt(action.duration, 10) || 0);
      }
      if (action.type === 'pomodoro') {
        return blockSum + (parseInt(action.workDuration, 10) || 0) + (parseInt(action.breakDuration, 10) || 0);
      }
      return blockSum;
    }, 0);
    return total + blockTotal;
  }, 0);
};

export default function RoutineListScreen() {
  const routines = useRoutineStore(state => state.routines);
  const loadRoutines = useRoutineStore(state => state.loadRoutines);
  const { openMenu } = usePageLayout();

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const renderItem = ({ item }) => {
    const totalDuration = calculateRoutineDuration(item);
    return (
      <Link href={`/routine/${item.id}`} asChild>
        <TouchableOpacity style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.rightContainer}>
            <Text style={styles.durationText}>{formatDuration(totalDuration)}</Text>
            <View style={styles.iconContainer}>
              <Link href={`/create?routineId=${item.id}`} asChild>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#8b949e" />
                </TouchableOpacity>
              </Link>
              <Link href={`/create?routineId=${item.id}`} asChild>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="create-outline" size={24} color="#8b949e" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Flow Day"
        leftElement={
          <TouchableOpacity onPress={openMenu}>
            <Ionicons name="menu" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        }
      />
      {routines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Link href="/create" asChild>
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={100} color="#8b949e" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.emptyText}>Create your first routine</Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8b949e',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  itemTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    color: '#c9d1d9',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontFamily: 'NunitoSans_400Regular',
    color: '#8b949e',
    fontSize: 16,
    marginRight: 15,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
});
