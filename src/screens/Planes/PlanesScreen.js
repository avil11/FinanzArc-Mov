import React, { useState, useEffect, memo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.126:45457/api";

import { planesStyles } from "./PlanesStyles";


const obtenerNombrePlan = (idRol) => {
  switch (Number(idRol)) {
    case 1:
      return "Plan Esencial";
    case 2:
      return "Plan Gold";
    case 3:
      return "Plan Platino";
    case 4:
      return "Plan Developer";
    default:
      return "Sin Plan";
  }
};


const DetallesLista = memo(({ texto }) => {
  if (!texto || typeof texto !== "string" || texto.trim() === "") {
    return <Text style={planesStyles.detalleVacio}>Sin descripción disponible.</Text>;
  }
  const lineas = texto.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  if (lineas.length === 0) return <Text style={planesStyles.detalleVacio}>Sin descripción disponible.</Text>;

  return (
    <View style={planesStyles.listaDetalles}>
      {lineas.map((linea, index) => {
        if (linea.startsWith("+")) {
          return <Text key={index} style={[planesStyles.itemDetalle, planesStyles.detalleIncluido]}>✅ {linea.substring(1).trim()}</Text>;
        } else if (linea.startsWith("-")) {
          return <Text key={index} style={[planesStyles.itemDetalle, planesStyles.detalleExcluido]}>❌ {linea.substring(1).trim()}</Text>;
        } else if (linea.startsWith(">")) {
          return <Text key={index} style={[planesStyles.itemDetalle, planesStyles.detalleDestacado]}>✨ {linea.substring(1).trim()}</Text>;
        } else {
          return <Text key={index} style={[planesStyles.itemDetalle, planesStyles.detalleNormal]}>• {linea}</Text>;
        }
      })}
    </View>
  );
});

// 3. COMPONENTE PRINCIPAL
const PlanesScreen = () => {

  const [planes, setPlanes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [tipoSuscripcion, setTipoSuscripcion] = useState(1); // 1 = Mensual, 2 = Anual

  useEffect(() => {
    cargarDatos();
  }, []);
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = await AsyncStorage.getItem("Token");

      const resUsuario = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resUsuario.ok) {
        const dataUser = await resUsuario.json();
        setUsuario(dataUser);
      }

      const resPlanes = await fetch(`${API_BASE_URL}/Planes`);
      if (resPlanes.ok) {
        const dataPlanes = await resPlanes.json();
        setPlanes(dataPlanes);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      Alert.alert("Error de Red", "No se pudieron sincronizar los datos con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const simularSuscripcionPlan = async (plan) => {
    if (!usuario) {
      Alert.alert("Error", "No se encontró información del usuario autenticado.");
      return;
    }

    setProcesandoAccion(true);
    try {
      const token = await AsyncStorage.getItem("Token");

      const usuarioActualizado = {
        ...usuario,
        IdRol: plan.IdRol
      };

      const respuesta = await fetch(`${API_BASE_URL}/Usuarios/${usuario.IdUsuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(usuarioActualizado)
      });

      if (respuesta.ok) {
        Alert.alert(
          "¡Suscripción Exitosa!",
          `Tu cuenta ha sido actualizada al "${plan.Nombre}" de forma inmediata.`,
          [{ text: "Buenísimo", onPress: () => cargarDatos() }]
        );
      } else {
        throw new Error("El servidor rechazó la actualización del usuario.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el plan en la base de datos.");
    } finally {
      setProcesandoAccion(false);
    }
  };
  const planesFiltrados = planes.filter(
    plan => Number(plan.IdTipoSuscripcion) === Number(tipoSuscripcion)
  );

  const confirmarCompra = (plan) => {
    Alert.alert(
      "Confirmar Suscripción",
      `¿Estás seguro que quieres adquirir el ${plan.Nombre} por $${plan.Precio} ARS?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, activar plan",
          onPress: () => simularSuscripcionPlan(plan),
        },
      ],
      { cancelable: true }
    );
  };

  if (cargando) {
    return (
      <View style={planesStyles.centerLoading}>
        <ActivityIndicator size="large" color="#c8b277" />
        <Text style={planesStyles.textoCargando}>Sincronizando planes...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={planesStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {usuario && (
        <View style={planesStyles.bannerUsuario}>
          <Text style={planesStyles.textoBanner}>
            Hola <Text style={{ fontWeight: 'bold', color: '#fff' }}>{usuario.Nombre}</Text> • Plan Actual: <Text style={planesStyles.rolResaltado}>{obtenerNombrePlan(usuario.IdRol)}</Text>
          </Text>
        </View>
      )}

      <Text style={planesStyles.introduccion}>
        Centralice su gestión financiera con nuestros planes creados para usted.
      </Text>

      <View style={planesStyles.selectorSuscripcion}>
        <TouchableOpacity
          style={[planesStyles.tabBoton, tipoSuscripcion === 1 && planesStyles.tabActivo]}
          onPress={() => setTipoSuscripcion(1)}
        >
          <Text style={[planesStyles.tabTexto, tipoSuscripcion === 1 && planesStyles.tabTextoActivo]}>Mensual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[planesStyles.tabBoton, tipoSuscripcion === 2 && planesStyles.tabActivo]}
          onPress={() => setTipoSuscripcion(2)}
        >
          <Text style={[planesStyles.tabTexto, tipoSuscripcion === 2 && planesStyles.tabTextoActivo]}>Anual</Text>
        </TouchableOpacity>
      </View>

      {planesFiltrados.map((p) => {
        const textoDetalle = (p.Detalle || p.Detalles || "").replace(". ", ".\n> ");
        const esPlanActivoActual = usuario?.IdRol === p.IdRol;

        return (
          <View key={p.IdPlan} style={[planesStyles.tarjetaPlan, esPlanActivoActual && planesStyles.tarjetaActiva]}>

            <View style={planesStyles.contenidoSuperior}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={planesStyles.badgeSuscripcion}>
                  {Number(p.IdTipoSuscripcion) === 1 ? "Mensual" : "Anual"}
                </Text>
                {esPlanActivoActual && (
                  <Text style={planesStyles.badgePlanActual}>Plan Activo</Text>
                )}
              </View>

              <Text style={planesStyles.planNombre}>{p.Nombre || `Plan Nivel ${p.IdRol}`}</Text>
              <Text style={planesStyles.planPrecio}>${p.Precio} ARS</Text>

              <DetallesLista texto={textoDetalle} />
            </View>

            <View style={planesStyles.contenedorBoton}>
              <TouchableOpacity
                style={[
                  planesStyles.btnPlan,
                  esPlanActivoActual ? planesStyles.btnDeshabilitado : planesStyles.btnPlanSuscribir
                ]}
                disabled={procesandoAccion || esPlanActivoActual}
                onPress={() => confirmarCompra(p)}
              >
                {procesandoAccion ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <Text style={[planesStyles.btnTexto, esPlanActivoActual && { color: '#666' }]}>
                    {esPlanActivoActual ? "Tu Plan Actual" : "Activar este Plan"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        );
      })}
    </ScrollView>
  );
};


export default PlanesScreen;