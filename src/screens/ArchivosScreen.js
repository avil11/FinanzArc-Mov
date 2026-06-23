import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, Image, Linking } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../styles/styles"; // <-- IMPORTACIÓN GLOBAL

const API_BASE_URL = "http://192.168.100.3:45455/api";
const SERVER_HOST = "http://192.168.100.3:45455/api";

export default function ArchivosScreen() {
  const navigation = useNavigation();
  const [documentosIngreso, setDocumentosIngreso] = useState([]);
  const [documentosGasto, setDocumentosGasto] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [historialIngresos, setHistorialIngresos] = useState([]);
  const [historialGastos, setHistorialGastos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [errorVista, setErrorVista] = useState(null);
  const [sesionExpirada, setSesionExpirada] = useState(false);
  const [rolHabilitado, setRolHabilitado] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [tipoSubida, setTipoSubida] = useState("ingreso");
  const [idTransaccion, setIdTransaccion] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const [panelActivo, setPanelActivo] = useState("ingreso");
  const [mesFiltro, setMesFiltro] = useState("");
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear().toString());

  useEffect(() => { inicializarComponente(); }, []);

  useEffect(() => {
    if (modalAbierto) cargarTransacciones(tipoSubida);
  }, [modalAbierto, tipoSubida]);

  const cargarTransacciones = async (tipo) => {
    if (!usuario || !usuario.IdUsuario) return;
    const token = await AsyncStorage.getItem("Token");
    const endpoint = tipo === "ingreso" ? "HistorialIngreso" : "HistorialGasto";
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/ByUsuario/${usuario.IdUsuario}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (tipo === "ingreso") setHistorialIngresos(data);
        else setHistorialGastos(data);
      }
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
    }
  };

  const forzarCierreSesion = async (mensaje) => {
    await AsyncStorage.removeItem("Token");
    setErrorVista(mensaje);
    setSesionExpirada(true);
    setCargando(false);
  };

  const inicializarComponente = async () => {
    try {
      setCargando(true);
      setErrorVista(null);
      setSesionExpirada(false);

      const token = await AsyncStorage.getItem("Token");
      if (!token) return forzarCierreSesion("Su sesión ha expirado o no es válida.");

      const resUsuario = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, { headers: { "Authorization": `Bearer ${token}` } });
      if (resUsuario.status === 401) return forzarCierreSesion("Sesión expirada.");
      
      const datosUsuario = await resUsuario.json();
      setUsuario(datosUsuario);

      const esPremium = (datosUsuario.IdRol === 3 || datosUsuario.IdRol === 4);
      setRolHabilitado(esPremium);
      if (!esPremium) return setCargando(false);

      const [resIngresos, resGastos, resHistIng, resHistGas] = await Promise.all([
        fetch(`${API_BASE_URL}/DocumentoIngreso/Listar`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/DocumentoGasto/Listar`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/HistorialIngreso/ByUsuario/${datosUsuario.IdUsuario}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/HistorialGasto/ByUsuario/${datosUsuario.IdUsuario}`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!resIngresos.ok || !resGastos.ok) throw new Error("Error al recuperar catálogos.");

      const [dataIngresos, dataGastos, dataHistIng, dataHistGas] = await Promise.all([
        resIngresos.json(), resGastos.json(), resHistIng.json(), resHistGas.json()
      ]);

      setDocumentosIngreso(dataIngresos);
      setDocumentosGasto(dataGastos);
      setHistorialIngresos(dataHistIng);
      setHistorialGastos(dataHistGas);

    } catch (err) {
      setErrorVista(err.message || "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  };

  const filtrarDocumentos = (lista) => {
    return lista.filter((doc) => {
      const fecha = new Date(doc.FechaCarga);
      const coincideMes = mesFiltro === "" || (fecha.getMonth() + 1).toString() === mesFiltro;
      const coincideAnio = anioFiltro === "" || fecha.getFullYear().toString() === anioFiltro;
      return coincideMes && coincideAnio;
    });
  };

  const ingresosFiltrados = useMemo(() => filtrarDocumentos(documentosIngreso), [documentosIngreso, mesFiltro, anioFiltro]);
  const gastosFiltrados = useMemo(() => filtrarDocumentos(documentosGasto), [documentosGasto, mesFiltro, anioFiltro]);

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (result.canceled === false && result.assets.length > 0) {
        setArchivoSeleccionado(result.assets[0]);
      }
    } catch (err) { Alert.alert("Error", "No se pudo seleccionar el archivo"); }
  };

  const ejecutarSubidaArchivo = async () => {
    if (!archivoSeleccionado) return Alert.alert("Aviso", "Por favor, seleccione un archivo.");
    if (!idTransaccion) return Alert.alert("Aviso", "Por favor, seleccione una transacción.");

    setSubiendo(true);
    const token = await AsyncStorage.getItem("Token");
    const formData = new FormData();
    formData.append("archivo", { uri: archivoSeleccionado.uri, name: archivoSeleccionado.name, type: archivoSeleccionado.mimeType || 'application/octet-stream' });

    let urlUpload = tipoSubida === "ingreso" ? `${API_BASE_URL}/DocumentoIngreso/Upload` : `${API_BASE_URL}/DocumentoGasto/Upload`;
    formData.append(tipoSubida === "ingreso" ? "idIngreso" : "idGasto", idTransaccion);

    try {
      const respuesta = await fetch(urlUpload, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        body: formData
      });
      if (!respuesta.ok) throw new Error("Error al subir el archivo.");
      Alert.alert("Éxito", "Documento vinculado exitosamente.");
      setModalAbierto(false);
      setArchivoSeleccionado(null);
      await inicializarComponente();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarDocumento = (idDocumento, tipo) => {
    Alert.alert("Confirmar", "¿Estás seguro de que deseas eliminar este comprobante?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem("Token");
          const endpoint = tipo === "ingreso" ? "DocumentoIngreso" : "DocumentoGasto";
          try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/Eliminar/${idDocumento}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (!response.ok) throw new Error("Error en el servidor al eliminar.");
            
            if (tipo === "ingreso") setDocumentosIngreso((prev) => prev.filter(doc => doc.IdDocumentoIngreso != idDocumento));
            else setDocumentosGasto((prev) => prev.filter(doc => doc.IdDocumentoGasto != idDocumento));
            Alert.alert("Éxito", "Comprobante eliminado con éxito.");
          } catch (error) { Alert.alert("Error", error.message); }
        }
      }
    ]);
  };

  const abrirModalCarga = (tipo) => {
    setTipoSubida(tipo);
    setIdTransaccion("");
    setArchivoSeleccionado(null);
    setModalAbierto(true);
  };

  const esImagen = (ext) => ext ? [".jpg", ".jpeg", ".png", ".gif"].includes(ext.toLowerCase()) : false;

  const renderTarjetaDocumento = (doc, tipo) => {
    const isIngreso = tipo === "ingreso";
    const refHistorial = isIngreso 
        ? (historialIngresos.find(h => h.IdHistorialIngreso === doc.IdIngreso)?.Descripcion || "No encontrada")
        : (historialGastos.find(h => h.IdHistorialGasto === doc.IdGasto)?.Descripcion || "No encontrada");

    return (
      <View key={isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto} style={globalStyles.tarjetaArchivo}>
        <View style={globalStyles.archivoPreviewCaja}>
          {esImagen(doc.ExtensionArchivo) ? (
            <Image source={{ uri: `${SERVER_HOST}${doc.RutaArchivo}` }} style={globalStyles.archivoImagen} />
          ) : (
            <View style={globalStyles.archivoIconoGenerico}>
              <Text style={globalStyles.archivoIconoTexto}>{doc.ExtensionArchivo ? doc.ExtensionArchivo.replace(".", "").toUpperCase() : "DOC"}</Text>
            </View>
          )}
        </View>
        <View style={globalStyles.archivoDetalles}>
          <Text style={globalStyles.archivoTitulo} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
          <Text style={globalStyles.archivoRef}>Ref: {refHistorial}</Text>
          <Text style={globalStyles.movimientoFecha}>{new Date(doc.FechaCarga).toLocaleDateString()}</Text>
        </View>
        <View style={globalStyles.archivoAcciones}>
          <TouchableOpacity style={globalStyles.botonDescarga} onPress={() => Linking.openURL(`${SERVER_HOST}${doc.RutaArchivo}`)}>
            <Text style={globalStyles.textoDescarga}>Visualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.botonModalEliminar} onPress={() => eliminarDocumento(isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto, tipo)}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={globalStyles.centroTotal}>
        <ActivityIndicator size="large" color="#c8b277" />
        <Text style={{ color: "#fff", marginTop: 15 }}>Cargando repositorio documental...</Text>
      </View>
    );
  }

  if (!rolHabilitado) {
    return (
      <View style={globalStyles.bloqueoContenedor}>
        <View style={globalStyles.bloqueoTarjeta}>
          <Text style={globalStyles.bloqueoIcono}>🔒</Text>
          <Text style={globalStyles.bloqueoTitulo}>Apartado No Habilitado</Text>
          <Text style={globalStyles.bloqueoTexto}>Tu plan actual no incluye el gestor de comprobantes. Mejorá tu suscripción para desbloquearlo.</Text>
          <TouchableOpacity style={globalStyles.botonModalPrimario} onPress={() => navigation.navigate("planes")}>
            <Text style={globalStyles.loginBtnText}>Mejorar mi Plan 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.botonSecundarioBorde} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.textoSecundarioBorde}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (errorVista) {
    return (
      <View style={globalStyles.centroTotal}>
        <View style={globalStyles.alertaCaja}>
          <Text style={globalStyles.tituloPrincipal}>{sesionExpirada ? "Autenticación" : "Error"}</Text>
          <Text style={globalStyles.bloqueoTexto}>{errorVista}</Text>
          <TouchableOpacity style={globalStyles.botonComparativa} onPress={inicializarComponente}>
            <Text style={globalStyles.botonComparativaTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.contenedorPrincipal}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.seccionEncabezado}>
          <Text style={globalStyles.tituloPrincipal}>Comprobantes</Text>
          <Text style={globalStyles.descripcionEncabezado}>Gestor de tickets y facturas digitalizados.</Text>
        </View>

        <View style={globalStyles.filtrosRow}>
            <View style={globalStyles.pickerWrapperFiltro}>
                <Picker selectedValue={mesFiltro} style={globalStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setMesFiltro}>
                    <Picker.Item label="Todos los meses" value="" />
                    {Array.from({ length: 12 }, (_, i) => (
                    <Picker.Item key={i + 1} label={new Date(0, i).toLocaleString('es-ES', { month: 'long' })} value={(i + 1).toString()} />
                    ))}
                </Picker>
            </View>
            <View style={globalStyles.pickerWrapperFiltro}>
                <Picker selectedValue={anioFiltro} style={globalStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setAnioFiltro}>
                    <Picker.Item label="2024" value="2024" />
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                </Picker>
            </View>
        </View>

        <TouchableOpacity style={globalStyles.botonArchivar} onPress={() => abrirModalCarga("ingreso")}>
          <Text style={globalStyles.botonArchivarTexto}>+ Cargar Nuevo Comprobante</Text>
        </TouchableOpacity>

        <View style={[globalStyles.tabsContenedor, { marginTop: 24 }]}>
            <TouchableOpacity style={[globalStyles.tabBoton, panelActivo === "ingreso" && globalStyles.tabBotonActivo]} onPress={() => setPanelActivo("ingreso")}>
                <Text style={[globalStyles.tabTexto, panelActivo === "ingreso" && globalStyles.tabTextoActivo]}>Ingresos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.tabBoton, panelActivo === "gasto" && globalStyles.tabBotonActivo]} onPress={() => setPanelActivo("gasto")}>
                <Text style={[globalStyles.tabTexto, panelActivo === "gasto" && globalStyles.tabTextoActivo]}>Gastos</Text>
            </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
            {panelActivo === "ingreso" ? (
                ingresosFiltrados.length === 0 ? (
                    <View style={globalStyles.avisoVacio}><Text style={globalStyles.mensajeVacio}>No hay ingresos cargados.</Text></View>
                ) : ( ingresosFiltrados.map(doc => renderTarjetaDocumento(doc, "ingreso")) )
            ) : (
                gastosFiltrados.length === 0 ? (
                    <View style={globalStyles.avisoVacio}><Text style={globalStyles.mensajeVacio}>No hay gastos cargados.</Text></View>
                ) : ( gastosFiltrados.map(doc => renderTarjetaDocumento(doc, "gasto")) )
            )}
        </View>
        <View style={{height: 40}} />
      </ScrollView>

      {/* MODAL DE CARGA (Con diseño Premium global) */}
      <Modal visible={modalAbierto} animationType="slide" transparent={true} onRequestClose={() => setModalAbierto(false)}>
        <View style={globalStyles.capaModal}>
          <View style={globalStyles.contenidoModal}>
            <Text style={[globalStyles.tituloTarjeta, { color: "#c8b277" }]}>Vincular Archivo</Text>

            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Clasificación</Text>
              <View style={globalStyles.inputSelectContainer}>
                <Picker selectedValue={tipoSubida} style={globalStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={(val) => { setTipoSubida(val); setIdTransaccion(""); }}>
                  <Picker.Item label="Vincular a un Ingreso" value="ingreso" />
                  <Picker.Item label="Vincular a un Gasto" value="gasto" />
                </Picker>
              </View>
            </View>

            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Movimiento Registrado</Text>
              <View style={globalStyles.inputSelectContainer}>
                <Picker selectedValue={idTransaccion} style={globalStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setIdTransaccion}>
                  <Picker.Item label="-- Seleccione --" value="" />
                  {(tipoSubida === "ingreso" ? historialIngresos : historialGastos).map((item) => {
                    const id = tipoSubida === "ingreso" ? item.IdHistorialIngreso : item.IdHistorialGasto;
                    return <Picker.Item key={id} label={`${item.Descripcion} - $${item.Monto}`} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            <View style={globalStyles.formularioGrupo}>
              <Text style={globalStyles.labelForm}>Documento (PDF o Imagen)</Text>
              <TouchableOpacity style={[globalStyles.inputForm, { borderStyle: "dashed", borderColor: "rgba(200,178,119,0.5)", alignItems: "center", paddingVertical: 16 }]} onPress={seleccionarArchivo}>
                <Text style={{color: archivoSeleccionado ? "#fff" : "#8e8e93", fontWeight: archivoSeleccionado ? "bold" : "normal"}}>
                    {archivoSeleccionado ? archivoSeleccionado.name : "Toque para seleccionar..."}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={globalStyles.formularioAcciones}>
              <TouchableOpacity style={globalStyles.botonModalSecundario} onPress={() => setModalAbierto(false)} disabled={subiendo}>
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.botonModalPrimario} onPress={ejecutarSubidaArchivo} disabled={subiendo}>
                {subiendo ? <ActivityIndicator color="#121212" size="small" /> : <Text style={{ color: "#121212", fontWeight: "bold" }}>Subir</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}