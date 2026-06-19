import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal, TextInput, Image, Linking } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "http://192.168.1.126:45455/api";
const SERVER_HOST = "http://192.168.1.126:45455/api";

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

  useEffect(() => {
    inicializarComponente();
  }, []);

  useEffect(() => {
    if (modalAbierto) {
      cargarTransacciones(tipoSubida);
    }
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
      if (!token) {
        forzarCierreSesion("Su sesión ha expirado o no es válida.");
        return;
      }

      const resUsuario = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (resUsuario.status === 401) {
        forzarCierreSesion("Sesión expirada.");
        return;
      }
      
      const datosUsuario = await resUsuario.json();
      setUsuario(datosUsuario);

      const esPremium = (datosUsuario.IdRol === 3 || datosUsuario.IdRol === 4);
      setRolHabilitado(esPremium);
      if (!esPremium) {
        setCargando(false);
        return;
      }

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
    } catch (err) { 
      Alert.alert("Error", "No se pudo seleccionar el archivo"); 
    }
  };

  const ejecutarSubidaArchivo = async () => {
    if (!archivoSeleccionado) {
      Alert.alert("Aviso", "Por favor, seleccione un archivo.");
      return;
    }
    if (!idTransaccion) {
        Alert.alert("Aviso", "Por favor, seleccione una transacción.");
        return;
    }

    setSubiendo(true);
    const token = await AsyncStorage.getItem("Token");
    const formData = new FormData();
    
    formData.append("archivo", {
        uri: archivoSeleccionado.uri,
        name: archivoSeleccionado.name,
        type: archivoSeleccionado.mimeType || 'application/octet-stream'
    });

    let urlUpload = "";
    if (tipoSubida === "ingreso") {
      formData.append("idIngreso", idTransaccion);
      urlUpload = `${API_BASE_URL}/DocumentoIngreso/Upload`;
    } else {
      formData.append("idGasto", idTransaccion);
      urlUpload = `${API_BASE_URL}/DocumentoGasto/Upload`;
    }

    try {
      const respuesta = await fetch(urlUpload, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        },
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
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este comprobante? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("Token");
            const endpoint = tipo === "ingreso" ? "DocumentoIngreso" : "DocumentoGasto";
            try {
              const url = `${API_BASE_URL}/${endpoint}/Eliminar/${idDocumento}`;
              const response = await fetch(url, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
              });

              if (!response.ok) throw new Error("Error en el servidor al eliminar.");
              
              if (tipo === "ingreso") {
                setDocumentosIngreso((prev) => prev.filter(doc => doc.IdDocumentoIngreso != idDocumento));
              } else {
                setDocumentosGasto((prev) => prev.filter(doc => doc.IdDocumentoGasto != idDocumento));
              }
              Alert.alert("Éxito", "Comprobante eliminado con éxito.");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const abrirModalCarga = (tipo) => {
    setTipoSubida(tipo);
    setIdTransaccion("");
    setArchivoSeleccionado(null);
    setModalAbierto(true);
  };

  const esImagen = (extension) => extension ? [".jpg", ".jpeg", ".png", ".gif"].includes(extension.toLowerCase()) : false;

  const renderTarjetaDocumento = (doc, tipo) => {
    const isIngreso = tipo === "ingreso";
    const refHistorial = isIngreso 
        ? (historialIngresos.find(h => h.IdHistorialIngreso === doc.IdIngreso)?.Descripcion || "No encontrada")
        : (historialGastos.find(h => h.IdHistorialGasto === doc.IdGasto)?.Descripcion || "No encontrada");

    return (
      <View key={isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto} style={styles.tarjetaArchivoItem}>
        <View style={styles.contenedorVistaPrevia}>
          {esImagen(doc.ExtensionArchivo) ? (
            <Image source={{ uri: `${SERVER_HOST}${doc.RutaArchivo}` }} style={styles.imagenPreviewRender} />
          ) : (
            <View style={styles.iconoDocumentoGenerico}>
              <Text style={styles.iconoTexto}>{doc.ExtensionArchivo ? doc.ExtensionArchivo.replace(".", "").toUpperCase() : "DOC"}</Text>
            </View>
          )}
        </View>
        <View style={styles.detallesArchivoItem}>
          <Text style={styles.tituloDoc} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
          <Text style={styles.textoDoc}>Fecha: {new Date(doc.FechaCarga).toLocaleDateString()}</Text>
          <Text style={styles.textoDoc}>Ref: {refHistorial}</Text>
        </View>
        <View style={styles.accionesArchivoItem}>
          <TouchableOpacity style={styles.enlaceDescarga} onPress={() => Linking.openURL(`${SERVER_HOST}${doc.RutaArchivo}`)}>
            <Text style={styles.textoEnlaceDescarga}>Ver / Descargar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarDocumento(isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto, tipo)}>
            <Text style={styles.textoBotonEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.cargandoContenedor}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.textoCargando}>Cargando repositorio documental...</Text>
      </View>
    );
  }

  if (!rolHabilitado) {
    return (
      <View style={styles.contenedorBloqueado}>
        <View style={styles.tarjetaBloqueada}>
          <Text style={styles.iconoBloqueo}>🔒</Text>
          <Text style={styles.tituloBloqueo}>Apartado No Habilitado</Text>
          <Text style={styles.textoBloqueo}>Para acceder a este apartado, necesitas mejorar tu suscripción actual.</Text>
          <TouchableOpacity style={styles.botonMejorarPlan} onPress={() => navigation.navigate("planes")}>
            <Text style={styles.textoBotonMejorar}>Mejorar mi Plan 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
            <Text style={styles.textoBotonVolver}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (errorVista) {
    return (
      <View style={styles.cargandoContenedor}>
        <View style={styles.alertaError}>
          <Text style={styles.alertaTitulo}>{sesionExpirada ? "Autenticación Requerida" : "Fallo de Comunicación"}</Text>
          <Text style={styles.alertaMensaje}>{errorVista}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={inicializarComponente}>
            <Text style={styles.textoBotonReintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contenedorPrincipal}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.encabezado}>
          <Text style={styles.tituloPrincipal}>Repositorio de Comprobantes Digitales</Text>
        </View>

        <View style={styles.contenedorFiltros}>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={mesFiltro} style={styles.picker} dropdownIconColor="#D4AF37" onValueChange={setMesFiltro}>
                    <Picker.Item label="Todos los meses" value="" />
                    {Array.from({ length: 12 }, (_, i) => (
                    <Picker.Item key={i + 1} label={new Date(0, i).toLocaleString('es-ES', { month: 'long' })} value={(i + 1).toString()} />
                    ))}
                </Picker>
            </View>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={anioFiltro} style={styles.picker} dropdownIconColor="#D4AF37" onValueChange={setAnioFiltro}>
                    <Picker.Item label="2024" value="2024" />
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                </Picker>
            </View>
        </View>

        <TouchableOpacity style={styles.botonPrimarioFull} onPress={() => abrirModalCarga("ingreso")}>
          <Text style={styles.textoBotonPrimario}>+ Cargar Nuevo Comprobante</Text>
        </TouchableOpacity>

        {/* Pestañas (Tabs) Nativas */}
        <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tabButton, panelActivo === "ingreso" && styles.tabButtonActiveIngreso]} onPress={() => setPanelActivo("ingreso")}>
                <Text style={[styles.tabText, panelActivo === "ingreso" && styles.tabTextActive]}>Ingresos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, panelActivo === "gasto" && styles.tabButtonActiveGasto]} onPress={() => setPanelActivo("gasto")}>
                <Text style={[styles.tabText, panelActivo === "gasto" && styles.tabTextActive]}>Gastos</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.cuerpoDocumental}>
            {panelActivo === "ingreso" ? (
                ingresosFiltrados.length === 0 ? (
                    <View style={styles.estadoVacio}><Text style={styles.textoVacio}>No posee archivos de ingresos cargados en este período.</Text></View>
                ) : (
                    ingresosFiltrados.map(doc => renderTarjetaDocumento(doc, "ingreso"))
                )
            ) : (
                gastosFiltrados.length === 0 ? (
                    <View style={styles.estadoVacio}><Text style={styles.textoVacio}>No posee archivos de gastos cargados en este período.</Text></View>
                ) : (
                    gastosFiltrados.map(doc => renderTarjetaDocumento(doc, "gasto"))
                )
            )}
        </View>
        <View style={{height: 40}} />
      </ScrollView>

      {/* MODAL DE CARGA */}
      <Modal visible={modalAbierto} animationType="slide" transparent={true} onRequestClose={() => setModalAbierto(false)}>
        <View style={styles.capaModal}>
          <View style={styles.contenidoModal}>
            <Text style={styles.tituloModal}>Cargar Comprobante</Text>

            <View style={styles.formularioGrupo}>
              <Text style={styles.labelForm}>Tipo de Comprobante</Text>
              <View style={styles.pickerInputWrapper}>
                <Picker selectedValue={tipoSubida} style={styles.pickerNativo} dropdownIconColor="#D4AF37" onValueChange={(val) => { setTipoSubida(val); setIdTransaccion(""); }}>
                  <Picker.Item label="Asociar a un Flujo de Ingreso" value="ingreso" />
                  <Picker.Item label="Asociar a un Flujo de Gasto" value="gasto" />
                </Picker>
              </View>
            </View>

            <View style={styles.formularioGrupo}>
              <Text style={styles.labelForm}>Seleccionar Transacción</Text>
              <View style={styles.pickerInputWrapper}>
                <Picker selectedValue={idTransaccion} style={styles.pickerNativo} dropdownIconColor="#D4AF37" onValueChange={setIdTransaccion}>
                  <Picker.Item label="-- Seleccione --" value="" />
                  {(tipoSubida === "ingreso" ? historialIngresos : historialGastos).map((item) => {
                    const id = tipoSubida === "ingreso" ? item.IdHistorialIngreso : item.IdHistorialGasto;
                    return <Picker.Item key={id} label={`${item.Descripcion} - $${item.Monto}`} value={id} />;
                  })}
                </Picker>
              </View>
            </View>

            <View style={styles.formularioGrupo}>
              <Text style={styles.labelForm}>Archivo PDF/Imagen</Text>
              <TouchableOpacity style={styles.botonSeleccionarFile} onPress={seleccionarArchivo}>
                <Text style={{color: archivoSeleccionado ? "#fff" : "#888"}}>
                    {archivoSeleccionado ? archivoSeleccionado.name : "Seleccionar Archivo..."}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.accionesModal}>
              <TouchableOpacity style={styles.botonSecundarioModal} onPress={() => setModalAbierto(false)} disabled={subiendo}>
                <Text style={styles.textoBotonSecundario}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonPrimarioModal} onPress={ejecutarSubidaArchivo} disabled={subiendo}>
                {subiendo ? <ActivityIndicator color="#121212" size="small" /> : <Text style={styles.textoBotonPrimarioModal}>Subir</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1, backgroundColor: "#121212", padding: 20 },
  cargandoContenedor: { flex: 1, backgroundColor: "#121212", justifyContent: "center", alignItems: "center" },
  textoCargando: { color: "#fff", marginTop: 15, fontSize: 16 },
  
  alertaError: { backgroundColor: "rgba(212, 175, 55, 0.1)", padding: 30, borderRadius: 8, borderColor: "rgba(212, 175, 55, 0.3)", borderWidth: 1, maxWidth: '85%', alignItems: 'center' },
  alertaTitulo: { color: "#D4AF37", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  alertaMensaje: { color: "#fff", textAlign: "center", marginBottom: 20 },
  botonReintentar: { backgroundColor: "#D4AF37", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  textoBotonReintentar: { color: "#121212", fontWeight: "bold" },

  contenedorBloqueado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  tarjetaBloqueada: { backgroundColor: '#1e1e1f', borderRadius: 20, padding: 30, alignItems: 'center', borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1, width: '100%' },
  iconoBloqueo: { fontSize: 50, marginBottom: 20 },
  tituloBloqueo: { color: '#FF4B4B', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  textoBloqueo: { color: '#888', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  botonMejorarPlan: { backgroundColor: '#D4AF37', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 15 },
  textoBotonMejorar: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
  botonVolver: { paddingVertical: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#fff', borderRadius: 8 },
  textoBotonVolver: { color: '#fff' },

  encabezado: { marginBottom: 20 },
  tituloPrincipal: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  contenedorFiltros: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  pickerWrapper: { flex: 1, backgroundColor: "#1a1a1a", borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginHorizontal: 5 },
  picker: { color: "#fff" },

  botonPrimarioFull: { backgroundColor: "rgba(212, 175, 55, 0.15)", borderColor: "#D4AF37", borderWidth: 1, padding: 15, borderRadius: 8, alignItems: "center", marginBottom: 25 },
  textoBotonPrimario: { color: "#D4AF37", fontWeight: "bold", fontSize: 16 },

  tabsContainer: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#1a1a1a' },
  tabButtonActiveIngreso: { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderBottomWidth: 3, borderBottomColor: '#D4AF37' },
  tabButtonActiveGasto: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderBottomWidth: 3, borderBottomColor: '#fff' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: '#fff' },

  cuerpoDocumental: { flex: 1 },
  estadoVacio: { padding: 40, alignItems: 'center' },
  textoVacio: { color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' },

  tarjetaArchivoItem: { backgroundColor: "rgba(26, 26, 26, 0.6)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: 16, marginBottom: 15 },
  contenedorVistaPrevia: { height: 120, backgroundColor: "#121212", borderRadius: 6, justifyContent: "center", alignItems: "center", overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.03)" },
  imagenPreviewRender: { width: "100%", height: "100%", resizeMode: "cover" },
  iconoDocumentoGenerico: { backgroundColor: "rgba(212, 175, 55, 0.1)", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.3)", borderStyle: "dashed" },
  iconoTexto: { color: "#D4AF37", fontWeight: "bold", fontSize: 20 },
  
  detallesArchivoItem: { marginBottom: 15 },
  tituloDoc: { color: "#fff", fontSize: 16, fontWeight: "500", marginBottom: 6 },
  textoDoc: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 2 },

  accionesArchivoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  enlaceDescarga: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", marginRight: 10 },
  textoEnlaceDescarga: { color: "#fff", fontSize: 13, fontWeight: "500" },
  botonEliminar: { backgroundColor: "rgba(229, 62, 62, 0.1)", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, borderWidth: 1, borderColor: "rgba(229, 62, 62, 0.3)" },
  textoBotonEliminar: { color: "#E53E3E", fontSize: 13, fontWeight: "bold" },

  capaModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  contenidoModal: { backgroundColor: "#121212", padding: 25, borderRadius: 12, width: "100%", borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.25)" },
  tituloModal: { color: "#D4AF37", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  
  formularioGrupo: { marginBottom: 20 },
  labelForm: { color: "rgba(255,255,255,0.6)", fontSize: 11, textTransform: "uppercase", fontWeight: "bold", marginBottom: 8, letterSpacing: 1 },
  pickerInputWrapper: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  pickerNativo: { color: "#fff" },
  botonSeleccionarFile: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderStyle: 'dashed', borderRadius: 6, padding: 15 },
  
  accionesModal: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingTop: 20 },
  botonSecundarioModal: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginRight: 10 },
  textoBotonSecundario: { color: "#fff", fontWeight: "500" },
  botonPrimarioModal: { backgroundColor: "#D4AF37", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 6, justifyContent: 'center' },
  textoBotonPrimarioModal: { color: "#121212", fontWeight: "bold" },
});