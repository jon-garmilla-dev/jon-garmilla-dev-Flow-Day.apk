import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import { usePageLayout } from '../../src/components/layout/PageLayout';

export default function RoutineListScreen() {
  const routines = useRoutineStore(state => state.routines);
  const loadRoutines = useRoutineStore(state => state.loadRoutines);
  const { openMenu } = usePageLayout();

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const renderItem = ({ item }) => (
    <Link href={`/routine/${item.id}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
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
      </TouchableOpacity>
    </Link>
  );

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
    flex: 1, // Para que el título ocupe el espacio y empuje los iconos
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15, // Espacio entre iconos
  },
});
