import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ActivityIndicator, FlatList, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles } from "../styles/styles"; // <-- IMPORTACIÓN GLOBAL

const API_BASE_URL = "http://192.168.1.126:45455/api";

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

        const combinados = [...ingresos, ...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setTransacciones(combinados);

      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los movimientos");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const datosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return transacciones;
    return transacciones.filter((item) => item.descripcion?.toLowerCase().includes(busqueda.toLowerCase()));
  }, [transacciones, busqueda]);

  const renderItem = useCallback(({ item }) => {
    const esGasto = item.tipo === "gasto";

    return (
      <View style={globalStyles.tarjetaMovimiento}>
        <View style={globalStyles.movimientoInfo}>
          <Text style={globalStyles.movimientoDesc} numberOfLines={1}>{item.descripcion}</Text>
          <Text style={globalStyles.movimientoFecha}>{new Date(item.fecha).toLocaleDateString("es-AR")}</Text>
        </View>

        <View style={globalStyles.movimientoMontoCaja}>
          <Text style={[globalStyles.movimientoMonto, { color: esGasto ? "#ff4b4b" : "#34c759" }]}>
            {esGasto ? "-" : "+"} ${(item.monto || 0).toLocaleString("es-AR")}
          </Text>
          <Text style={globalStyles.movimientoTipo}>{esGasto ? "GASTO" : "INGRESO"}</Text>
        </View>
      </View>
    );
  }, []);

  if (cargando) {
    return (
      <View style={globalStyles.centroTotal}>
        <ActivityIndicator size="large" color="#c8b277" />
      </View>
    );
  }

  return (
    <View style={globalStyles.contenedorPrincipal}>
      <View style={globalStyles.seccionEncabezado}>
        <Text style={globalStyles.tituloPrincipal}>Historial General</Text>
        <Text style={globalStyles.descripcionEncabezado}>Filtrado detallado de todas sus transacciones.</Text>
      </View>

      <View style={globalStyles.buscadorContenedor}>
        <Text style={globalStyles.buscadorIcono}>🔍</Text>
        <TextInput
          style={globalStyles.buscadorInput}
          placeholder="Buscar por descripción..."
          placeholderTextColor="#8e8e93"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {datosFiltrados.length === 0 ? (
        <View style={globalStyles.avisoVacio}>
          <Text style={globalStyles.mensajeVacio}>No se encontraron transacciones.</Text>
        </View>
      ) : (
        <FlatList
          data={datosFiltrados}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={renderItem}
          contentContainerStyle={globalStyles.listaContenedor}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default ComparativaScreen;