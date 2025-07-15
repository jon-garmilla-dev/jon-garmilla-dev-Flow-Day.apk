import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

import Header from "../../../src/components/Header";
import { theme } from "../../../src/constants/theme";
import useActionLibraryStore from "../../../src/store/useActionLibraryStore";

const ActionTemplateRow = ({ template }) => (
  <View style={styles.actionRow}>
    <View style={styles.actionIconContainer}>
      <Ionicons
        name={template.icon || "barbell-outline"}
        size={28}
        color={theme.colors.primary}
      />
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={styles.actionTitle}>{template.name}</Text>
      {template.duration > 0 && (
        <Text style={styles.actionSubtitle}>
          {Math.floor(template.duration / 60)}m {template.duration % 60}s
        </Text>
      )}
    </View>
    {/* Add edit/delete buttons here in the future */}
  </View>
);

export default function ActionLibraryScreen() {
  const router = useRouter();
  const { actionTemplates, loadActionTemplates } = useActionLibraryStore();

  useEffect(() => {
    loadActionTemplates();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Action Library"
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={actionTemplates}
        renderItem={({ item }) => <ActionTemplateRow template={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your action library is empty.</Text>
            <Text style={styles.emptySubtext}>
              Press the '+' button to create a reusable action.
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <Link href="/actions/create" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </Link>
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
  fab: {
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
