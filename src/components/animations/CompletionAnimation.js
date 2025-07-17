import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { theme } from "../../constants/theme";

export default function CompletionAnimation({ onAnimationEnd }) {
  const animationProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [{ scale: animationProgress.value }],
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationProgress.value, [0.8, 1], [0, 1]),
    };
  });

  useEffect(() => {
    animationProgress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, [animationProgress]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Ionicons name="trophy" size={100} color={theme.colors.success} />
        <Text style={styles.text}>Block Complete!</Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <TouchableOpacity style={styles.completeButton} onPress={onAnimationEnd}>
          <Ionicons
            name="checkmark-done"
            size={40}
            color={theme.colors.background}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  content: {
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
