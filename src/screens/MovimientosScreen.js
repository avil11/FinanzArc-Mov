import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ActivityIndicator, FlatList, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles } from "../styles/styles"; // <-- IMPORTACIÓN GLOBAL

const API_BASE_URL = "http://192.168.1.126:45457/api";

// Diccionario de divisas basado en tu API
const MAPA_DIVISAS = {
  1: { simbolo: "$", codigo: "ARS" },
  2: { simbolo: "U$D", codigo: "USD" },
  3: { simbolo: "€", codigo: "EUR" }
};

// Función reutilizable de normalización
const normalizarMovimiento = (item, tipoOrigen) => {
  const id = 
    item.id ?? 
    item.Id ?? 
    item.IdIngreso ?? 
    item.IdGasto ?? 
    item.IdHistorialIngreso ?? 
    item.IdHistorialGasto ?? 
    item.IdMovimiento;

  const descripcion = 
    item.descripcion || 
    item.Descripcion || 
    item.detalle || 
    item.Detalle || 
    item.concepto || 
    item.Concepto || 
    "Sin descripción";

  const fecha = 
    item.fecha || 
    item.Fecha || 
    item.FechaIngreso || 
    item.FechaGasto || 
    item.fechaMovimiento || 
    item.FechaMovimiento || 
    item.fechaRegistro || 
    item.FechaRegistro || 
    item.fechaCreacion || 
    item.FechaCreacion || 
    new Date().toISOString(); 

  const montoBruto = 
    item.monto ?? 
    item.Monto ?? 
    item.MontoIngreso ?? 
    item.MontoGasto ?? 
    item.valor ?? 
    item.Valor ?? 
    item.total ?? 
    item.Total ?? 
    item.Importe ?? 
    item.importe;
    
  const monto = Number(montoBruto) || 0;

  // CAPTURAMOS LA DIVISA
  const idDivisa = item.idDivisa ?? item.IdDivisa ?? 1; // Por defecto 1 (ARS) si no viene
  const divisaInfo = MAPA_DIVISAS[idDivisa] || MAPA_DIVISAS[1];

  const tipo = (tipoOrigen === "Ingreso" || tipoOrigen === "HistorialIngreso") ? "ingreso" : "gasto";

  return {
    id,
    descripcion,
    fecha,
    monto,
    tipo,
    origen: tipoOrigen,
    simboloDivisa: divisaInfo.simbolo, // <-- Guardamos el símbolo ($, U$D, €)
    codigoDivisa: divisaInfo.codigo    // <-- Guardamos el código (ARS, USD, EUR)
  };
};

const MovimientosScreen = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("Token");
        console.log("TOKEN:", token);

        const resUser = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, { 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        const userData = await resUser.json();
        console.log("USUARIO:", userData);

        const userId = userData.IdUsuario;
        console.log("ID USUARIO:", userId);

        console.log("Consultando Ingresos...");
        console.log("Consultando Gastos...");
        console.log("Consultando Historial Ingresos...");
        console.log("Consultando Historial Gastos...");

        const authHeaders = { "Authorization": `Bearer ${token}` };

        // Helper interno para rechazar la promesa de un endpoint individual si el HTTP da error
        const fetchEndpoint = (endpoint) => 
          fetch(`${API_BASE_URL}${endpoint}`, { headers: authHeaders })
            .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`));

        const [
          ingresosResponse,
          gastosResponse,
          historialIngresosResponse,
          historialGastosResponse
        ] = await Promise.allSettled([
          fetchEndpoint(`/Ingreso/ByUsuario/${userId}`),
          fetchEndpoint(`/Gasto/ByUsuario/${userId}`),
          fetchEndpoint(`/HistorialIngreso/ByUsuario/${userId}`),
          fetchEndpoint(`/HistorialGasto/ByUsuario/${userId}`)
        ]);

        console.log("Ingreso:", ingresosResponse);
        console.log("Gasto:", gastosResponse);
        console.log("HistorialIngreso:", historialIngresosResponse);
        console.log("HistorialGasto:", historialGastosResponse);

        // Procesar cada respuesta (si falló, loguea silenciosamente y devuelve array vacío)
        const extraerDatos = (resultado, origen) => {
          if (resultado.status === 'fulfilled' && Array.isArray(resultado.value)) {
            return resultado.value.map(item => normalizarMovimiento(item, origen));
          }
          if (resultado.status === 'rejected') {
            console.warn(`[Advertencia] Falló la API de ${origen}:`, resultado.reason);
          }
          return [];
        };

        const ingresos = extraerDatos(ingresosResponse, "Ingreso");
        const gastos = extraerDatos(gastosResponse, "Gasto");
        const historialIngresos = extraerDatos(historialIngresosResponse, "HistorialIngreso");
        const historialGastos = extraerDatos(historialGastosResponse, "HistorialGasto");

        // Unificación
        const todosMovimientos = [
           ...ingresos,
           ...gastos,
           ...historialIngresos,
           ...historialGastos
        ];

        // Ordenamiento descendente
        todosMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Evitar duplicados comparando (id + fecha + monto) mediante un Set de firmas
        const firmasVistas = new Set();
        const unicos = todosMovimientos.filter(item => {
          const firma = `${item.id}-${item.fecha}-${item.monto}`;
          if (firmasVistas.has(firma)) {
            return false;
          }
          firmasVistas.add(firma);
          return true;
        });

        console.log("TOTAL INGRESOS:", ingresos.length);
        console.log("TOTAL GASTOS:", gastos.length);
        console.log("TOTAL HISTORIAL INGRESOS:", historialIngresos.length);
        console.log("TOTAL HISTORIAL GASTOS:", historialGastos.length);
        console.log("TOTAL COMBINADO:", unicos.length);
        console.log("MOVIMIENTOS FINALES:", unicos);

        setTransacciones(unicos);

      } catch (error) {
        console.error("Error crítico en la carga de movimientos:", error);
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

 // ... dentro de MovimientosScreen

const renderItem = useCallback(({ item }) => {
  const esGasto = item.tipo === "gasto";

  return (
    <View style={globalStyles.tarjetaMovimiento}>
      {/* Contenedor del Icono/Indicador */}
      <View style={[globalStyles.iconoMovimiento, { backgroundColor: esGasto ? "rgba(255, 75, 75, 0.1)" : "rgba(52, 199, 89, 0.1)" }]}>
        <Text style={{ fontSize: 20 }}>{esGasto ? "⬇️" : "⬆️"}</Text>
      </View>

      {/* Información principal */}
      <View style={{ flex: 1 }}>
        <Text style={globalStyles.movimientoDesc} numberOfLines={1}>{item.descripcion}</Text>
        <Text style={globalStyles.movimientoFecha}>
           {new Date(item.fecha).toLocaleDateString("es-AR", { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>

      {/* Monto y Código de divisa */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[globalStyles.movimientoMonto, { color: esGasto ? "#ff4b4b" : "#34c759" }]}>
          {esGasto ? "-" : "+"} {item.simboloDivisa}{(item.monto || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </Text>
        <Text style={globalStyles.movimientoTipo}>
           {item.codigoDivisa !== "ARS" ? item.codigoDivisa : "ARS"}
        </Text>
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
          // EL CAMBIO ESTÁ EN ESTA LÍNEA 👇
          keyExtractor={(item, index) => item.id ? `${item.tipo}-${item.id}` : index.toString()}
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

export default MovimientosScreen;