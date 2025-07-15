import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { theme } from "../constants/theme";

const Header = ({ title, leftElement, rightElement }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideContainer}>{leftElement}</View>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.sideContainer}>{rightElement}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: theme.layout.headerHeight,
    paddingHorizontal: theme.layout.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sideContainer: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.layout.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
  },
});

export default Header;
