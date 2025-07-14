import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';

export default function CreateEditRoutineScreen() {
  const { routineId } = useLocalSearchParams();
  const router = useRouter();
  const { addRoutine, updateRoutine, routines, addBlock, addAction } = useRoutineStore();

  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [newBlockName, setNewBlockName] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [addingActionToBlock, setAddingActionToBlock] = useState(null);

  useEffect(() => {
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setTitle(routine.title);
        setCurrentRoutine(routine);
        setIsEditing(true);
      }
    }
  }, [routineId, routines]);

  const handleSave = () => {
    if (title.trim() === '') {
      alert('Please enter a title.');
      return;
    }

    if (isEditing) {
      updateRoutine(routineId, title);
      router.back();
    } else {
      const newId = addRoutine(title);
      router.replace(`/create?routineId=${newId}`);
    }
  };

  const handleAddAction = (blockId) => {
    if (newActionName.trim() !== '' && addingActionToBlock === blockId) {
      addAction(routineId, blockId, { name: newActionName, type: 'standard' });
      setNewActionName('');
      setAddingActionToBlock(null);
    }
  };

  const handleAddBlock = () => {
    if (newBlockName.trim() !== '') {
      addBlock(routineId, newBlockName);
      setNewBlockName('');
    }
  };

  const renderListHeader = () => (
    <>
      <Text style={styles.label}>Routine Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Morning Routine"
        placeholderTextColor="#8b949e"
      />
      <Button title={isEditing ? "Save Changes" : "Create Routine"} onPress={handleSave} color="#238636" />
      {isEditing && <Text style={[styles.label, { marginTop: 30 }]}>Blocks</Text>}
    </>
  );

  const renderListFooter = () => {
    if (!isEditing) return null;
    return (
      <View style={{ marginTop: 20 }}>
        <TextInput
          style={styles.input}
          value={newBlockName}
          onChangeText={setNewBlockName}
          placeholder="New block name"
          placeholderTextColor="#8b949e"
        />
        <Button title="Add Block" onPress={handleAddBlock} color="#007bff" />
      </View>
    );
  };

  const renderBlockItem = ({ item: block }) => (
    <View style={styles.blockItem}>
      <Text style={styles.blockTitle}>{block.name}</Text>
      {block.actions.map(action => (
        <Text key={action.id} style={styles.actionItem}>- {action.name}</Text>
      ))}
      {addingActionToBlock === block.id ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="New action name"
            value={newActionName}
            onChangeText={setNewActionName}
            placeholderTextColor="#8b949e"
          />
          <Button title="Save Action" onPress={() => handleAddAction(block.id)} color="#238636" />
        </View>
      ) : (
        <Button title="Add Action" onPress={() => setAddingActionToBlock(block.id)} color="#007bff" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={isEditing ? "Edit Routine" : "Create Routine"}
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={isEditing ? currentRoutine?.blocks || [] : []}
        renderItem={renderBlockItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={isEditing ? <Text style={{color: '#c9d1d9', padding: 20}}>No blocks yet. Add one below.</Text> : null}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  label: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#c9d1d9',
  },
  input: {
    fontFamily: 'NunitoSans_400Regular',
    borderWidth: 1,
    borderColor: '#30363d',
    backgroundColor: '#161b22',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    borderRadius: 5,
    color: '#c9d1d9',
  },
  blockItem: {
    backgroundColor: '#161b22',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  blockTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#c9d1d9',
  },
  actionItem: {
    fontFamily: 'NunitoSans_400Regular',
    marginLeft: 15,
    fontStyle: 'italic',
    color: '#8b949e',
  }
});
