import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";


const MenuLateral = ({ onClose, onNavigate }) => {
  const navigation = useNavigation();

  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    console.log("Sesión cerrada");
  };

  return (
    
    <View style={styles.menuContainer}>
      <Text style={styles.titulo}>Menú Principal</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Movimientos")}>
        <Text style={styles.icono}>📊</Text>
        <Text style={styles.texto}>Historial General</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Archivos")}>
        <Text style={styles.icono}>📁</Text>
        <Text style={styles.texto}>Archivos</Text>
      </TouchableOpacity>

      <View style={styles.separador} />

      <TouchableOpacity style={styles.itemCerrar} onPress={() => {cerrarSesion(); onClose();}}>
        <Text style={styles.textoCerrar}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    width: '80%', // <-- AGREGA ESTO: No uses flex: 1 solo
    height: '100%',
    backgroundColor: '#121212', // Fondo oscuro
    paddingTop: 60,
    paddingHorizontal: 25,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  titulo: {
    color: '#c8b277',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25
  },
  icono: {
    fontSize: 24,
    marginRight: 10
  },
  texto: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15
  },
  separador: {
    height: 1,
    width: '100%',
    backgroundColor: '#333',
    marginVertical: 20
  },
  itemCerrar: {
    marginTop: 20
  },
  textoCerrar: {
    color: '#ff4b4b',
    fontSize: 18,
    fontWeight: '600'
  }
});

export default MenuLateral;