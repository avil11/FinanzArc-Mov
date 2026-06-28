import React, { useState, useEffect, memo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tu IP local y puerto
const API_BASE_URL = "http://192.168.1.126:45457/api"; 

// 1. FUNCIÓN AUXILIAR (Switch Case) - Ubicada globalmente para que no haya errores de scope
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

// 2. COMPONENTE PARA VIÑETAS
const DetallesLista = memo(({ texto }) => {
  if (!texto || typeof texto !== "string" || texto.trim() === "") {
    return <Text style={styles.detalleVacio}>Sin descripción disponible.</Text>;
  }
  const lineas = texto.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  if (lineas.length === 0) return <Text style={styles.detalleVacio}>Sin descripción disponible.</Text>;

  return (
    <View style={styles.listaDetalles}>
      {lineas.map((linea, index) => {
        if (linea.startsWith("+")) {
          return <Text key={index} style={[styles.itemDetalle, styles.detalleIncluido]}>✅ {linea.substring(1).trim()}</Text>;
        } else if (linea.startsWith("-")) {
          return <Text key={index} style={[styles.itemDetalle, styles.detalleExcluido]}>❌ {linea.substring(1).trim()}</Text>;
        } else if (linea.startsWith(">")) {
          return <Text key={index} style={[styles.itemDetalle, styles.detalleDestacado]}>✨ {linea.substring(1).trim()}</Text>;
        } else {
          return <Text key={index} style={[styles.itemDetalle, styles.detalleNormal]}>• {linea}</Text>;
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
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#c8b277" />
        <Text style={styles.textoCargando}>Sincronizando planes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {usuario && (
        <View style={styles.bannerUsuario}>
          <Text style={styles.textoBanner}>
            Hola <Text style={{fontWeight: 'bold', color: '#fff'}}>{usuario.Nombre}</Text> • Plan Actual: <Text style={styles.rolResaltado}>{obtenerNombrePlan(usuario.IdRol)}</Text>
          </Text>
        </View>
      )}

      <Text style={styles.introduccion}>
        Centralice su gestión financiera con nuestros planes creados para usted.
      </Text>

      <View style={styles.selectorSuscripcion}>
        <TouchableOpacity
          style={[styles.tabBoton, tipoSuscripcion === 1 && styles.tabActivo]}
          onPress={() => setTipoSuscripcion(1)}
        >
          <Text style={[styles.tabTexto, tipoSuscripcion === 1 && styles.tabTextoActivo]}>Mensual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBoton, tipoSuscripcion === 2 && styles.tabActivo]}
          onPress={() => setTipoSuscripcion(2)}
        >
          <Text style={[styles.tabTexto, tipoSuscripcion === 2 && styles.tabTextoActivo]}>Anual</Text>
        </TouchableOpacity>
      </View>

      {planesFiltrados.map((p) => {
        const textoDetalle = (p.Detalle || p.Detalles || "").replace(". ", ".\n> ");
        const esPlanActivoActual = usuario?.IdRol === p.IdRol;

        return (
          <View key={p.IdPlan} style={[styles.tarjetaPlan, esPlanActivoActual && styles.tarjetaActiva]}>
            
            <View style={styles.contenidoSuperior}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={styles.badgeSuscripcion}>
                  {Number(p.IdTipoSuscripcion) === 1 ? "Mensual" : "Anual"}
                </Text>
                {esPlanActivoActual && (
                  <Text style={styles.badgePlanActual}>Plan Activo</Text>
                )}
              </View>

              <Text style={styles.planNombre}>{p.Nombre || `Plan Nivel ${p.IdRol}`}</Text>
              <Text style={styles.planPrecio}>${p.Precio} ARS</Text>

              <DetallesLista texto={textoDetalle} />
            </View>

            <View style={styles.contenedorBoton}>
              <TouchableOpacity
                style={[
                  styles.btnPlan, 
                  esPlanActivoActual ? styles.btnDeshabilitado : styles.btnPlanSuscribir
                ]}
                disabled={procesandoAccion || esPlanActivoActual}
                onPress={() => confirmarCompra(p)}
              >
                {procesandoAccion ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <Text style={[styles.btnTexto, esPlanActivoActual && { color: '#666' }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  textoCargando: {
    color: "#c8b277",
    marginTop: 10,
    fontSize: 16,
  },
  bannerUsuario: {
    backgroundColor: "#1e1e1f",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#c8b277",
    alignItems: "center"
  },
  textoBanner: {
    color: "#aaa",
    fontSize: 13,
  },
  rolResaltado: {
    color: "#c8b277",
    fontWeight: "bold"
  },
  introduccion: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  selectorSuscripcion: {
    flexDirection: "row",
    backgroundColor: "#1e1e1f",
    borderRadius: 8,
    padding: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  tabBoton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActivo: {
    backgroundColor: "#c8b277",
  },
  tabTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextoActivo: {
    color: "#121212",
    fontWeight: "700",
  },
  tarjetaPlan: {
    backgroundColor: "#1e1e1f",
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#333",
  },
  tarjetaActiva: {
    borderColor: "#c8b277",
    borderWidth: 1.5,
  },
  contenidoSuperior: {
    flex: 1,
  },
  badgeSuscripcion: {
    backgroundColor: "#333",
    color: "#c8b277",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  badgePlanActual: {
    backgroundColor: "#c8b277",
    color: "#121212",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: "bold",
  },
  planNombre: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  planPrecio: {
    color: "#c8b277",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  listaDetalles: {
    marginVertical: 15,
  },
  itemDetalle: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  detalleIncluido: {
    color: "#e0e0e0",
  },
  detalleExcluido: {
    color: "#888",
    textDecorationLine: "line-through",
  },
  detalleDestacado: {
    color: "#c8b277",
    fontWeight: "600",
  },
  detalleNormal: {
    color: "#ccc",
  },
  detalleVacio: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  contenedorBoton: {
    marginTop: 15,
    minHeight: 48,
  },
  btnPlan: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPlanSuscribir: {
    backgroundColor: "#c8b277",
  },
  btnDeshabilitado: {
    backgroundColor: "#2d2d2d",
  },
  btnTexto: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlanesScreen;