import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import ActionSheet from '../../src/components/ui/ActionSheet';
import { v4 as uuidv4 } from 'uuid';

const formatDuration = (totalMinutes) => {
  if (totalMinutes === 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let duration = '';
  if (hours > 0) duration += `${hours}h `;
  if (minutes > 0) duration += `${minutes}m`;
  return duration.trim();
};

const calculateBlockDuration = (block) => {
  if (!block || !block.actions) return 0;
  return block.actions.reduce((blockSum, action) => {
    if (action.type === 'focus') return blockSum + (parseInt(action.duration, 10) || 0);
    if (action.type === 'pomodoro') return blockSum + (parseInt(action.workDuration, 10) || 0) + (parseInt(action.breakDuration, 10) || 0);
    return blockSum;
  }, 0);
};

export default function CreateEditRoutineScreen() {
  const { routineId } = useLocalSearchParams();
  const router = useRouter();
  const { addRoutine, updateRoutine, routines, addBlock, addAction } = useRoutineStore();

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [targetBlockIndex, setTargetBlockIndex] = useState(null);

  useEffect(() => {
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setTitle(routine.title);
        setBlocks(routine.blocks || []);
        setIsEditing(true);
      }
    }
  }, [routineId, routines]);

  const totalRoutineDuration = useMemo(() => {
    return blocks.reduce((total, block) => total + calculateBlockDuration(block), 0);
  }, [blocks]);

  const handleUpdateValue = (blockIndex, actionIndex, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].actions[actionIndex][field] = value;
    setBlocks(newBlocks);
  };

  const handleAddActionPress = (blockIndex) => {
    setTargetBlockIndex(blockIndex);
    setIsActionSheetVisible(true);
  };

  const addActionToBlock = (type) => {
    if (targetBlockIndex === null) return;
    const newBlocks = [...blocks];
    const newAction = type === 'focus'
      ? { id: uuidv4(), type: 'focus', duration: '5' }
      : { id: uuidv4(), type: 'pomodoro', workDuration: '25', breakDuration: '5' };
    if (!newBlocks[targetBlockIndex].actions) {
      newBlocks[targetBlockIndex].actions = [];
    }
    newBlocks[targetBlockIndex].actions.push(newAction);
    setBlocks(newBlocks);
  };

  const handleAddNewBlock = () => {
    setBlocks([...blocks, { id: uuidv4(), name: '', actions: [] }]);
  };

  const handleSave = () => { /* ... */ router.back(); };

  const renderActionItem = (action, blockIndex, actionIndex) => {
    const actionInput = (actionType) => {
      if (actionType === 'focus') {
        return (
          <>
            <Ionicons name="time-outline" size={20} color="#8b949e" style={styles.actionIcon} />
            <TextInput style={styles.actionInput} value={action.duration} onChangeText={(val) => handleUpdateValue(blockIndex, actionIndex, 'duration', val)} placeholder="5" keyboardType="numeric" placeholderTextColor="#8b949e" />
            <Text style={styles.actionUnit}>min</Text>
          </>
        );
      }
      if (actionType === 'pomodoro') {
        return (
          <>
            <Ionicons name="hourglass-outline" size={20} color="#8b949e" style={styles.actionIcon} />
            <TextInput style={styles.actionInput} value={action.workDuration} onChangeText={(val) => handleUpdateValue(blockIndex, actionIndex, 'workDuration', val)} placeholder="25" keyboardType="numeric" placeholderTextColor="#8b949e" />
            <Text style={styles.actionUnit}>min /</Text>
            <TextInput style={styles.actionInput} value={action.breakDuration} onChangeText={(val) => handleUpdateValue(blockIndex, actionIndex, 'breakDuration', val)} placeholder="5" keyboardType="numeric" placeholderTextColor="#8b949e" />
            <Text style={styles.actionUnit}>min</Text>
          </>
        );
      }
      return null;
    };

    return (
      <View style={styles.actionRow}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5}}>
          {actionInput(action.type)}
        </View>
      </View>
    );
  };

  const actionOptions = [
    { label: 'Focus', value: 'focus', icon: 'time-outline', details: '5 min' },
    { label: 'Pomodoro', value: 'pomodoro', icon: 'hourglass-outline', details: '25/5 min' },
  ];

  return (
    <View style={styles.container}>
      <Header title={isEditing ? "Edit Routine" : "Create Routine"} leftElement={<TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#c9d1d9" /></TouchableOpacity>} rightElement={<Text style={styles.headerRightText}>{formatDuration(totalRoutineDuration)}</Text>} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#8b949e" />
        {blocks.map((block, blockIndex) => (
          <View key={block.id} style={styles.blockContainer}>
            <View style={styles.blockHeader}>
              <TextInput style={styles.blockTitleInput} value={block.name} onChangeText={(name) => setBlocks(prev => prev.map((b, i) => i === blockIndex ? {...b, name} : b))} placeholder={`Block #${blockIndex + 1} Title`} placeholderTextColor="#8b949e" />
              <Text style={styles.blockDurationText}>{formatDuration(calculateBlockDuration(block))}</Text>
            </View>
            {(block.actions || []).map((action, actionIndex) => (
              <View key={action.id}>
                {renderActionItem(action, blockIndex, actionIndex)}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddActionPress(blockIndex)}>
              <Ionicons name="add" size={24} color="#58a6ff" />
              <Text style={styles.addButtonText}>Add Action</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewBlock}>
          <Ionicons name="add" size={24} color="#58a6ff" />
          <Text style={styles.addButtonText}>Add Block</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 30, marginBottom: 60 }}>
          <Button title="Save Routine" onPress={handleSave} color="#238636" />
        </View>
      </ScrollView>
      <ActionSheet isVisible={isActionSheetVisible} onClose={() => setIsActionSheetVisible(false)} onSelect={addActionToBlock} options={actionOptions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  scrollContainer: { padding: 20 },
  titleInput: { fontFamily: 'NunitoSans_700Bold', fontSize: 28, color: '#c9d1d9', borderBottomWidth: 1, borderColor: '#30363d', paddingBottom: 10, marginBottom: 30 },
  blockContainer: { backgroundColor: '#161b22', borderRadius: 5, padding: 15, marginBottom: 20 },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  blockTitleInput: { 
    fontFamily: 'NunitoSans_700Bold', 
    fontSize: 20, 
    color: '#c9d1d9',
    flex: 1,
  },
  blockDurationText: {
    fontFamily: 'NunitoSans_400Regular',
    color: '#8b949e',
    fontSize: 16,
    marginLeft: 10,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionIcon: { marginRight: 10 },
  actionInput: { fontFamily: 'NunitoSans_400Regular', borderWidth: 1, borderColor: '#30363d', backgroundColor: '#0d1117', paddingHorizontal: 10, paddingVertical: 5, fontSize: 16, borderRadius: 5, color: '#c9d1d9', minWidth: 40, textAlign: 'center' },
  actionUnit: { color: '#8b949e', marginLeft: 5 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginTop: 5 },
  addButtonText: { color: '#58a6ff', marginLeft: 5, fontSize: 16 },
  headerRightText: { fontFamily: 'NunitoSans_400Regular', color: '#8b949e', fontSize: 16 },
});
