import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Button,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import DraggableFlatList from "react-native-draggable-flatlist";

import Header from "../../src/components/Header";
import CompletionAnimation from "../../src/components/animations/CompletionAnimation";
import { usePageLayout } from "../../src/components/layout/PageLayout";
import ConfirmModal from "../../src/components/modals/ConfirmModal";
import { theme } from "../../src/constants/theme";
import useRoutineStore from "../../src/store/useRoutineStore";

const formatDuration = (totalMinutes) => {
  if (totalMinutes === 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let duration = "";
  if (hours > 0) duration += `${hours}h `;
  if (minutes > 0) duration += `${minutes}m`;
  return duration.trim();
};

const calculateRoutineDuration = (routine) => {
  if (!routine || !routine.blocks) return 0;
  return routine.blocks.reduce((total, block) => {
    const blockTotal = (block.actions || []).reduce((blockSum, action) => {
      return blockSum + (action.duration || 0); // Now uses seconds
    }, 0);
    return total + blockTotal;
  }, 0);
};

const RoutineRow = ({ item, drag, isActive, isEditMode, onDelete }) => {
  const totalSeconds = calculateRoutineDuration(item);
  const totalMinutes = Math.floor(totalSeconds / 60);

  if (isEditMode) {
    return (
      <View
        style={[
          styles.itemContainer,
          styles.editModeItemContainer,
          { backgroundColor: isActive ? theme.colors.surface : "transparent" },
        ]}
      >
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={styles.editDragHandle}
        >
          <Ionicons
            name="reorder-three-outline"
            size={32}
            color={theme.colors.gray}
          />
        </TouchableOpacity>
        <View style={styles.editMainContent}>
          <Ionicons
            name={item.icon || "apps-outline"}
            size={28}
            color={item.color || theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.editDeleteButton}>
          <Ionicons
            name="remove-circle-outline"
            size={28}
            color={theme.colors.danger}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.itemContainer}>
      <Link href={`/routine/${item.id}`} asChild>
        <TouchableOpacity
          style={styles.mainContent}
          hitSlop={{ top: 20, bottom: 20, left: 5, right: 5 }}
        >
          <Ionicons
            name={item.icon || "apps-outline"}
            size={28}
            color={item.color || theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.itemTitle}>{item.title}</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.rightContainer}>
        {totalMinutes > 0 && (
          <Text style={styles.durationText}>
            {formatDuration(totalMinutes)}
          </Text>
        )}
        <Link href={`/create?routineId=${item.id}`} asChild>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={theme.colors.gray}
            />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default function RoutineListScreen() {
  const { routines, loadRoutines, deleteRoutine, reorderRoutines } =
    useRoutineStore();
  const { openMenu } = usePageLayout();
  const [isEditMode, setEditMode] = useState(false);
  const [localRoutines, setLocalRoutines] = useState(routines);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [isAnimationVisible, setAnimationVisible] = useState(false);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    setLocalRoutines(routines);
  }, [routines]);

  const handleDeletePress = (routine) => {
    setSelectedRoutine(routine);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedRoutine) {
      deleteRoutine(selectedRoutine.id);
      setModalVisible(false);
      setSelectedRoutine(null);
    }
  };

  const cancelDelete = () => {
    setModalVisible(false);
    setSelectedRoutine(null);
  };

  const renderItem = ({ item, drag, isActive }) => (
    <RoutineRow
      item={item}
      drag={drag}
      isActive={isActive}
      isEditMode={isEditMode}
      onDelete={() => handleDeletePress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title="Flow Day"
        leftElement={
          <TouchableOpacity
            onPress={openMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity
            onPress={() => setEditMode(!isEditMode)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isEditMode ? "checkmark-done" : "pencil"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        }
      />
      {localRoutines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Link href="/create" asChild>
            <TouchableOpacity>
              <Ionicons
                name="add-circle-outline"
                size={100}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </Link>
          <Text style={styles.emptyText}>Create your first workflow</Text>
        </View>
      ) : isEditMode ? (
        <DraggableFlatList
          data={localRoutines}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => {
            setLocalRoutines(data);
            reorderRoutines(data);
          }}
        />
      ) : (
        <FlatList
          data={localRoutines}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
      <ConfirmModal
        visible={isModalVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${selectedRoutine?.title}"? This cannot be undone.`}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAnimationVisible}
        onRequestClose={() => {
          setAnimationVisible(!isAnimationVisible);
        }}
      >
        <CompletionAnimation onAnimationEnd={() => setAnimationVisible(false)} />
      </Modal>
      <View style={styles.testButtonContainer}>
        <Button
          title="Test Animation"
          onPress={() => setAnimationVisible(true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: theme.layout.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    flex: 1,
  },
  icon: {
    marginRight: theme.layout.spacing.md,
  },
  dragHandle: {
    paddingRight: theme.layout.spacing.md,
  },
  durationText: {
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.gray,
    fontSize: theme.typography.fontSizes.md,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: theme.layout.spacing.md,
    padding: theme.layout.spacing.xs,
  },
  deleteButton: {
    paddingLeft: theme.layout.spacing.md,
  },
  editModeItemContainer: {
    padding: 0,
  },
  editDragHandle: {
    flex: 0.15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.layout.spacing.lg,
    paddingLeft: theme.layout.spacing.lg,
  },
  editMainContent: {
    flex: 0.7,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.layout.spacing.lg,
    paddingHorizontal: theme.layout.spacing.md,
  },
  editDeleteButton: {
    flex: 0.15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.layout.spacing.lg,
    paddingRight: theme.layout.spacing.lg,
  },
  testButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  animationText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginTop: 20,
  },
});
