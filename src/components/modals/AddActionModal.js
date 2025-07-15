import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const AddActionModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('barbell-outline');
  const [type, setType] = useState('task'); // 'task' or 'timer'
  const [duration, setDuration] = useState(''); // in seconds

  const handleSave = () => {
    if (!name) return;
    onSave({
      name,
      icon,
      type,
      duration: type === 'timer' ? parseInt(duration, 10) || 0 : null,
    });
    // Reset state
    setName('');
    setIcon('barbell-outline');
    setType('task');
    setDuration('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Action</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Action Name (e.g., '20 push-ups')"
            placeholderTextColor={theme.colors.gray}
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Icon Name (e.g., 'barbell-outline')"
            placeholderTextColor={theme.colors.gray}
            value={icon}
            onChangeText={setIcon}
          />

          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'task' && styles.typeButtonSelected]} 
              onPress={() => setType('task')}
            >
              <Text style={styles.typeButtonText}>Task</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'timer' && styles.typeButtonSelected]} 
              onPress={() => setType('timer')}
            >
              <Text style={styles.typeButtonText}>Timer</Text>
            </TouchableOpacity>
          </View>

          {type === 'timer' && (
            <TextInput
              style={styles.input}
              placeholder="Duration (in seconds)"
              placeholderTextColor={theme.colors.gray}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Action</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close" size={32} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.layout.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.layout.spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 15,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.layout.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: theme.layout.spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  typeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fonts.bold,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.background,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
});

export default AddActionModal;
