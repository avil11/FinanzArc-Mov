import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.100.3:45455/api";

const ComparativaScreen = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
 const fetchData = async () => {
    try {
        const token = await AsyncStorage.getItem("Token");
        const resUser = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, { 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        const userData = await resUser.json();
        const userId = userData.IdUsuario;

        const [resI, resG] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/Ingreso/ByUsuario/${userId}`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${API_BASE_URL}/Gasto/ByUsuario/${userId}`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json())
        ]);

        const ingresos = resI.status === 'fulfilled' ? resI.value.map(item => ({ ...item, tipo: 'ingreso' })) : [];
        const gastos = resG.status === 'fulfilled' ? resG.value.map(item => ({ ...item, tipo: 'gasto' })) : [];

        // COMBINAR Y ORDENAR
        const combinados = [...ingresos, ...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // ACTUALIZAR EL ESTADO
        setTransacciones(combinados);

    } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudieron cargar los movimientos");
    } finally {
        setCargando(false);
    }
};

    fetchData();
  }, []);

  const datosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return transacciones;

    return transacciones.filter((item) =>
      item.descripcion
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [transacciones, busqueda]);

  const renderItem = useCallback(({ item }) => {
    const esGasto = item.tipo === "gasto";

    return (
      <View style={styles.cardItem}>
        <View style={styles.infoContainer}>
          <Text
            style={styles.descripcionTexto}
            numberOfLines={1}
          >
            {item.descripcion}
          </Text>

          <Text style={styles.fechaTexto}>
            {new Date(item.fecha).toLocaleDateString(
              "es-AR"
            )}
          </Text>
        </View>

        <View style={styles.montoContainer}>
          <Text
            style={[
              styles.montoTexto,
              {
                color: esGasto
                  ? "#ff5252"
                  : "#4caf50",
              },
            ]}
          >
            {esGasto ? "-" : "+"} $
            {(item.monto || 0).toLocaleString(
              "es-AR"
            )}
          </Text>

          <Text style={styles.tipoTexto}>
            {esGasto ? "GASTO" : "INGRESO"}
          </Text>
        </View>
      </View>
    );
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#c8b277"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          Historial de Movimientos
        </Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción..."
            placeholderTextColor="#888"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      {datosFiltrados.length === 0 ? (
        <View style={styles.center}>
          <Text
            style={{
              color: "#888",
              fontSize: 16,
            }}
          >
            No se encontraron transacciones.
          </Text>
        </View>
      ) : (
        <FlatList
          data={datosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            styles.listContainer
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          windowSize={5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },

  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#c8b277",
    marginBottom: 15,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1f",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 15,
  },

  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e1e1f",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  infoContainer: {
    flex: 1,
    marginRight: 15,
  },

  descripcionTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },

  fechaTexto: {
    color: "#888",
    fontSize: 12,
  },

  montoContainer: {
    alignItems: "flex-end",
  },

  montoTexto: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  tipoTexto: {
    color: "#888",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "bold",
  },
});

export default ComparativaScreen;