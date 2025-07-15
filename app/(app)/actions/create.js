import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import Header from "../../../src/components/Header";
import IconPickerModal from "../../../src/components/modals/IconPickerModal";
import { theme } from "../../../src/constants/theme";
import useActionLibraryStore from "../../../src/store/useActionLibraryStore";

export default function CreateActionTemplateScreen() {
  const router = useRouter();
  const { addActionTemplate } = useActionLibraryStore();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("barbell");
  const [duration, setDuration] = useState(""); // In minutes
  const [description, setDescription] = useState("");
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleSave = () => {
    if (!name) {
      alert("Please provide an action name.");
      return;
    }
    addActionTemplate({
      name,
      icon,
      type: "timer", // All custom actions are of type 'timer' for now
      duration: (parseInt(duration, 10) || 0) * 60, // Convert minutes to seconds
      description,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <IconPickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectIcon={setIcon}
      />
      <Header
        title="Create Action"
        leftElement={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainInputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setPickerVisible(true)}
          >
            <Ionicons name={icon} size={32} color={theme.colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.nameInput}
            placeholder="Action Name"
            placeholderTextColor={theme.colors.gray}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.rowInputContainer}>
          <Ionicons
            name="time-outline"
            size={24}
            color={theme.colors.gray}
            style={styles.rowIcon}
          />
          <TextInput
            style={styles.rowInput}
            placeholder="Duration"
            placeholderTextColor={theme.colors.gray}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
          <Text style={styles.unitText}>minutes</Text>
        </View>

        <View style={styles.rowInputContainer}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={theme.colors.gray}
            style={styles.rowIcon}
          />
          <TextInput
            style={styles.rowInput}
            placeholder="Description (optional)"
            placeholderTextColor={theme.colors.gray}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save to Library</Text>
        </TouchableOpacity>
      </ScrollView>
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
  rowInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    paddingHorizontal: theme.layout.spacing.md,
    marginBottom: theme.layout.spacing.md,
  },
  rowIcon: {
    marginRight: theme.layout.spacing.md,
  },
  rowInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  unitText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: theme.layout.spacing.lg,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.md,
  },
});
