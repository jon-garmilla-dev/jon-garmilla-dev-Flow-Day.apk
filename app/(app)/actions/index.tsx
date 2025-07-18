import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

import Header from "../../../src/components/Header";
import ConfirmModal from "../../../src/components/modals/ConfirmModal";
import ActionButton from "../../../src/components/ui/ActionButton";
import { theme } from "../../../src/constants/theme";
import useActionLibraryStore from "../../../src/store/useActionLibraryStore";
import { Action } from "../../../src/types";

interface ActionTemplateRowProps {
  template: Action;
  isEditMode: boolean;
  onDelete: () => void;
}

const ActionTemplateRow: React.FC<ActionTemplateRowProps> = ({ template, isEditMode, onDelete }) => (
  <View style={styles.actionRow}>
    <View style={styles.actionIconContainer}>
      <Ionicons
        name={template.icon as any || "barbell-outline"}
        size={28}
        color={theme.colors.primary}
      />
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={styles.actionTitle}>{template.name}</Text>
      {template.duration && template.duration > 0 && (
        <Text style={styles.actionSubtitle}>
          {Math.floor(template.duration / 60)}m {template.duration % 60}s
        </Text>
      )}
    </View>
    {isEditMode && (
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons
          name="remove-circle-outline"
          size={28}
          color={theme.colors.danger}
        />
      </TouchableOpacity>
    )}
  </View>
);

export default function ActionLibraryScreen() {
  const router = useRouter();
  const { actionTemplates, loadActionTemplates, deleteActionTemplate } = useActionLibraryStore();
  const [isEditMode, setEditMode] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadActionTemplates();
  }, [loadActionTemplates]);

  const handleDeletePress = (action: Action) => {
    setSelectedAction(action);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedAction) {
      deleteActionTemplate(selectedAction.id);
      setModalVisible(false);
      setSelectedAction(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Action Library"
        leftElement={
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={() => setEditMode(!isEditMode)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isEditMode ? "checkmark-done" : "pencil"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={actionTemplates}
        renderItem={({ item }) => (
          <ActionTemplateRow
            template={item}
            isEditMode={isEditMode}
            onDelete={() => handleDeletePress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your action library is empty.</Text>
            <Text style={styles.emptySubtext}>
              Create a reusable action.
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      />
      <ConfirmModal
        visible={isModalVisible}
        onConfirm={confirmDelete}
        onCancel={() => setModalVisible(false)}
        title="Delete Action"
        message={`Are you sure you want to delete "${selectedAction?.name}"? This cannot be undone.`}
      />
      <ActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionIconContainer: {
    marginRight: theme.layout.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
  },
  actionSubtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },
  deleteButton: {
    paddingLeft: theme.layout.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.layout.spacing.lg,
  },
  emptyText: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray,
    textAlign: "center",
    marginTop: theme.layout.spacing.sm,
  },
});
