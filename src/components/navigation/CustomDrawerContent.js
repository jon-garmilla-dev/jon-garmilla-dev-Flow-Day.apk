import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import useRoutineStore from '../../store/useRoutineStore';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
  const router = useRouter();
  const routines = useRoutineStore(state => state.routines);

  const handleNavigation = (path) => {
    router.push(path);
    props.navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Workflows</Text>
      </View>
      <ScrollView style={styles.content}>
        {routines.map((routine) => (
          <TouchableOpacity key={routine.id} style={styles.item} onPress={() => handleNavigation(`/routine/${routine.id}`)}>
            <Text style={styles.itemText}>{routine.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => handleNavigation('/create')}>
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.footerButtonText}>Add Workflow</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerText: {
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingTop: theme.layout.spacing.sm,
  },
  item: {
    paddingVertical: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.lg,
  },
  itemText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fonts.regular,
  },
  footer: {
    padding: theme.layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.layout.spacing.sm,
  },
  footerButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fonts.bold,
    marginLeft: theme.layout.spacing.sm,
  },
});

export default CustomDrawerContent;
