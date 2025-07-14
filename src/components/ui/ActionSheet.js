import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActionSheet = ({ isVisible, onClose, onSelect, options }) => {
  const slideAnim = useRef(new Animated.Value(400)).current; // Empezar desde abajo

  useEffect(() => {
    console.log(`ACTION_SHEET: Visibility changed to: ${isVisible}`);
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 15,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: slideAnim }] }]}>
          <SafeAreaView>
            <View style={styles.container}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, index === options.length - 1 && styles.lastOption]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Ionicons name={option.icon} size={24} color="#8b949e" />
                  <Text style={styles.optionText}>{option.label}</Text>
                  {option.details && <Text style={styles.detailsText}>{option.details}</Text>}
                  <Ionicons name="ellipsis-horizontal" size={24} color="#8b949e" />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.optionText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  animatedContainer: {
    width: '100%',
  },
  container: {
    backgroundColor: '#21262d',
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    color: '#c9d1d9',
    fontSize: 18,
    flex: 1, // Para que ocupe el espacio
    marginLeft: 15,
  },
  detailsText: {
    color: '#8b949e',
    fontSize: 16,
    marginRight: 15,
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#21262d',
    borderRadius: 12,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#f0f6fc',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActionSheet;
