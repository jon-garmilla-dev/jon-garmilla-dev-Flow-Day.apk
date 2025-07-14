import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import useRoutineStore from '../../store/useRoutineStore';
import { useRouter } from 'expo-router';

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
        <TouchableOpacity style={styles.addItem} onPress={() => handleNavigation('/create')}>
          <Text style={styles.addItemText}>+ Añadir Workflow</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  headerText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 22,
    color: '#f0f6fc',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  itemText: {
    color: '#c9d1d9',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  addItem: {
    // Estilos para el botón de añadir
  },
  addItemText: {
    color: '#58a6ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
