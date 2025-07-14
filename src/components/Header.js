import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title, rightElement }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightElement}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  headerTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 24,
    color: '#f0f6fc',
  },
});

export default Header;
