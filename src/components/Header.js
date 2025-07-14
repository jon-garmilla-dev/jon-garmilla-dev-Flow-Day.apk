import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title, leftElement, rightElement }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideContainer}>
        {leftElement}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.sideContainer}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64, // Altura estándar de cabecera
    paddingHorizontal: 10,
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  sideContainer: {
    minWidth: 40, // Un ancho mínimo para mantener el equilibrio
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  titleContainer: {
    flex: 1, // El título ocupa el espacio restante
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 22,
    color: '#f0f6fc',
  },
});

export default Header;
