import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import Header from "../../../src/components/Header";
import { theme } from "../../../src/constants/theme";
import useProgressStore from "../../../src/store/useProgressStore";
import useRoutineStore from "../../../src/store/useRoutineStore";

const ActionBubbles = ({ actions, actionStatuses }) => (
  <View style={styles.actionBubblesContainer}>
    {actions.slice(0, 7).map((action) => {
      // Show up to 7 icons
      const status = actionStatuses[action.id];

      const isCompleted = status === "completed";
      const isActive = status === "active";

      let iconName = action.icon || "ellipse-outline";
      if (isCompleted && iconName.endsWith("-outline")) {
        iconName = iconName.replace("-outline", "");
      }

      const iconColor = isCompleted
        ? theme.colors.success
        : isActive
          ? theme.colors.primary
          : theme.colors.gray;

      return (
        <View key={action.id} style={styles.actionBubble}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
      );
    })}
    {actions.length > 7 && <Text style={styles.actionBubbleText}>...</Text>}
  </View>
);

const BlockRow = ({ routine, block, status, actionStatuses }) => {
  const router = useRouter();
  const scaleCheck = useSharedValue(0);
  const pulseOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (status === "completed") {
      scaleCheck.value = withSpring(1, { damping: 15, stiffness: 120 });
    } else {
      scaleCheck.value = 0;
    }

    if (status === "active") {
      pulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 2000 }),
        -1,
        true,
      );
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 2000 }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = withTiming(0);
      pulseScale.value = withTiming(1);
    }
  }, [status]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCheck.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return (
          <Animated.View style={animatedCheckStyle}>
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={theme.colors.success}
            />
          </Animated.View>
        );
      case "active":
        return (
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
            <Ionicons
              name="play-circle"
              size={28}
              color={theme.colors.primary}
            />
          </View>
        );
      default:
        return (
          <View style={styles.iconContainer}>
            <Ionicons
              name="ellipse-outline"
              size={28}
              color={theme.colors.gray}
            />
          </View>
        );
    }
  };

  const calculateBlockDuration = () => {
    const totalSeconds = block.actions.reduce((sum, action) => {
      return action.type === "timer" && action.duration
        ? sum + action.duration
        : sum;
    }, 0);

    if (totalSeconds === 0) return null;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (seconds === 0) return `${minutes}m`;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const duration = calculateBlockDuration();

  const handlePress = () => {
    router.push({
      pathname: `/routine/${routine.id}/run`,
      params: { blockId: block.id },
    });
  };

  return (
    <TouchableOpacity style={styles.blockRow} onPress={handlePress}>
      <View style={styles.blockInfo}>
        <View style={styles.blockTitleContainer}>
          {getStatusIcon()}
          <Text style={styles.blockTitle}>{block.name}</Text>
        </View>
        {duration && (
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>
      <ActionBubbles actions={block.actions} actionStatuses={actionStatuses} />
    </TouchableOpacity>
  );
};

export default function RoutineScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines, loadRoutines } = useRoutineStore();
  const { progress, actions, loadProgress, resetProgress } = useProgressStore();

  const routine = routines.find((r) => r.id === id);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    if (routine) {
      loadProgress(routine);
    }
  }, [routine, loadProgress]);

  return (
    <View style={styles.container}>
      <Header
        title={routine?.title || "Routine"}
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity
            onPress={() => resetProgress(routine)}
            style={styles.headerButton}
          >
            <Ionicons name="refresh" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={routine?.blocks || []}
        renderItem={({ item }) => (
          <BlockRow
            routine={routine}
            block={item}
            status={progress[item.id]}
            actionStatuses={actions}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: theme.layout.spacing.md,
  },
  headerEditText: {
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
  },
  blockRow: {
    padding: theme.layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  blockInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.layout.spacing.md,
  },
  blockTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    marginLeft: theme.layout.spacing.md,
    color: theme.colors.text,
  },
  actionBubblesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBubble: {
    marginRight: theme.layout.spacing.sm,
  },
  actionBubbleText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.fonts.bold,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  durationText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.fonts.bold,
    fontSize: 12,
    marginLeft: 4,
  },
  addBlockFab: {
    position: "absolute",
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    backgroundColor: theme.colors.primary,
  },
});
