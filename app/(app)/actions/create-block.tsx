import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { v4 as uuidv4 } from "uuid";

import Header from "../../../src/components/Header";
import IconPickerModal from "../../../src/components/modals/IconPickerModal";
import ActionSheet from "../../../src/components/ui/ActionSheet";
import { theme } from "../../../src/constants/theme";
import useActionLibraryStore from "../../../src/store/useActionLibraryStore";
import useBlockLibraryStore from "../../../src/store/useBlockLibraryStore";
import { Action } from "../../../src/types";

const ActionRow: React.FC<{
  item: Action;
  isEditMode: boolean;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
  onUpdate: (field: keyof Action, value: any) => void;
}> = ({ item, isEditMode, onDelete, drag, isActive, onUpdate }) => {
  return (
    <View style={[styles.actionItemContainer, { backgroundColor: isActive ? theme.colors.surface : "transparent" }]}>
      {isEditMode && (
        <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.dragHandle}>
          <Ionicons name="reorder-two-outline" size={24} color={theme.colors.gray} />
        </TouchableOpacity>
      )}
      <View style={styles.actionRow}>
        <Ionicons name={item.icon as any || "ellipse-outline"} size={20} color={theme.colors.gray} style={styles.actionIcon} />
        <TextInput
          style={[styles.actionInput, { flex: 1 }]}
          value={item.name}
          onChangeText={(val) => onUpdate('name', val)}
          placeholder="Action name..."
          placeholderTextColor="#8b949e"
        />
        {item.type === "timer" && (
          <>
            <TextInput
              style={[styles.actionInput, { minWidth: 50, flex: 0, marginLeft: 10 }]}
              value={item.duration ? String(Math.floor(item.duration / 60)) : ""}
              onChangeText={(val) => {
                const newDuration = val === "" ? 0 : (parseInt(val, 10) || 0) * 60;
                onUpdate('duration', newDuration);
              }}
              keyboardType="numeric"
            />
            <Text style={styles.actionUnit}>min</Text>
          </>
        )}
      </View>
      {isEditMode && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="remove-circle-outline" size={22} color={theme.colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function CreateBlockTemplateScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const { addBlockTemplate, updateBlockTemplate, blockTemplates } = useBlockLibraryStore();
  const { selectedTemplateForRoutine, setSelectedTemplateForRoutine } = useActionLibraryStore();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("cube-outline");
  const [actions, setActions] = useState<Action[]>([]);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (templateId) {
      const template = blockTemplates.find(t => t.id === templateId);
      if (template) {
        setName(template.name);
        setIcon(template.icon || "cube-outline");
        setActions(template.actions || []);
        setIsEditing(true);
      }
    }
  }, [templateId, blockTemplates]);

  useFocusEffect(
    useCallback(() => {
      if (selectedTemplateForRoutine) {
        const newAction = { ...selectedTemplateForRoutine, id: uuidv4() };
        setActions(prev => [...prev, newAction]);
        setSelectedTemplateForRoutine(null);
      }
    }, [selectedTemplateForRoutine, setSelectedTemplateForRoutine])
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Incomplete", "Please enter a name for the block template.");
      return;
    }
    const templateData = { name, icon, actions };
    if (isEditing && templateId) {
      updateBlockTemplate(templateId, templateData);
    } else {
      addBlockTemplate(templateData);
    }
    router.back();
  };

  const handleDeleteAction = (actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  const handleUpdateAction = (actionId: string, field: keyof Action, value: any) => {
    setActions(prev => 
      prev.map(a => 
        a.id === actionId ? { ...a, [field]: value } : a
      )
    );
  };

  const addAction = (type: string) => {
    if (type === 'from_library') {
      router.push('/actions/picker');
      return;
    }

    let newAction: Action;
    switch (type) {
      case "text":
        newAction = { id: uuidv4(), name: "New Task", type: "task", icon: "document-text-outline", duration: 0, color: theme.colors.primary };
        break;
      case "focus":
        newAction = { id: uuidv4(), name: "Focus Block", type: "timer", icon: "time-outline", duration: 300, color: "#8B5CF6" };
        break;
      case "pomodoro":
        const workAction: Action = { id: uuidv4(), name: "Work", type: "timer", icon: "briefcase-outline", duration: 1500, color: theme.colors.primary };
        const breakAction: Action = { id: uuidv4(), name: "Break", type: "timer", icon: "cafe-outline", duration: 300, color: theme.colors.success };
        setActions(prev => [...prev, workAction, breakAction]);
        return;
      default:
        return;
    }
    setActions(prev => [...prev, newAction]);
  };

  const actionOptions = [
    { label: "From Library", value: "from_library", icon: "library-outline" },
    { label: "Simple Text", value: "text", icon: "document-text-outline" },
    { label: "Focus Block", value: "focus", icon: "time-outline" },
    { label: "Pomodoro", value: "pomodoro", icon: "hourglass-outline" },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? "Edit Block Template" : "Create Block Template"}
        leftElement={
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={isEditMode ? "checkmark-done" : "pencil"} size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: 16 }}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <DraggableFlatList
        data={actions}
        renderItem={({ item, drag, isActive }) => (
          <ActionRow
            item={item}
            isEditMode={isEditMode}
            onDelete={() => handleDeleteAction(item.id)}
            drag={drag}
            isActive={isActive}
            onUpdate={(field, value) => handleUpdateAction(item.id, field, value)}
          />
        )}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setActions(data)}
        ListHeaderComponent={
          <View style={styles.mainInputContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setPickerVisible(true)}>
              <Ionicons name={icon as any} size={32} color={theme.colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.nameInput}
              placeholder="Block Template Name"
              placeholderTextColor={theme.colors.gray}
              value={name}
              onChangeText={setName}
            />
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setIsActionSheetVisible(true)}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add Action</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.scrollContainer}
      />
      <IconPickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectIcon={(selectedIcon) => {
          setIcon(selectedIcon);
          setPickerVisible(false);
        }}
      />
      <ActionSheet
        isVisible={isActionSheetVisible}
        onClose={() => setIsActionSheetVisible(false)}
        onSelect={addAction}
        options={actionOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.layout.spacing.md,
  },
  mainInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    paddingHorizontal: theme.layout.spacing.md,
    marginBottom: theme.layout.spacing.lg,
  },
  iconButton: {
    padding: theme.layout.spacing.sm,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text,
    marginLeft: theme.layout.spacing.sm,
  },
  saveText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
  },
  actionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    marginBottom: theme.layout.spacing.sm,
    paddingLeft: theme.layout.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: theme.layout.spacing.md,
  },
  actionIcon: {
    marginRight: theme.layout.spacing.md,
  },
  actionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
  actionInput: {
    fontFamily: "DMSans-Regular",
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
  actionDuration: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSizes.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.layout.spacing.md,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    marginTop: theme.layout.spacing.md,
  },
  addButtonText: {
    color: theme.colors.primary,
    marginLeft: theme.layout.spacing.sm,
    fontFamily: theme.typography.fonts.bold,
  },
  deleteButton: {
    padding: theme.layout.spacing.md,
  },
  dragHandle: {
    paddingHorizontal: theme.layout.spacing.sm,
  },
});
