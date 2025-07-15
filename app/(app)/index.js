import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import Header from "../../src/components/Header";
import { usePageLayout } from "../../src/components/layout/PageLayout";
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

  return (
    <View
      style={[
        styles.itemContainer,
        { backgroundColor: isActive ? theme.colors.surface : "transparent" },
      ]}
    >
      {isEditMode && (
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={styles.dragHandle}
        >
          <Ionicons
            name="reorder-three-outline"
            size={32}
            color={theme.colors.gray}
          />
        </TouchableOpacity>
      )}

      <Link href={`/routine/${item.id}`} asChild>
        <TouchableOpacity style={styles.mainContent}>
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
        {isEditMode ? (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons
              name="remove-circle-outline"
              size={28}
              color={theme.colors.danger}
            />
          </TouchableOpacity>
        ) : (
          <>
            {totalMinutes > 0 && (
              <Text style={styles.durationText}>
                {formatDuration(totalMinutes)}
              </Text>
            )}
            <Link href={`/create?routineId=${item.id}`} asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={theme.colors.gray}
                />
              </TouchableOpacity>
            </Link>
          </>
        )}
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

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    setLocalRoutines(routines);
  }, [routines]);

  const handleDeletePress = (routine) => {
    Alert.alert(
      "Delete Workflow",
      `Are you sure you want to delete "${routine.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRoutine(routine.id),
        },
      ],
    );
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
          <TouchableOpacity onPress={openMenu}>
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={() => setEditMode(!isEditMode)}>
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
});
