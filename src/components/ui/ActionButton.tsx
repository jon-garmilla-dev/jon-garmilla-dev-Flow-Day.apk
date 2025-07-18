import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

interface ActionItem {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  path: string;
}

interface ActionButtonProps {
  activeTab?: 'actions' | 'blocks';
}

const ActionButton: React.FC<ActionButtonProps> = ({ activeTab }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const isActionsScreen = pathname === '/actions';

  const actions: ActionItem[] = [
    { icon: 'library', text: 'Action Library', path: '/actions' },
    { icon: 'add', text: 'Add Workflow', path: '/create' },
  ];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 9,
      tension: 70,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    if (isOpen) {
      toggleMenu();
    }
    router.push(path);
  };

  // --- Render logic for Actions screen ---
  if (isActionsScreen) {
    const path = activeTab === 'blocks' ? '/actions/create-block' : '/actions/create';
    return (
      <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={() => router.push(path)}>
          <View style={[styles.button, styles.menu]}>
            <Ionicons name="add" size={24} color={theme.colors.background} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Render logic for Home screen (expanding FAB) ---
  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const getActionStyle = (index: number) => ({
    opacity: animation,
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70 * (index + 1)],
        }),
      },
    ],
  });

  const overlayOpacity = {
    opacity: animation,
  };

  return (
    <View style={styles.rootContainer} pointerEvents={isOpen ? 'auto' : 'box-none'}>
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu} accessible={false}>
          <Animated.View style={[styles.overlay, overlayOpacity]} />
        </TouchableWithoutFeedback>
      )}
      <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.path}
            style={[styles.actionContainer, getActionStyle(index)]}
          >
            <TouchableOpacity onPress={() => handleNavigation(action.path)}>
              <View style={[styles.button, styles.secondaryButton]}>
                <Ionicons name={action.icon} size={20} color={theme.colors.text} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Animated.View style={[styles.button, styles.menu, rotation]}>
            <Ionicons name="add" size={24} color={theme.colors.background} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
    alignItems: 'center',
  },
  actionContainer: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { height: 5, width: 0 },
    elevation: 5,
  },
  menuButton: {
    marginTop: 10,
  },
  menu: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
  },
});

export default ActionButton;
