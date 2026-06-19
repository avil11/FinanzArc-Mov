import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// IMPORTANTE: Cambia useRouter por useNavigation
import { useNavigation } from "@react-navigation/native"; 

const Navbar = () => {
  const navigation = useNavigation(); // Ahora usamos este hook
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ejemplo de cómo llamar a las rutas definidas en App.js
  const navegarA = (ruta) => {
    navigation.navigate(ruta);
    setIsMobileMenuOpen(false);
  };

  return (
    <View style={styles.navbarContainer}>
      {/* Botones de navegación */}
      <TouchableOpacity onPress={() => navegarA("Gasto")}>
        <Text style={styles.linkText}>Gastos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navegarA("Ingreso")}>
        <Text style={styles.linkText}>Ingresos</Text>
      </TouchableOpacity>
    </View>
  );
};