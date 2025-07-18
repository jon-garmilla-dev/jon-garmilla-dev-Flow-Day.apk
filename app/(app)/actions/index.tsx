import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";

import Header from "../../../src/components/Header";
import ConfirmModal from "../../../src/components/modals/ConfirmModal";
import ActionButton from "../../../src/components/ui/ActionButton";
import { theme } from "../../../src/constants/theme";
import useActionLibraryStore from "../../../src/store/useActionLibraryStore";
import useBlockLibraryStore from "../../../src/store/useBlockLibraryStore";
import { Action, BlockTemplate } from "../../../src/types";

interface ActionTemplateRowProps {
  template: Action;
  isEditMode: boolean;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
  onPress: () => void;
}

const ActionTemplateRow: React.FC<ActionTemplateRowProps> = ({ template, isEditMode, onDelete, drag, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} disabled={isEditMode} style={styles.actionTemplateRowContainer}>
    <View style={[styles.actionRow, { backgroundColor: isActive ? theme.colors.border : theme.colors.surface }]}>
      {isEditMode && (
        <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={32} color={theme.colors.gray} />
      </TouchableOpacity>
    )}
    <View style={styles.actionIconContainer}>
      <Ionicons name={template.icon as any || "barbell-outline"} size={28} color={theme.colors.primary} />
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
        <Ionicons name="remove-circle-outline" size={28} color={theme.colors.danger} />
      </TouchableOpacity>
    )}
    </View>
  </TouchableOpacity>
);

interface BlockTemplateRowProps {
  template: BlockTemplate;
  isEditMode: boolean;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}

const ExpandedActionRow: React.FC<{ action: Action }> = ({ action }) => (
  <View style={styles.expandedActionRow}>
    <Ionicons name={action.icon as any || "ellipse-outline"} size={20} color={theme.colors.gray} style={styles.expandedActionIcon} />
    <Text style={styles.expandedActionText}>{action.name}</Text>
    {action.type === 'timer' && action.duration && action.duration > 0 && (
      <Text style={styles.expandedActionDuration}>{`${Math.floor(action.duration / 60)}m`}</Text>
    )}
  </View>
);

const BlockTemplateRow: React.FC<BlockTemplateRowProps> = ({ template, isEditMode, onDelete, drag, isActive, isExpanded, onToggleExpand, onEdit }) => {
  return (
    <View style={styles.blockRowContainer}>
      <TouchableOpacity onPress={onToggleExpand} disabled={isEditMode}>
        <View style={[styles.actionRow, { backgroundColor: isActive ? theme.colors.border : theme.colors.surface }]}>
          {isEditMode && (
            <TouchableOpacity onLongPress={drag} disabled={isActive} style={styles.dragHandle}>
            <Ionicons name="reorder-three-outline" size={32} color={theme.colors.gray} />
          </TouchableOpacity>
        )}
        <View style={styles.actionIconContainer}>
          <Ionicons name={template.icon as any || "cube-outline"} size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>{template.name}</Text>
          {!isExpanded && (
            <Text style={styles.actionSubtitle}>{template.actions.length} actions</Text>
          )}
        </View>
        {isEditMode ? (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="remove-circle-outline" size={28} color={theme.colors.danger} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.gray} />
          </TouchableOpacity>
        )}
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.expandedContainer}>
          {template.actions.map(action => (
            <ExpandedActionRow key={action.id} action={action} />
          ))}
        </View>
      )}
    </View>
  );
};

