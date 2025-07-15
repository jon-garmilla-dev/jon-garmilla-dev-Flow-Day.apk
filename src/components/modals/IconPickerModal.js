import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const iconList = [
  'barbell', 'bicycle', 'body', 'walk', 'water', 'restaurant', 'nutrition',
  'book', 'briefcase', 'build', 'business', 'cafe', 'call', 'chatbubbles',
  'code-slash', 'color-palette', 'compass', 'construct', 'desktop', 'earth',
  'fast-food', 'film', 'flag', 'flask', 'football', 'game-controller',
  'gift', 'golf', 'headset', 'heart', 'home', 'hourglass', 'ice-cream',
  'image', 'journal', 'key', 'laptop', 'leaf', 'library', 'lock-closed',
  'mail', 'map', 'medal', 'medkit', 'moon', 'musical-notes', 'paw',
  'pencil', 'people', 'pizza', 'planet', 'pulse', 'rocket', 'school',
  'shirt', 'storefront', 'sunny', 'trophy', 'videocam', 'wallet', 'watch'
];

const IconPickerModal = ({ visible, onClose, onSelectIcon }) => {
  const slideAnim = useRef(new Animated.Value(600)).current; // Start from below screen

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 15,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPress={onClose}>
        <Animated.View 
          style={[styles.modalView, { transform: [{ translateY: slideAnim }] }]}
          // To prevent the TouchableOpacity from triggering onClose when tapping inside the modal
          onStartShouldSetResponder={() => true} 
        >
          <Text style={styles.modalTitle}>Choose an Icon</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close" size={32} color={theme.colors.gray} />
          </TouchableOpacity>
          <ScrollView>
            <View style={styles.iconGrid}>
              {iconList.map(iconName => (
                <TouchableOpacity 
                  key={iconName} 
                  style={styles.iconContainer} 
                  onPress={() => {
                    onSelectIcon(iconName);
                    onClose();
                  }}
                >
                  <Ionicons name={iconName} size={32} color={theme.colors.text} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    height: '60%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.layout.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.layout.spacing.md,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: theme.layout.spacing.md,
    margin: theme.layout.spacing.xs,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
  },
});

export default IconPickerModal;
