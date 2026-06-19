import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";

const Navbar = ({ onOpenMenu }) => {
  return (
    <View style={styles.navbarContainer}>
      <TouchableOpacity onPress={onOpenMenu} style={styles.menuButton}>
        <Text style={styles.icon}>☰</Text>
      </TouchableOpacity>
      
      <Text style={styles.logo}>FinanzARC</Text>
      
      {/* Espaciador para equilibrar el título */}
      <View style={{ width: 30 }} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between', // Separa el menú del logo
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  menuButton: { 
    padding: 5 
  },
  icon: { 
    fontSize: 28, 
    color: '#c8b277' 
  },
  logo: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 1
  }
});

export default Navbar;