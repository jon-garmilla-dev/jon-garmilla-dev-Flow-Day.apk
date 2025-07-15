import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
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

const ActionTemplateRow = ({ template, onSelect }) => (
  <TouchableOpacity style={styles.actionRow} onPress={() => onSelect(template)}>
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
  </TouchableOpacity>
);

export default function ActionPickerScreen() {
  const router = useRouter();
  useLocalSearchParams();
  const {
    actionTemplates,
    loadActionTemplates,
    setSelectedTemplateForRoutine,
  } = useActionLibraryStore();

  useEffect(() => {
    loadActionTemplates();
  }, []);

  const handleSelect = (template) => {
    setSelectedTemplateForRoutine(template);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Choose Action from Library"
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={actionTemplates}
        renderItem={({ item }) => (
          <ActionTemplateRow template={item} onSelect={handleSelect} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your action library is empty.</Text>
            <Link href="/actions/create" asChild>
              <Text style={styles.linkText}>Create a new action.</Text>
            </Link>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
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
  linkText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.layout.spacing.md,
  },
});
