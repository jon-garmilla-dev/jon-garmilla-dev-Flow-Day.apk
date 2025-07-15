import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActionSheet = ({ isVisible, onClose, onSelect, options }) => {
  // Use two separate animated values for opacity and transform
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isVisible) {
      // Animate overlay opacity and slide-up together
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 15,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  // If not visible, don't render anything to avoid capturing touches
  if (!isVisible) {
    return null;
  }

  return (
    // This is the main overlay that covers the whole screen
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* This TouchableOpacity allows closing the sheet by tapping the background */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill} // Make it fill the entire overlay
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* This is the animated container for the sheet content */}
      <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: slideAnim }] }]}>
        {/* This wrapper prevents taps inside the sheet from closing it */}
        <TouchableWithoutFeedback>
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
        </TouchableWithoutFeedback>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // This is crucial
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end', // Align content to the bottom
  },
  animatedContainer: {
    // No absolute positioning needed here, it's positioned by the overlay's justifyContent
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
    flex: 1,
    marginLeft: 15,
  },
  detailsText: {
    color: '#8b949e',
    fontSize: 16,
    marginRight: 15,
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 10,
    backgroundColor: '#21262d',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 10, // Add some space from the bottom edge
  },
  cancelText: {
    color: '#f0f6fc',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActionSheet;
