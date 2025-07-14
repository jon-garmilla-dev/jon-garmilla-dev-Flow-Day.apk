import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import CustomDrawerContent from '../navigation/CustomDrawerContent';

const { width: screenWidth } = Dimensions.get('window');
const menuWidth = screenWidth * 0.75;

const SideMenu = forwardRef(({ isOpen, isPreviewing, onClose }, ref) => {
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const isDragging = useRef(false);

  useImperativeHandle(ref, () => ({
    setSmoothPosition: (progress, dx) => {
      isDragging.current = true;
      const targetPosition = -menuWidth + (menuWidth * progress);
      slideAnim.setValue(targetPosition);
    },
    stopDragging: () => {
      isDragging.current = false;
    }
  }));

  useEffect(() => {
    if (isDragging.current) return;

    if (isOpen && !isPreviewing) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else if (!isOpen && !isPreviewing) {
      Animated.spring(slideAnim, {
        toValue: -menuWidth,
        tension: 100,
        friction: 15,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, isPreviewing, slideAnim]);

  return (
    <Modal
      visible={isOpen || isPreviewing}
      transparent={true}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <CustomDrawerContent navigation={{ closeDrawer: onClose }} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: menuWidth,
    height: '100%',
    backgroundColor: '#0d1117',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default SideMenu;