export default function ActionLibraryScreen() {
  const router = useRouter();
  const { actionTemplates, loadActionTemplates, deleteActionTemplate, reorderActionTemplates } = useActionLibraryStore();
  const { blockTemplates, loadBlockTemplates, deleteBlockTemplate, reorderBlockTemplates } = useBlockLibraryStore();
  
  const [activeTab, setActiveTab] = useState<'actions' | 'blocks'>('actions');
  const [isEditMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Action | BlockTemplate | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [expandedBlockIds, setExpandedBlockIds] = useState<string[]>([]);

  useEffect(() => {
    loadActionTemplates();
    loadBlockTemplates();
  }, [loadActionTemplates, loadBlockTemplates]);

  const handleDeletePress = (item: Action | BlockTemplate) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      if (activeTab === 'actions') {
        deleteActionTemplate(selectedItem.id);
      } else {
        deleteBlockTemplate(selectedItem.id);
      }
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  const renderContent = () => {
    if (activeTab === 'actions') {
      return (
        <DraggableFlatList
          data={actionTemplates}
          renderItem={({ item, drag, isActive }: RenderItemParams<Action>) => (
            <ActionTemplateRow
              template={item}
              isEditMode={isEditMode}
              onDelete={() => handleDeletePress(item)}
              drag={drag}
              isActive={isActive}
              onPress={() => router.push(`/actions/create?templateId=${item.id}`)}
            />
          )}
          keyExtractor={(item) => `action-${item.id}`}
          onDragEnd={({ data }) => reorderActionTemplates(data)}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Your action library is empty.</Text></View>}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        />
      );
    }
    return (
      <DraggableFlatList
        data={blockTemplates}
        renderItem={({ item, drag, isActive }: RenderItemParams<BlockTemplate>) => (
          <BlockTemplateRow
            template={item}
            isEditMode={isEditMode}
            onDelete={() => handleDeletePress(item)}
            drag={drag}
            isActive={isActive}
            isExpanded={expandedBlockIds.includes(item.id)}
            onToggleExpand={() => {
              if (expandedBlockIds.includes(item.id)) {
                setExpandedBlockIds(expandedBlockIds.filter(id => id !== item.id));
              } else {
                setExpandedBlockIds([...expandedBlockIds, item.id]);
              }
            }}
            onEdit={() => router.push(`/actions/create-block?templateId=${item.id}`)}
          />
        )}
        keyExtractor={(item) => `block-${item.id}`}
        onDragEnd={({ data }) => reorderBlockTemplates(data)}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Your block library is empty.</Text></View>}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Library"
        leftElement={
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={() => setEditMode(!isEditMode)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isEditMode ? "checkmark-done" : "pencil"} size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      <View style={styles.tabContainer}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'actions' && styles.activeTab]}
            onPress={() => setActiveTab('actions')}
          >
            <Text style={[styles.tabText, activeTab === 'actions' && styles.activeTabText]}>Actions</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'blocks' && styles.activeTab]}
            onPress={() => setActiveTab('blocks')}
          >
            <Text style={[styles.tabText, activeTab === 'blocks' && styles.activeTabText]}>Blocks</Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderContent()}
      <ConfirmModal
        visible={isModalVisible}
        onConfirm={confirmDelete}
        onCancel={() => setModalVisible(false)}
        title={`Delete ${activeTab === 'actions' ? 'Action' : 'Block'}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"? This cannot be undone.`}
      />
      <ActionButton activeTab={activeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    paddingVertical: theme.layout.spacing.sm,
    paddingHorizontal: theme.layout.spacing.lg,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.gray,
    fontFamily: theme.typography.fonts.bold,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.layout.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  actionIconContainer: {
    marginRight: theme.layout.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
    paddingVertical: theme.layout.spacing.md,
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
  dragHandle: {
    paddingRight: theme.layout.spacing.md,
  },
  deleteButton: {
    paddingLeft: theme.layout.spacing.md,
  },
  editButton: {
    paddingHorizontal: theme.layout.spacing.md,
  },
  blockRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  expandedContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.layout.spacing.md,
    paddingBottom: theme.layout.spacing.md,
  },
  expandedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.layout.spacing.sm,
  },
  expandedActionIcon: {
    marginRight: theme.layout.spacing.md,
  },
  expandedActionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
  expandedActionDuration: {
    color: theme.colors.gray,
    fontSize: theme.typography.fontSizes.sm,
  },
  actionTemplateRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
});
