import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from 'expo-document-picker';

export default function ArchivosScreen() {
  const [archivo, setArchivo] = useState(null);

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled === false) {
        setArchivo(result.assets[0]);
      }
    } catch (err) { Alert.alert("Error", "No se pudo seleccionar el archivo"); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión Documental</Text>
      <TouchableOpacity style={styles.button} onPress={seleccionarArchivo}>
        <Text style={styles.buttonText}>Seleccionar Archivo (PDF/IMG)</Text>
      </TouchableOpacity>
      {archivo && <Text style={styles.text}>Archivo seleccionado: {archivo.name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 20, color: "#c8b277", marginBottom: 20 },
  button: { backgroundColor: "#1e1e1f", padding: 15, borderRadius: 10, borderWidth: 1, borderColor: "#c8b277" },
  buttonText: { color: "#fff" },
  text: { color: "#888", marginTop: 20 }
});