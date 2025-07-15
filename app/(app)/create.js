import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import useRoutineStore from '../../src/store/useRoutineStore';
import useActionLibraryStore from '../../src/store/useActionLibraryStore';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, routineColors } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import ActionSheet from '../../src/components/ui/ActionSheet';
import IconPickerModal from '../../src/components/modals/IconPickerModal';
import ColorPicker from '../../src/components/ui/ColorPicker';
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
    const durationInMinutes = Math.floor((parseInt(action.duration, 10) || 0) / 60);
    return blockSum + durationInMinutes;
  }, 0);
};

export default function CreateEditRoutineScreen() {
  const { routineId } = useLocalSearchParams();
  const router = useRouter();
  const { addRoutine, updateRoutine, routines, addBlock, addAction } = useRoutineStore();
  const { selectedTemplateForRoutine, setSelectedTemplateForRoutine } = useActionLibraryStore();

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(routineColors[0]);
  const [icon, setIcon] = useState('apps-outline');
  const [blocks, setBlocks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [targetBlockIndex, setTargetBlockIndex] = useState(null);
  const [isBlockIconPickerVisible, setBlockIconPickerVisible] = useState(false);
  const [isRoutineIconPickerVisible, setRoutineIconPickerVisible] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);

  useEffect(() => {
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setTitle(routine.title);
        setColor(routine.color || routineColors[0]);
        setIcon(routine.icon || 'apps-outline');
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

  const handleBlockIconPress = (blockIndex) => {
    setTargetBlockIndex(blockIndex);
    setBlockIconPickerVisible(true);
  };

  const handleSelectBlockIcon = (selectedIcon) => {
    if (targetBlockIndex === null) return;
    const newBlocks = [...blocks];
    newBlocks[targetBlockIndex].icon = selectedIcon;
    setBlocks(newBlocks);
  };

  const handleSelectRoutineIcon = (selectedIcon) => {
    setIcon(selectedIcon);
    setRoutineIconPickerVisible(false);
  };

  const handleAddActionPress = (blockIndex) => {
    setTargetBlockIndex(blockIndex);
    setIsActionSheetVisible(true);
  };

  const handleDeleteBlock = (blockIndex) => {
    const newBlocks = blocks.filter((_, i) => i !== blockIndex);
    setBlocks(newBlocks);
  };

  const handleDeleteAction = (blockIndex, actionIndex) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].actions = newBlocks[blockIndex].actions.filter((_, i) => i !== actionIndex);
    setBlocks(newBlocks);
  };

  const addActionToBlock = (type) => {
    if (targetBlockIndex === null) return;

    if (type === 'from_library') {
      router.push('/actions/picker');
      return;
    }
    if (type === 'new_template') {
      router.push('/actions/create');
      return;
    }

    const newBlocks = [...blocks];
    let newAction;
    switch (type) {
      case 'text':
        newAction = { id: uuidv4(), name: 'New Task', type: 'task', icon: 'document-text-outline', duration: 0 };
        break;
      case 'focus':
        newAction = { id: uuidv4(), name: 'Focus Block', type: 'timer', icon: 'time-outline', duration: 300 };
        break;
      case 'pomodoro':
        newAction = { id: uuidv4(), name: 'Pomodoro', type: 'timer', icon: 'hourglass-outline', duration: 1500 };
        break;
      default:
        return;
    }
    if (!newBlocks[targetBlockIndex].actions) {
      newBlocks[targetBlockIndex].actions = [];
    }
    newBlocks[targetBlockIndex].actions.push(newAction);
    setBlocks(newBlocks);
  };

  const handleAddNewBlock = () => {
    setBlocks([...blocks, { id: uuidv4(), name: '', icon: 'cube-outline', actions: [] }]);
  };

  const handleSave = () => {
    if (title.trim() === '') {
      alert('Please enter a routine title.');
      return;
    }

    if (isEditing) {
      updateRoutine(routineId, title, color, icon);
    } else {
      const newRoutineId = addRoutine(title, color, icon);
      blocks.forEach(block => {
        if (block.name.trim() !== '') {
          const { id: tempBlockId, ...blockData } = block;
          const newBlockId = addBlock(newRoutineId, blockData);
          (block.actions || []).forEach(action => {
            const { id, ...actionData } = action;
            addAction(newRoutineId, newBlockId, actionData);
          });
        }
      });
    }
    router.back();
  };

  const renderActionItem = (action, blockIndex, actionIndex) => {
    const icon = action.icon || 'document-text-outline';
    const name = action.name || '';
    const durationInSeconds = action.duration || 0;
    
    return (
      <View style={styles.actionRow}>
        <Ionicons name={icon} size={20} color="#8b949e" style={styles.actionIcon} />
        <TextInput 
          style={[styles.actionInput, {flex: 1}]} 
          value={name} 
          onChangeText={(val) => handleUpdateValue(blockIndex, actionIndex, 'name', val)} 
          placeholder="Action name..." 
          placeholderTextColor="#8b949e" 
        />
        {durationInSeconds > 0 && (
          <>
            <TextInput 
              style={[styles.actionInput, {minWidth: 50, flex: 0, marginLeft: 10}]} 
              value={String(Math.floor(durationInSeconds / 60))} 
              onChangeText={(val) => handleUpdateValue(blockIndex, actionIndex, 'duration', (parseInt(val, 10) || 0) * 60)} 
              keyboardType="numeric" 
            />
            <Text style={styles.actionUnit}>min</Text>
          </>
        )}
      </View>
    );
  };

  const actionOptions = [
    { label: 'From Library', value: 'from_library', icon: 'library-outline' },
    { label: 'New Library Action', value: 'new_template', icon: 'add-circle-outline' },
    { label: 'Simple Text', value: 'text', icon: 'document-text-outline' },
    { label: 'Focus Block', value: 'focus', icon: 'time-outline' },
    { label: 'Pomodoro', value: 'pomodoro', icon: 'hourglass-outline' },
  ];

  useFocusEffect(
    useCallback(() => {
      if (selectedTemplateForRoutine && targetBlockIndex !== null) {
        const newBlocks = [...blocks];
        const newAction = { ...selectedTemplateForRoutine, id: uuidv4() };
        if (!newBlocks[targetBlockIndex].actions) {
          newBlocks[targetBlockIndex].actions = [];
        }
        newBlocks[targetBlockIndex].actions.push(newAction);
        setBlocks(newBlocks);
        setSelectedTemplateForRoutine(null);
      }
    }, [selectedTemplateForRoutine])
  );

  return (
    <View style={styles.container}>
      <IconPickerModal
        visible={isRoutineIconPickerVisible}
        onClose={() => setRoutineIconPickerVisible(false)}
        onSelectIcon={handleSelectRoutineIcon}
      />
      <IconPickerModal 
        visible={isBlockIconPickerVisible}
        onClose={() => setBlockIconPickerVisible(false)}
        onSelectIcon={handleSelectBlockIcon}
      />
      <Header title={isEditing ? "Edit Routine" : "Create Routine"} leftElement={<TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#c9d1d9" /></TouchableOpacity>} rightElement={<Text style={styles.headerRightText}>{formatDuration(totalRoutineDuration)}</Text>} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => setRoutineIconPickerVisible(true)}>
            <Ionicons name={icon} size={32} color={color} style={styles.routineIcon} />
          </TouchableOpacity>
          <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#8b949e" />
        </View>
        <ColorPicker selectedColor={color} onSelectColor={setColor} />
        {blocks.map((block, blockIndex) => {
          const isBlockInEditMode = editingBlockId === block.id;
          return (
            <View key={block.id} style={styles.blockContainer}>
              <View style={styles.blockHeader}>
                <TouchableOpacity onPress={() => handleBlockIconPress(blockIndex)}>
                  <Ionicons name={block.icon || 'cube-outline'} size={24} color={color} style={styles.blockIcon} />
                </TouchableOpacity>
                <TextInput style={styles.blockTitleInput} value={block.name} onChangeText={(name) => setBlocks(prev => prev.map((b, i) => i === blockIndex ? {...b, name} : b))} placeholder={`Block #${blockIndex + 1} Title`} placeholderTextColor="#8b949e" />
                <Text style={styles.blockDurationText}>{formatDuration(calculateBlockDuration(block))}</Text>
                <TouchableOpacity onPress={() => setEditingBlockId(isBlockInEditMode ? null : block.id)} style={styles.deleteButton}>
                  <Ionicons name={isBlockInEditMode ? "checkmark-done" : "pencil"} size={22} color={theme.colors.gray} />
                </TouchableOpacity>
                {isBlockInEditMode && (
                  <TouchableOpacity onPress={() => handleDeleteBlock(blockIndex)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              {(block.actions || []).map((action, actionIndex) => (
                <View key={action.id} style={styles.actionItemContainer}>
                  {renderActionItem(action, blockIndex, actionIndex)}
                  {isBlockInEditMode && (
                    <TouchableOpacity onPress={() => handleDeleteAction(blockIndex, actionIndex)} style={styles.deleteButton}>
                      <Ionicons name="remove-circle-outline" size={22} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddActionPress(blockIndex)}>
                <Ionicons name="add" size={24} color="#58a6ff" />
                <Text style={styles.addButtonText}>Add Action</Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#30363d',
    marginBottom: 20,
  },
  routineIcon: {
    marginRight: theme.layout.spacing.md,
    paddingBottom: 10,
  },
  titleInput: { 
    fontFamily: 'NunitoSans_700Bold', 
    fontSize: 28, 
    color: '#c9d1d9', 
    flex: 1,
    paddingBottom: 10,
  },
  blockContainer: { backgroundColor: '#161b22', borderRadius: 5, padding: 15, marginBottom: 20 },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  blockIcon: {
    marginRight: theme.layout.spacing.sm,
  },
  blockTitleInput: { fontFamily: 'NunitoSans_700Bold', fontSize: 20, color: '#c9d1d9', flex: 1 },
  blockDurationText: { fontFamily: 'NunitoSans_400Regular', color: '#8b949e', fontSize: 16, marginLeft: 10 },
  actionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 10,
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: { marginRight: 10 },
  actionInput: { fontFamily: 'NunitoSans_400Regular', borderWidth: 1, borderColor: '#30363d', backgroundColor: '#0d1117', paddingHorizontal: 10, paddingVertical: 5, fontSize: 16, borderRadius: 5, color: '#c9d1d9', textAlign: 'left' },
  actionUnit: { color: '#8b949e', marginLeft: 5 },
  pomodoroLabel: { color: '#c9d1d9', marginRight: 10, fontSize: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginTop: 5 },
  addButtonText: { color: '#58a6ff', marginLeft: 5, fontSize: 16 },
  headerRightText: { fontFamily: 'NunitoSans_400Regular', color: '#8b949e', fontSize: 16 },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
});
