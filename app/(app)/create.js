import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { v4 as uuidv4 } from "uuid";

import Header from "../../src/components/Header";
import AlertModal from "../../src/components/modals/AlertModal";
import IconPickerModal from "../../src/components/modals/IconPickerModal";
import ActionSheet from "../../src/components/ui/ActionSheet";
import ColorPicker from "../../src/components/ui/ColorPicker";
import { theme, routineColors } from "../../src/constants/theme";
import useActionLibraryStore from "../../src/store/useActionLibraryStore";
import useBlockLibraryStore from "../../src/store/useBlockLibraryStore";
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

const calculateBlockDuration = (block) => {
  if (!block || !block.actions) return 0;
  return block.actions.reduce((blockSum, action) => {
    const durationInMinutes = Math.floor(
      (parseInt(action.duration, 10) || 0) / 60,
    );
    return blockSum + durationInMinutes;
  }, 0);
};

export default function CreateEditRoutineScreen() {
  const { routineId } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = React.useRef(null);
  const {
    addRoutine,
    updateRoutine,
    routines,
    reorderBlocks,
    reorderActions,
  } = useRoutineStore();
  const { selectedTemplateForRoutine, setSelectedTemplateForRoutine } =
    useActionLibraryStore();
  const { selectedBlockTemplate, setSelectedBlockTemplate } =
    useBlockLibraryStore();

  const [title, setTitle] = useState("");
  const [color, setColor] = useState(routineColors[0]);
  const [icon, setIcon] = useState("apps-outline");
  const [blocks, setBlocks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [targetBlockIndex, setTargetBlockIndex] = useState(null);
  const [isBlockIconPickerVisible, setBlockIconPickerVisible] = useState(false);
  const [isRoutineIconPickerVisible, setRoutineIconPickerVisible] =
    useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const routine = useMemo(
    () => routines.find((r) => r.id === routineId),
    [routineId, routines],
  );

  useEffect(() => {
    if (routine) {
      setTitle(routine.title);
      setColor(routine.color || routineColors[0]);
      setIcon(routine.icon || "apps-outline");
      setBlocks(routine.blocks || []);
      setIsEditing(true);
    }
  }, [routine]);

  const handleUpdateValue = (blockIndex, actionIndex, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].actions[actionIndex][field] = value;
    setBlocks(newBlocks);
  };

  const handleBlockIconPress = (blockIndex) => {
    setTargetBlockIndex(blockIndex);
    setBlockIconPickerVisible(true);
  };

  const handleSelectBlockIcon = (selectedIcon) => {
    if (targetBlockIndex === null) return;
    const newBlocks = [...blocks];
    newBlocks[targetBlockIndex].icon = selectedIcon;
    setBlocks(newBlocks);
  };

  const handleSelectRoutineIcon = (selectedIcon) => {
    setIcon(selectedIcon);
    setRoutineIconPickerVisible(false);
  };

  const handleAddActionPress = (blockIndex) => {
    setTargetBlockIndex(blockIndex);
    setIsActionSheetVisible(true);
  };

  const handleDeleteBlock = (blockIndex) => {
    const newBlocks = blocks.filter((_, i) => i !== blockIndex);
    setBlocks(newBlocks);
  };

  const handleDeleteAction = (blockIndex, actionIndex) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].actions = newBlocks[blockIndex].actions.filter(
      (_, i) => i !== actionIndex,
    );
    setBlocks(newBlocks);
  };

  const addActionToBlock = (type) => {
    if (targetBlockIndex === null) return;

    if (type === "from_library") {
      router.push("/actions/picker");
      return;
    }
    if (type === "from_block_library") {
      router.push("/actions/picker-block");
      return;
    }
    if (type === "new_template") {
      router.push("/actions/create");
      return;
    }

    const newBlocks = blocks.map((block, index) => {
      if (index !== targetBlockIndex) {
        return block;
      }
      const newActions = block.actions ? [...block.actions] : [];
      let newAction;
      switch (type) {
        case "text":
          newAction = {
            id: uuidv4(),
            name: "New Task",
            type: "task",
            icon: "document-text-outline",
            duration: 0,
            color: theme.colors.primary,
          };
          newActions.push(newAction);
          break;
        case "focus":
          newAction = {
            id: uuidv4(),
            name: "Focus Block",
            type: "timer",
            icon: "time-outline",
            duration: 300,
            color: "#8B5CF6",
          };
          newActions.push(newAction);
          break;
        case "pomodoro": {
          const workAction = {
            id: uuidv4(),
            name: "Work",
            type: "timer",
            icon: "briefcase-outline",
            duration: 1500, // 25 minutes
            color: theme.colors.primary,
          };
          const breakAction = {
            id: uuidv4(),
            name: "Break",
            type: "timer",
            icon: "cafe-outline",
            duration: 300, // 5 minutes
            color: theme.colors.success,
          };
          newActions.push(workAction, breakAction);
          break;
        }
        default:
          return block;
      }
      return { ...block, actions: newActions };
    });
    setBlocks(newBlocks);
  };

  const handleAddNewBlock = () => {
    const newBlockName = `Block #${blocks.length + 1}`;
    setBlocks([
      ...blocks,
      { id: uuidv4(), name: newBlockName, icon: "cube-outline", actions: [] },
    ]);
  };

  const handleSave = () => {
    if (title.trim() === "") {
      setAlertMessage("Please enter a routine title.");
      setAlertVisible(true);
      return;
    }

    if (isEditing) {
      updateRoutine(routineId, title, color, icon);
      reorderBlocks(routineId, blocks);
    } else {
      addRoutine(title, color, icon, blocks);
    }
    router.back();
  };

  const renderActionItem = ({ item: action, drag, isActive, getIndex }) => {
    const blockIndex = blocks.findIndex((b) => b.actions.includes(action));
    const actionIndex = getIndex();

    return (
      <View
        style={[
          styles.actionItemContainer,
          { backgroundColor: isActive ? theme.colors.surface : "transparent" },
        ]}
      >
        {isEditMode && (
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={styles.dragHandle}
            onPressIn={() => console.log("drag handle press in")}
            onPressOut={() => console.log("drag handle press out")}
          >
            <Ionicons
              name="reorder-two-outline"
              size={24}
              color={theme.colors.gray}
            />
          </TouchableOpacity>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPressIn={() => console.log("icon press in")}
            onPressOut={() => console.log("icon press out")}
          >
            <Ionicons
              name={action.icon || "document-text-outline"}
              size={20}
              color="#8b949e"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.actionInput, { flex: 1 }]}
            value={action.name}
            onChangeText={(val) =>
              handleUpdateValue(blockIndex, actionIndex, "name", val)
            }
            placeholder="Action name..."
            placeholderTextColor="#8b949e"
            selectTextOnFocus
          />
          {action.type === "timer" && (
            <>
              <TextInput
                style={[
                  styles.actionInput,
                  { minWidth: 50, flex: 0, marginLeft: 10 },
                ]}
                value={
                  action.duration ? String(Math.floor(action.duration / 60)) : ""
                }
                onChangeText={(val) => {
                  const newDuration =
                    val === "" ? null : (parseInt(val, 10) || 0) * 60;
                  handleUpdateValue(
                    blockIndex,
                    actionIndex,
                    "duration",
                    newDuration,
                  );
                }}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPressIn={() => console.log("min press in")}
                onPressOut={() => console.log("min press out")}
              >
                <Text style={styles.actionUnit}>min</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {isEditMode && (
          <TouchableOpacity
            onPress={() => handleDeleteAction(blockIndex, actionIndex)}
            style={styles.deleteButton}
            onPressIn={() => console.log("delete press in")}
            onPressOut={() => console.log("delete press out")}
          >
            <Ionicons
              name="remove-circle-outline"
              size={22}
              color={theme.colors.danger}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBlockItem = ({ item: block, drag, isActive, getIndex }) => {
    const blockIndex = getIndex();
    return (
      <View
        style={[
          styles.blockContainer,
          { backgroundColor: isActive ? "#20252c" : "#161b22" },
        ]}
      >
        <View style={styles.blockHeader}>
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
          <TouchableOpacity onPress={() => handleBlockIconPress(blockIndex)}>
            <Ionicons
              name={block.icon || "cube-outline"}
              size={24}
              color={color}
              style={styles.blockIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.blockTitleInput}
            value={block.name}
            onChangeText={(name) =>
              setBlocks((prev) =>
                prev.map((b, i) => (i === blockIndex ? { ...b, name } : b)),
              )
            }
            placeholder={`Block #${blockIndex + 1} Title`}
            placeholderTextColor="#8b949e"
            selectTextOnFocus
          />
          <Text style={styles.blockDurationText}>
            {formatDuration(calculateBlockDuration(block))}
          </Text>
          {isEditMode && (
            <TouchableOpacity
              onPress={() => handleDeleteBlock(blockIndex)}
              style={styles.deleteButton}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          )}
        </View>
        <DraggableFlatList
          data={block.actions || []}
          renderItem={renderActionItem}
          keyExtractor={(item) => `action-${item.id}`}
          dragEnabled={isEditMode}
          onDragEnd={({ data }) => {
            const newBlocks = blocks.map((b, i) => {
              if (i === blockIndex) {
                return { ...b, actions: data };
              }
              return b;
            });
            setBlocks(newBlocks);
            if (isEditing) {
              reorderActions(routineId, block.id, data);
            }
          }}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddActionPress(blockIndex)}
        >
          <Ionicons name="add" size={24} color="#58a6ff" />
          <Text style={styles.addButtonText}>Add Action</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const actionOptions = [
    {
      label: "From Action Library",
      value: "from_library",
      icon: "library-outline",
    },
    {
      label: "From Block Library",
      value: "from_block_library",
      icon: "layers-outline",
    },
    { label: "Simple Text", value: "text", icon: "document-text-outline" },
    { label: "Focus Block", value: "focus", icon: "time-outline" },
    { label: "Pomodoro", value: "pomodoro", icon: "hourglass-outline" },
  ];

  useFocusEffect(
    useCallback(() => {
      if (selectedTemplateForRoutine && targetBlockIndex !== null) {
        const newAction = { ...selectedTemplateForRoutine, id: uuidv4() };
        const newBlocks = blocks.map((block, index) => {
          if (index === targetBlockIndex) {
            return {
              ...block,
              actions: [...(block.actions || []), newAction],
            };
          }
          return block;
        });
        setBlocks(newBlocks);
        setSelectedTemplateForRoutine(null);
      }

      if (selectedBlockTemplate && targetBlockIndex !== null) {
        const actionsToAdd = selectedBlockTemplate.actions.map((action) => ({
          ...action,
          id: uuidv4(),
        }));
        const newBlocks = blocks.map((block, index) => {
          if (index === targetBlockIndex) {
            return {
              ...block,
              actions: [...(block.actions || []), ...actionsToAdd],
            };
          }
          return block;
        });
        setBlocks(newBlocks);
        setSelectedBlockTemplate(null);
      }
    }, [
      selectedTemplateForRoutine,
      selectedBlockTemplate,
      targetBlockIndex,
      setSelectedTemplateForRoutine,
      setSelectedBlockTemplate,
      blocks,
    ]),
  );

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? "Edit Routine" : "Create Routine"}
        leftElement={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity
            onPress={() => setIsEditMode(!isEditMode)}
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

      <DraggableFlatList
        ref={flatListRef}
        data={blocks}
        renderItem={renderBlockItem}
        keyExtractor={(item) => `block-${item.id}`}
        dragEnabled={isEditMode}
        onDragEnd={({ data }) => {
          setBlocks(data);
          if (isEditing) {
            reorderBlocks(routineId, data);
          }
        }}
        simultaneousHandlers={flatListRef}
        ListHeaderComponent={
          <>
            <View style={styles.titleContainer}>
              <TouchableOpacity
                onPress={() => setRoutineIconPickerVisible(true)}
              >
                <Ionicons
                  name={icon}
                  size={32}
                  color={color}
                  style={styles.routineIcon}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor="#8b949e"
                selectTextOnFocus
              />
            </View>
            <ColorPicker selectedColor={color} onSelectColor={setColor} />
          </>
        }
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNewBlock}
            >
              <Ionicons name="add" size={24} color="#58a6ff" />
              <Text style={styles.addButtonText}>Add Block</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 30, marginBottom: 60 }}>
              <Button
                title="Save Routine"
                onPress={handleSave}
                color="#238636"
              />
            </View>
          </>
        }
        contentContainerStyle={styles.scrollContainer}
      />
      <ActionSheet
        isVisible={isActionSheetVisible}
        onClose={() => setIsActionSheetVisible(false)}
        onSelect={addActionToBlock}
        options={actionOptions}
      />
      <AlertModal
        visible={isAlertVisible}
        onClose={() => setAlertVisible(false)}
        title="Incomplete Routine"
        message={alertMessage}
      />
      <IconPickerModal
        visible={isRoutineIconPickerVisible}
        onClose={() => setRoutineIconPickerVisible(false)}
        onSelectIcon={handleSelectRoutineIcon}
      />
      <IconPickerModal
        visible={isBlockIconPickerVisible}
        onClose={() => setBlockIconPickerVisible(false)}
        onSelectIcon={handleSelectBlockIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  scrollContainer: { padding: 20 },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#30363d",
    marginBottom: 20,
  },
  routineIcon: {
    marginRight: theme.layout.spacing.md,
    paddingBottom: 10,
  },
  titleInput: {
    fontFamily: "NunitoSans_700Bold",
    fontSize: 28,
    color: "#c9d1d9",
    flex: 1,
    paddingBottom: 10,
  },
  blockContainer: {
    backgroundColor: "#161b22",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  blockIcon: {
    marginRight: theme.layout.spacing.sm,
  },
  blockTitleInput: {
    fontFamily: "NunitoSans_700Bold",
    fontSize: 20,
    color: "#c9d1d9",
    flex: 1,
  },
  blockDurationText: {
    fontFamily: "NunitoSans_400Regular",
    color: "#8b949e",
    fontSize: 16,
    marginLeft: 10,
  },
  actionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionIcon: { marginRight: 10 },
  actionInput: {
    fontFamily: "NunitoSans_400Regular",
    borderWidth: 1,
    borderColor: "#30363d",
    backgroundColor: "#0d1117",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    borderRadius: 5,
    color: "#c9d1d9",
    textAlign: "left",
  },
  actionUnit: { color: "#8b949e", marginLeft: 5 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 5,
  },
  addButtonText: { color: "#58a6ff", marginLeft: 5, fontSize: 16 },
  headerRightText: {
    fontFamily: "NunitoSans_400Regular",
    color: "#8b949e",
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  dragHandle: {
    marginRight: 10,
  },
});
