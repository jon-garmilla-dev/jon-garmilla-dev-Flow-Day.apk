import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../../../src/components/Header";
import { theme } from "../../../src/constants/theme";
import useBlockLibraryStore from "../../../src/store/useBlockLibraryStore";
import { BlockTemplate } from "../../../src/types";

export default function BlockPickerScreen() {
  const router = useRouter();
  const { blockTemplates, setSelectedBlockTemplate } = useBlockLibraryStore();

  const handleSelectBlock = (blockTemplate: BlockTemplate) => {
    setSelectedBlockTemplate(blockTemplate);
    router.back();
  };

  const renderItem = ({ item }: { item: BlockTemplate }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleSelectBlock(item)}
    >
      <Ionicons
        name={(item.icon as any) || "cube-outline"}
        size={24}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Select a Block"
        leftElement={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color="#c9d1d9" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={blockTemplates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No block templates found.</Text>
            <Text style={styles.emptySubText}>
              You can create new block templates from the Library screen.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 20,
  },
  itemContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.typography.fonts.bold,
  },
  icon: {
    marginRight: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: theme.typography.fonts.bold,
  },
  emptySubText: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 10,
    textAlign: "center",
    fontFamily: theme.typography.fonts.regular,
  },
});
