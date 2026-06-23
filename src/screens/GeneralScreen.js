import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuLateral from "../components/MenuLateral"; // Ajusta la ruta según donde lo hayas guardado

import { API_BASE_URL, API_ENDPOINTS } from "../services/api";
import { authStorage } from "../services/auth";
import { globalStyles } from "../styles/styles";
import Navbar from "../components/Navbar";



const GastoIngreso = () => {
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [mostrarSaludo, setMostrarSaludo] = useState(true);
  const [datosGastos, setDatosGastos] = useState([]);
  const [datosIngresos, setDatosIngresos] = useState([]);
  const [metasAhorro, setMetasAhorro] = useState([]);
  const [idUsuarioActual, setIdUsuarioActual] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [apellidoUsuario, setApellidoUsuario] = useState("");

  const [cotizaciones, setCotizaciones] = useState({ USD: 1300, EUR: 1450 });

  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalArchivarAbierto, setModalArchivarAbierto] = useState(false);

  const [modalConfirmarEliminarAbierto, setModalConfirmarEliminarAbierto] = useState(false);
  const [metaAEliminarTemporal, setMetaAEliminarTemporal] = useState(null);

  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerObjetivo, setMostrarPickerObjetivo] = useState(false);

  const [toastConfig, setToastConfig] = useState({ visible: false, mensaje: "", tipo: "warning" });


  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  const lanzarToast = (mensaje, tipo = "warning") => {
    setToastConfig({ visible: true, mensaje, tipo });
    setTimeout(() => setToastConfig({ visible: false, mensaje: "", tipo: "warning" }), 4500);
  };

  const [metaForm, setMetaForm] = useState({
    IdMetaAhorro: null,
    Nombre: "",
    MontoObjetivo: "",
    MontoGuardado: "",
    FechaObjetivo: "",
    FechaInicio: "",
    Divisa: "1"
  });

  const COLORES = ["#007AFF", "#FF9500", "#34C759", "#AF52DE"];
  const COLORESgasto = ["#FF4B4B", "#FFD700", "#4B79FF", "#FF7F50"];

  const obtenerCotizaciones = async () => {
    try {
      const resUsd = await fetch("https://dolarapi.com/v1/dolares/blue");
      const resEur = await fetch("https://dolarapi.com/v1/cotizaciones/eur");

      if (!resUsd.ok || !resEur.ok) throw new Error("Error en la conexión");

      const dataUsd = await resUsd.json();
      const dataEur = await resEur.json();

      const nuevasCotizaciones = {
        USD: Number(dataUsd.venta).toFixed(2),
        EUR: Number(dataEur.venta).toFixed(2)
      };
      setCotizaciones(nuevasCotizaciones);
      return nuevasCotizaciones;
    } catch (error) {
      const respaldo = { USD: "1300.00", EUR: "1450.00" };
      setCotizaciones(respaldo);
      return respaldo;
    }
  };

  const formatMontoParaInput = (val) => {
    if (val === "" || val === null || val === undefined) return "";
    const stringVal = val.toString();
    const parts = stringVal.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + "," + parts[1] : stringVal;
  };

  useEffect(() => {
    const temporizador = setTimeout(() => setMostrarSaludo(false), 4000);

    const inicializarDatos = async () => {
      const nom = await authStorage.getItem("Nombre");
      const ape = await authStorage.getItem("Apellido");
      if (nom) setNombreUsuario(nom);
      if (ape) setApellidoUsuario(ape);

      const cotizacionesData = await obtenerCotizaciones();
      obtenerDatos(cotizacionesData);
    };

    inicializarDatos();
    return () => clearTimeout(temporizador);
  }, []);

  const convertirAPesos = (monto, divisa, cotizacionesObj) => {
    const valor = Number(monto) || 0;
    const c = cotizacionesObj || cotizaciones;
    switch (Number(divisa)) {
      case 2: return valor * Number(c.USD);
      case 3: return valor * Number(c.EUR);
      default: return valor;
    }
  };

  const obtenerDatos = async (cotizacionesData) => {
    const token = await authStorage.getItem("Token");
    if (!token) return;

    fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/ByToken`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setIdUsuarioActual(data.IdUsuario);
        setRolUsuario(data.IdRol);
        obtenerGastos(data.IdUsuario, cotizacionesData, token);
        obtenerIngresos(data.IdUsuario, cotizacionesData, token);
        obtenerAhorros(data.IdUsuario, cotizacionesData, token);
      })
      .catch(err => console.error("Error al obtener usuario:", err));
  };

  const obtenerGastos = (idusuario, cotizacionesData, token) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.gastos}/ByUsuario/${idusuario}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const gastosProcesados = data.map(item => ({
          name: item.Descripcion || "Sin descripción",
          valor: convertirAPesos(item.MontoGasto, item.IdDivisa, cotizacionesData),
          monedaOriginal: Number(item.IdDivisa) === 2 ? "USD" : Number(item.IdDivisa) === 3 ? "EUR" : "ARS"
        }));
        setDatosGastos(gastosProcesados);
      }).catch(() => { });
  };

  const obtenerIngresos = (idusuario, cotizacionesData, token) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ingresos}/ByUsuario/${idusuario}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ingresosProcesados = data.map(item => ({
          name: item.Descripcion || "Sin Descripción",
          valor: convertirAPesos(item.MontoIngreso, item.IdDivisa, cotizacionesData),
          monedaOriginal: Number(item.IdDivisa) === 2 ? "USD" : Number(item.IdDivisa) === 3 ? "EUR" : "ARS"
        }));
        setDatosIngresos(ingresosProcesados);
      }).catch(() => { });
  };

  const obtenerAhorros = (idusuario, cotizacionesData, token) => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/ByUsuario/${idusuario}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const metasProcesadas = data.map(item => ({
          ...item,
          etiqueta: item.Nombre || "Meta de ahorro",
          actual: convertirAPesos(item.MontoGuardado, item.IdDivisa, cotizacionesData),
          objetivo: convertirAPesos(item.MontoObjetivo, item.IdDivisa, cotizacionesData)
        }));
        setMetasAhorro(metasProcesadas);
      }).catch(() => { });
  };

  const obtenerLimiteMetas = (idRol) => {
    switch (idRol) {
      case 1: return 1;
      case 2: return 3;
      case 3: return 5;
      case 4: return Infinity;
      default: return 1;
    }
  };

  const metasActivas = metasAhorro.filter(meta => meta.IdEstadoMetaAhorro !== 2);
  const metasCompletadas = metasAhorro.filter(meta => meta.IdEstadoMetaAhorro === 2);
  const limiteMetas = obtenerLimiteMetas(rolUsuario);
  const cantidadMetasActivas = metasActivas.length;
  const metasDisponibles = limiteMetas - cantidadMetasActivas;
  const limiteAlcanzado = cantidadMetasActivas >= limiteMetas;

  const manejarGuardarMeta = async () => {
    const token = await authStorage.getItem("Token");
    const esEdicion = metaForm.IdMetaAhorro !== null && metaForm.IdMetaAhorro !== undefined;

    if (!esEdicion && limiteAlcanzado) {
      lanzarToast(`Has alcanzado el máximo de ${limiteMetas} metas permitidas.`, "warning");
      return;
    }
    if (!metaForm.Nombre || !metaForm.Nombre.trim()) {
      lanzarToast("Debes ingresar un nombre para la meta", "warning");
      return;
    }
    const monto = Number(metaForm.MontoObjetivo);
    if (!metaForm.MontoObjetivo || monto <= 0) {
      lanzarToast("Debes ingresar un monto objetivo válido", "warning");
      return;
    }
    if (monto > 9999999999) {
      lanzarToast("El monto objetivo no puede superar los 10 dígitos", "error");
      return;
    }
    if (!metaForm.FechaInicio || !metaForm.FechaObjetivo) {
      lanzarToast("Debes seleccionar las fechas de inicio y objetivo", "warning");
      return;
    }
    if (new Date(metaForm.FechaObjetivo) < new Date(metaForm.FechaInicio)) {
      lanzarToast("La fecha objetivo no puede ser menor a la fecha de inicio", "error");
      return;
    }

    const metaAGuardar = {
      IdMetaAhorro: metaForm.IdMetaAhorro,
      Nombre: metaForm.Nombre,
      MontoObjetivo: parseFloat(metaForm.MontoObjetivo),
      MontoGuardado: parseFloat(metaForm.MontoGuardado || 0),
      FechaMeta: new Date(metaForm.FechaObjetivo + 'T12:00:00').toISOString(),
      FechaInicio: new Date(metaForm.FechaInicio + 'T12:00:00').toISOString(),
      IdDivisa: parseInt(metaForm.Divisa || 1),
      IdUsuario: idUsuarioActual
    };

    const url = esEdicion ? `${API_BASE_URL}${API_ENDPOINTS.ahorros}/${metaAGuardar.IdMetaAhorro}` : `${API_BASE_URL}${API_ENDPOINTS.ahorros}`;
    const metodo = esEdicion ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(metaAGuardar)
    })
      .then(response => {
        if (!response.ok) throw new Error();
        lanzarToast(esEdicion ? "Meta actualizada correctamente" : "Meta creada correctamente", "success");
        setModalAgregarAbierto(false);
        setModalEditarAbierto(false);
        obtenerDatos(cotizaciones);
      })
      .catch(() => {
        lanzarToast(esEdicion ? "Error al actualizar la meta" : "Error al crear la meta", "error");
      });
  };

  const manejarEliminarMeta = (metaDesdeLista = null) => {
    setMetaAEliminarTemporal(metaDesdeLista);
    setModalConfirmarEliminarAbierto(true);
  };

  const ejecutarEliminacionConfirmada = async () => {
    const idAEliminar = metaAEliminarTemporal?.IdMetaAhorro || metaForm.IdMetaAhorro;
    if (!idAEliminar) return;

    const token = await authStorage.getItem("Token");
    fetch(`${API_BASE_URL}${API_ENDPOINTS.ahorros}/${idAEliminar}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error();
        lanzarToast("Meta eliminada correctamente", "success");
        setModalConfirmarEliminarAbierto(false);
        setModalEditarAbierto(false);
        setMetaAEliminarTemporal(null);
        obtenerDatos(cotizaciones);
      })
      .catch(() => {
        lanzarToast("Error al eliminar la meta", "error");
        setModalConfirmarEliminarAbierto(false);
        setMetaAEliminarTemporal(null);
      });
  };

  const archivarMesActual = async () => {
    if (!idUsuarioActual) {
      lanzarToast("No se encontró un usuario válido para realizar la action.", "warning");
      return;
    }
    if (!rolUsuario || rolUsuario < 2) {
      lanzarToast("Acceso denegado: Tu plan actual no te permite realizar esta acción.", "error");
      return;
    }

    try {
      setModalArchivarAbierto(false);
      const token = await authStorage.getItem("Token");
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.cierre}/FinalizarMes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ IdUsuario: idUsuarioActual })
      });

      if (response.ok) {
        lanzarToast("¡Mes archivado correctamente!", "success");
        obtenerDatos(cotizaciones);
      } else {
        lanzarToast("Error al archivar el mes actual. Verifica el servidor.", "error");
      }
    } catch (error) {
      lanzarToast("Error de red al intentar archivar el mes.", "error");
    }
  };

  const cerrarSesionConfirmado = async () => {
    try {
      await authStorage.removeItem("Token");
      await authStorage.removeItem("Nombre");
      await authStorage.removeItem("Apellido");
      await authStorage.removeItem("IdUsuario");
      await authStorage.removeItem("IdRol");
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      lanzarToast("Error al cerrar sesión", "error");
    }
  };

  const manejarCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              // Usamos AsyncStorage directo para evitar que el helper authStorage falle
              await AsyncStorage.removeItem("Token");
              await AsyncStorage.removeItem("Nombre");
              await AsyncStorage.removeItem("Apellido");

              // Reseteamos el stack para que el usuario no pueda volver atrás
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              lanzarToast("Error al intentar salir", "error");
            }
          }
        }
      ]
    );
  };
  const calcularTotal = (datos) => datos.reduce((acum, item) => acum + Number(item.valor || 0), 0);
  const obtenerTopCinco = (items) => [...items].sort((a, b) => b.valor - a.valor).slice(0, 5);

  const abrirModalAgregar = () => {
    if (limiteAlcanzado) return;
    setMetaForm({
      IdMetaAhorro: null,
      Nombre: "",
      MontoObjetivo: "",
      MontoGuardado: "0",
      FechaObjetivo: new Date().toISOString().split("T")[0],
      FechaInicio: new Date().toISOString().split("T")[0],
      Divisa: "1"
    });
    setModalAgregarAbierto(true);
  };

  const abrirModalEditar = (meta) => {
    setMetaForm({
      IdMetaAhorro: meta.IdMetaAhorro,
      Nombre: meta.Nombre || "",
      MontoObjetivo: (meta.MontoObjetivo || "").toString(),
      MontoGuardado: (meta.MontoGuardado || "").toString(),
      FechaObjetivo: meta.FechaMeta ? meta.FechaMeta.split("T")[0] : new Date().toISOString().split("T")[0],
      FechaInicio: meta.FechaInicio ? meta.FechaInicio.split("T")[0] : new Date().toISOString().split("T")[0],
      Divisa: (meta.IdDivisa || 1).toString()
    });
    setModalEditarAbierto(true);
  };

  const tienePermisoArchivar = rolUsuario !== null && rolUsuario >= 2;

  const CustomNativePieChart = ({ data, coloresLista }) => {
    const total = calcularTotal(data);
    const radio = 45;
    const circunferencia = 2 * Math.PI * radio;
    let anguloAcumulado = 0;

    return (

      <View style={globalStyles.contenedorGraficoPie}>
        <Svg width="130" height="130" viewBox="0 0 110 110">
          <G transformOrigin>
            {data.map((item, index) => {
              const porcentaje = total > 0 ? item.valor / total : 0;
              const strokeDashoffset = circunferencia - (porcentaje * circunferencia);
              const strokeRotation = anguloAcumulado;
              anguloAcumulado += porcentaje * 360;

              return (
                <Circle
                  key={index}
                  cx="55"
                  cy="55"
                  r={radio}
                  fill="transparent"
                  stroke={coloresLista[index % coloresLista.length]}
                  strokeWidth="10"
                  strokeDasharray={`${circunferencia} ${circunferencia}`}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${strokeRotation}, 55, 55)`}
                />
              );
            })}
          </G>
          <SvgText x="55" y="52" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="600">Total</SvgText>
          <SvgText x="55" y="66" textAnchor="middle" fill="#c8b277" fontSize="10" fontWeight="bold">
            ${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </SvgText>
        </Svg>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <Navbar onOpenMenu={toggleMenu} />
      {/* 2. MENU LATERAL (CONDICIONAL) */}
      {menuVisible && (
        <View style={styles.overlayMenu}>
          {/* 1. Área transparente que permite cerrar el menú al tocar fuera */}
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />

          {/* 2. El Menú Lateral */}
          <View style={{ position: 'absolute', height: '100%', width: '80%' }}>
            <MenuLateral
              onClose={() => setMenuVisible(false)}
              onNavigate={(ruta) => {
                setMenuVisible(false);
                navigation.navigate("Archivos"); // <--- DESCOMENTA ESTO PARA QUE FUNCIONE
              }}
            />
          </View>
        </View>
      )}
      {toastConfig.visible && (
        <View style={[globalStyles.toastBanner, { backgroundColor: toastConfig.tipo === "success" ? "#34c759" : toastConfig.tipo === "error" ? "#dc3545" : "#ff9500" }]}>
          <Text style={globalStyles.toastTexto}>{toastConfig.mensaje}</Text>
        </View>
      )}

      {/* 3. Contenido Principal Scrollable */}
      <ScrollView style={globalStyles.contenedorPrincipal} >
        <View style={globalStyles.seccionEncabezado}>
          <Text style={globalStyles.tituloPrincipal}>
            {mostrarSaludo ? `¡Bienvenido, ${nombreUsuario} ${apellidoUsuario}!` : "Resumen financiero"}
          </Text>
          <Text style={globalStyles.descripcionEncabezado}>
            En este apartado usted verá el balance histórico y acumulado de sus gastos e ingresos. Podrá también establecer metas de ahorro.
          </Text>
          <Text style={globalStyles.descripcionEncabezado}>Todas las monedas son convertidas automáticamente a ARS.</Text>
          <Text style={globalStyles.cotizacionesTexto}>
            USD: ${cotizaciones.USD} | EUR: ${cotizaciones.EUR}
          </Text>
        </View>

        {/* Módulo de Gastos por Categoría */}
        {datosGastos.length > 0 ? (
          <View style={globalStyles.tarjetaGeneral}>
            <Text style={globalStyles.tituloTarjeta}>Gastos por Categoría</Text>
            <View style={globalStyles.graficoConLeyenda}>
              <CustomNativePieChart data={datosGastos} coloresLista={COLORESgasto} />
              <View style={globalStyles.leyendaGrafico}>
                {obtenerTopCinco(datosGastos).map((item, index) => (
                  <View style={globalStyles.itemLeyenda} key={index}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[globalStyles.circuloColor, { backgroundColor: COLORESgasto[index % COLORESgasto.length] }]} />
                      <View style={globalStyles.leyendaTextoContainer}>
                        <Text numberOfLines={1} style={globalStyles.leyendaTexto}>{item.name}</Text>
                      </View>
                    </View>
                    <Text style={globalStyles.valorMontoGasto}>${item.valor.toLocaleString("es-AR")}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={globalStyles.tarjetaGeneral}>
            <Text style={globalStyles.tituloTarjeta}>Gastos por Categoría</Text>
            <View style={globalStyles.avisoVacio}>
              <Text style={globalStyles.iconoPlaceholder}>📊</Text>
              <Text style={globalStyles.mensajeVacio}>No se encontraron gastos registrados.</Text>
              <Text style={globalStyles.sugerenciaVacio}>Registra movimientos para ver información.</Text>
            </View>
          </View>
        )}

        {/* Módulo de Fuentes de Ingreso */}
        {datosIngresos.length > 0 ? (
          <View style={globalStyles.tarjetaGeneral}>
            <Text style={globalStyles.tituloTarjeta}>Fuentes de Ingreso</Text>
            <View style={globalStyles.graficoConLeyenda}>
              <CustomNativePieChart data={datosIngresos} coloresLista={COLORES} />
              <View style={globalStyles.leyendaGrafico}>
                {obtenerTopCinco(datosIngresos).map((item, index) => (
                  <View style={globalStyles.itemLeyenda} key={index}>
                    <View style={[globalStyles.circuloColor, { backgroundColor: COLORES[index % COLORES.length] }]} />
                    <View style={globalStyles.leyendaTextoContainer}>
                      <Text numberOfLines={1} style={globalStyles.leyendaTexto}>{item.name}</Text>
                    </View>
                    <Text style={globalStyles.valorMontoIngreso}>${item.valor.toLocaleString("es-AR")}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={globalStyles.tarjetaGeneral}>
            <Text style={globalStyles.tituloTarjeta}>Fuentes de Ingreso</Text>
            <View style={globalStyles.avisoVacio}>
              <Text style={globalStyles.iconoPlaceholder}>📊</Text>
              <Text style={globalStyles.mensajeVacio}>No se encontraron ingresos registrados.</Text>
              <Text style={globalStyles.sugerenciaVacio}>Registra movimientos para ver información.</Text>
            </View>
          </View>
        )}

        {/* Módulo de Objetivos de Ahorro */}
        <View style={{ marginBottom: 40 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#ffffff" }}>Objetivos en Curso</Text>
            <TouchableOpacity style={[globalStyles.botonComparativa, { opacity: limiteAlcanzado ? 0.5 : 1 }]} onPress={abrirModalAgregar} disabled={limiteAlcanzado}>
              <Text style={globalStyles.botonComparativaTexto}>Agregar Meta</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.infoLimitesPlan}>
            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "500" }}>
              Metas activas: <Text style={{ color: "#c8b277", fontWeight: "bold" }}>{cantidadMetasActivas} / {limiteMetas === Infinity ? "∞" : limiteMetas}</Text>
            </Text>
            {rolUsuario === 4 ? (
              <Text style={{ fontSize: 12, color: "#8e8e93", marginTop: 4 }}>Administrador - sin restricciones.</Text>
            ) : limiteAlcanzado ? (
              <TouchableOpacity onPress={() => navigation.navigate("planes")}>
                <Text style={{ fontSize: 12, color: "#ff4b4b", marginTop: 4 }}>Has alcanzado el límite de tu plan.</Text>
                <Text style={{ fontSize: 12, color: "#c8b277", fontWeight: "500" }}>Mejorar mi plan para crear más metas 🚀</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 12, color: "#8e8e93", marginTop: 4 }}>Te quedan {metasDisponibles} metas disponibles.</Text>
            )}
          </View>

          {metasActivas.length > 0 ? (
            metasActivas.map((meta, idx) => {
              const porcentaje = meta.objetivo > 0 ? Math.min(100, (meta.actual / meta.objetivo) * 100) : 0;
              return (
                <View key={idx} style={globalStyles.tarjetaAhorroItem}>
                  <View style={globalStyles.filaProgreso}>
                    <Text style={{ color: "#fff", fontWeight: "500" }}>{meta.etiqueta}</Text>
                    <Text style={{ color: "#c8b277", fontWeight: "bold" }}>{porcentaje.toFixed(0)}%</Text>
                  </View>
                  <View style={globalStyles.pistaBarra}>
                    <View style={[globalStyles.rellenoBarra, { width: `${porcentaje}%` }]} />
                  </View>
                  <Text style={globalStyles.textoMontoProgreso}>
                    ${meta.actual.toLocaleString("es-AR")} / ${meta.objetivo.toLocaleString("es-AR")}
                  </Text>
                  <TouchableOpacity style={globalStyles.botonEditarAhorro} onPress={() => abrirModalEditar(meta)}>
                    <Text style={globalStyles.botonEditarAhorroTexto}>Editar</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={globalStyles.tarjetaGeneral}>
              <View style={globalStyles.avisoVacio}>
                <Text style={globalStyles.iconoPlaceholder}>🎯</Text>
                <Text style={globalStyles.mensajeVacio}>No hay objetivos de ahorro en curso.</Text>
                <Text style={globalStyles.sugerenciaVacio}>Haz clic en 'Agregar Meta' para empezar.</Text>
              </View>
            </View>
          )}

          {/* Logros Completados */}
          {metasCompletadas.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#c8b277", marginBottom: 12 }}>🏆 Logros Alcanzados</Text>
              {metasCompletadas.map((meta, idx) => (
                <View key={idx} style={globalStyles.tarjetaLogro}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>{meta.etiqueta}</Text>
                    <Text style={{ color: "#c8b277", fontWeight: "bold" }}>¡Completado!</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#8e8e93", fontSize: 13 }}>Total guardado: <Text style={{ color: "#fff", fontWeight: "bold" }}>${meta.actual.toLocaleString("es-AR")}</Text></Text>
                    <TouchableOpacity style={[globalStyles.botonModalEliminar, { paddingVertical: 4, paddingHorizontal: 10 }]} onPress={() => manejarEliminarMeta(meta)}>
                      <Text style={{ color: "#fff", fontSize: 12 }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL EDITAR META */}
      <Modal visible={modalEditarAbierto} animationType="slide" transparent={true} onRequestClose={() => setModalEditarAbierto(false)}>
        <View style={globalStyles.capaModal}>
          <View style={globalStyles.contenidoModal}>
            <Text style={[globalStyles.tituloTarjeta, { color: "#c8b277" }]}>Editar Meta de Ahorro</Text>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Nombre de la Meta ({metaForm.Nombre.length}/100)</Text>
              <TextInput style={globalStyles.inputForm} value={metaForm.Nombre} maxLength={100} onChangeText={(t) => setMetaForm({ ...metaForm, Nombre: t })} placeholder="Ej: Fondo de Emergencia" placeholderTextColor="#666" />
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Monto Actual ($)</Text>
              <TextInput style={globalStyles.inputForm} keyboardType="numeric" value={metaForm.MontoGuardado} onChangeText={(t) => setMetaForm({ ...metaForm, MontoGuardado: t.replace(/[^0-9.]/g, "") })} placeholder="0.00" placeholderTextColor="#666" />
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Monto Objetivo ($)</Text>
              <TextInput style={globalStyles.inputForm} keyboardType="numeric" value={metaForm.MontoObjetivo} onChangeText={(t) => setMetaForm({ ...metaForm, MontoObjetivo: t.replace(/[^0-9.]/g, "") })} placeholder="0.00" placeholderTextColor="#666" />
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Fecha de Inicio</Text>
              <TouchableOpacity style={globalStyles.inputForm} onPress={() => setMostrarPickerInicio(true)}>
                <Text style={{ color: metaForm.FechaInicio ? "#ffffff" : "#666666", paddingVertical: 4 }}>
                  {metaForm.FechaInicio || "Seleccionar Fecha"}
                </Text>
              </TouchableOpacity>
              {mostrarPickerInicio && (
                <DateTimePicker
                  value={metaForm.FechaInicio ? new Date(metaForm.FechaInicio + 'T12:00:00') : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarPickerInicio(false);
                    if (selectedDate) {
                      const fechaFormateada = selectedDate.toISOString().split('T')[0];
                      setMetaForm({ ...metaForm, FechaInicio: fechaFormateada });
                    }
                  }}
                />
              )}
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Fecha Objetivo</Text>
              <TouchableOpacity style={globalStyles.inputForm} onPress={() => setMostrarPickerObjetivo(true)}>
                <Text style={{ color: metaForm.FechaObjetivo ? "#ffffff" : "#666666", paddingVertical: 4 }}>
                  {metaForm.FechaObjetivo || "Seleccionar Fecha"}
                </Text>
              </TouchableOpacity>
              {mostrarPickerObjetivo && (
                <DateTimePicker
                  value={metaForm.FechaObjetivo ? new Date(metaForm.FechaObjetivo + 'T12:00:00') : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarPickerObjetivo(false);
                    if (selectedDate) {
                      const fechaFormateada = selectedDate.toISOString().split('T')[0];
                      setMetaForm({ ...metaForm, FechaObjetivo: fechaFormateada });
                    }
                  }}
                />
              )}
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Divisa</Text>
              <View style={globalStyles.inputSelectContainer}>
                <Picker selectedValue={metaForm.Divisa} dropdownIconColor="#c8b277" style={globalStyles.pickerNativo} onValueChange={(itemValue) => setMetaForm({ ...metaForm, Divisa: itemValue })}>
                  <Picker.Item label="ARS - Peso Argentino" value="1" />
                  <Picker.Item label="USD - Dólar Estadounidense" value="2" />
                  <Picker.Item label="EUR - Euro" value="3" />
                </Picker>
              </View>
            </View>
            <View style={globalStyles.formularioAcciones}>
              <TouchableOpacity style={globalStyles.botonModalEliminar} onPress={() => manejarEliminarMeta(null)}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.botonModalSecundario} onPress={() => setModalEditarAbierto(false)}>
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.botonModalPrimario} onPress={manejarGuardarMeta}>
                <Text style={{ color: "#121212", fontWeight: "bold" }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL NUEVA META */}
      <Modal visible={modalAgregarAbierto} animationType="slide" transparent={true} onRequestClose={() => setModalAgregarAbierto(false)}>
        <View style={globalStyles.capaModal}>
          <View style={globalStyles.contenidoModal}>
            <Text style={[globalStyles.tituloTarjeta, { color: "#c8b277" }]}>Nueva Meta de Ahorro</Text>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Nombre de la Meta ({metaForm.Nombre.length}/100)</Text>
              <TextInput style={globalStyles.inputForm} value={metaForm.Nombre} maxLength={100} onChangeText={(t) => setMetaForm({ ...metaForm, Nombre: t })} placeholder="Ej: Fondo de Emergencia" placeholderTextColor="#666" />
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Monto Objetivo ($)</Text>
              <TextInput style={globalStyles.inputForm} keyboardType="numeric" value={metaForm.MontoObjetivo} onChangeText={(t) => setMetaForm({ ...metaForm, MontoObjetivo: t.replace(/[^0-9.]/g, "") })} placeholder="0.00" placeholderTextColor="#666" />
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Fecha de Inicio</Text>
              <TouchableOpacity style={globalStyles.inputForm} onPress={() => setMostrarPickerInicio(true)}>
                <Text style={{ color: metaForm.FechaInicio ? "#ffffff" : "#666666", paddingVertical: 4 }}>
                  {metaForm.FechaInicio || "Seleccionar Fecha"}
                </Text>
              </TouchableOpacity>
              {mostrarPickerInicio && (
                <DateTimePicker
                  value={metaForm.FechaInicio ? new Date(metaForm.FechaInicio + 'T12:00:00') : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarPickerInicio(false);
                    if (selectedDate) {
                      const fechaFormateada = selectedDate.toISOString().split('T')[0];
                      setMetaForm({ ...metaForm, FechaInicio: fechaFormateada });
                    }
                  }}
                />
              )}
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Fecha Objetivo</Text>
              <TouchableOpacity style={globalStyles.inputForm} onPress={() => setMostrarPickerObjetivo(true)}>
                <Text style={{ color: metaForm.FechaObjetivo ? "#ffffff" : "#666666", paddingVertical: 4 }}>
                  {metaForm.FechaObjetivo || "Seleccionar Fecha"}
                </Text>
              </TouchableOpacity>
              {mostrarPickerObjetivo && (
                <DateTimePicker
                  value={metaForm.FechaObjetivo ? new Date(metaForm.FechaObjetivo + 'T12:00:00') : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setMostrarPickerObjetivo(false);
                    if (selectedDate) {
                      const fechaFormateada = selectedDate.toISOString().split('T')[0];
                      setMetaForm({ ...metaForm, FechaObjetivo: fechaFormateada });
                    }
                  }}
                />
              )}
            </View>
            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Divisa</Text>
              <View style={globalStyles.inputSelectContainer}>
                <Picker selectedValue={metaForm.Divisa} dropdownIconColor="#c8b277" style={globalStyles.pickerNativo} onValueChange={(itemValue) => setMetaForm({ ...metaForm, Divisa: itemValue })}>
                  <Picker.Item label="ARS - Peso Argentino" value="1" />
                  <Picker.Item label="USD - Dólar Estadounidense" value="2" />
                  <Picker.Item label="EUR - Euro" value="3" />
                </Picker>
              </View>
            </View>
            <View style={globalStyles.formularioAcciones}>
              <TouchableOpacity style={globalStyles.botonModalSecundario} onPress={() => setModalAgregarAbierto(false)}>
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.botonModalPrimario} onPress={manejarGuardarMeta}>
                <Text style={{ color: "#121212", fontWeight: "bold" }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONFIRMAR ELIMINAR */}
      <Modal visible={modalConfirmarEliminarAbierto} animationType="fade" transparent={true} onRequestClose={() => setModalConfirmarEliminarAbierto(false)}>
        <View style={globalStyles.capaModal}>
          <View style={[globalStyles.contenidoModal, { maxWidth: '85%', paddingVertical: 24, paddingHorizontal: 20 }]}>
            <Text style={[globalStyles.tituloTarjeta, { color: "#ffffff", textAlign: "center", marginBottom: 12, fontSize: 18 }]}>
              Confirmar Eliminación
            </Text>
            <Text style={{ color: "#a1a1a6", fontSize: 14, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              ¿Estás seguro de que querés eliminar este logro de tu historial?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <TouchableOpacity
                style={[globalStyles.botonModalSecundario, { flex: 1, marginRight: 8, paddingVertical: 12 }]}
                onPress={() => {
                  setModalConfirmarEliminarAbierto(false);
                  setMetaAEliminarTemporal(null);
                }}
              >
                <Text style={{ color: "#007aff", fontWeight: "600", fontSize: 15, textAlign: "center" }}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.botonModalEliminar, { flex: 1, marginLeft: 8, paddingVertical: 12, backgroundColor: "transparent" }]}
                onPress={ejecutarEliminacionConfirmada}
              >
                <Text style={{ color: "#ff453a", fontWeight: "bold", fontSize: 15, textAlign: "center" }}>ELIMINAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  overlayMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Esto asegura que el menú esté encima de todo
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente oscuro
  },
});

export default GastoIngreso;