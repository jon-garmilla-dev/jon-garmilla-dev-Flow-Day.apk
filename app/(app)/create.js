import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    } else {
      const newId = addRoutine(title);
      router.replace(`/create?routineId=${newId}`);
      return;
    }
    router.back();
  };

  const handleAddAction = (blockId) => {
    if (newActionName.trim() !== '' && addingActionToBlock === blockId) {
      const newAction = {
        name: newActionName,
        type: 'standard',
      };
      addAction(routineId, blockId, newAction);
      setNewActionName('');
      setAddingActionToBlock(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerStyle: { backgroundColor: '#0d1117' }, headerTintColor: '#c9d1d9' }} />
      <Text style={styles.label}>Routine Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Morning Routine"
        placeholderTextColor="#8b949e"
      />

      <Button title={isEditing ? "Save Changes" : "Create Routine"} onPress={handleSave} color="#238636" />

      {isEditing && (
        <View style={styles.section}>
          <Text style={styles.label}>Blocks</Text>
          <FlatList
            data={currentRoutine?.blocks || []}
            renderItem={({ item: block }) => (
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
            )}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{color: '#c9d1d9'}}>No blocks yet. Add one below.</Text>}
          />
          <TextInput
            style={styles.input}
            value={newBlockName}
            onChangeText={setNewBlockName}
            placeholder="New block name"
            placeholderTextColor="#8b949e"
          />
          <Button
            title="Add Block"
            onPress={() => {
              if (newBlockName.trim() !== '') {
                addBlock(routineId, newBlockName);
                setNewBlockName('');
              }
            }}
            color="#007bff"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  section: {
    marginTop: 30,
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
