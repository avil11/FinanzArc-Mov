import React, { useState, useEffect, useMemo } from "react";
import { 
  View, Text, TouchableOpacity, Alert, ActivityIndicator, 
  ScrollView, Modal, Image, Linking, StyleSheet, Dimensions 
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../styles/styles"; // <-- IMPORTACIÓN GLOBAL MANTENIDA

const API_BASE_URL = "http://192.168.100.3:45455/api";
const SERVER_HOST = "http://192.168.100.3:45455/api";
const { width } = Dimensions.get("window");

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
      if (!doc.FechaCarga) return false;

      // 1. Reemplazamos el espacio por la 'T' para evitar 'Invalid Date' en móviles
      const fechaSegura = doc.FechaCarga.replace(" ", "T");
      const fecha = new Date(fechaSegura);
      
      // 2. Usamos métodos locales
      const anioDoc = fecha.getFullYear().toString();
      const mesDoc = (fecha.getMonth() + 1).toString();

      const coincideMes = mesFiltro === "" || mesDoc === mesFiltro;
      const coincideAnio = anioFiltro === "" || anioDoc === anioFiltro;

      return coincideMes && coincideAnio;
    });
  };

  const ingresosFiltrados = useMemo(() => filtrarDocumentos(documentosIngreso), [documentosIngreso, mesFiltro, anioFiltro]);
  const gastosFiltrados = useMemo(() => filtrarDocumentos(documentosGasto), [documentosGasto, mesFiltro, anioFiltro]);

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      // expo-document-picker returns { type: 'success'|'cancel', name, size, uri, mimeType }
      if (result.type === 'success') {
        setArchivoSeleccionado(result);
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
        headers: { "Authorization": `Bearer ${token}` },
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
      <View key={isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            {esImagen(doc.ExtensionArchivo) ? (
              <Image source={{ uri: `${SERVER_HOST}${doc.RutaArchivo}` }} style={styles.thumbnailImage} />
            ) : (
              <View style={styles.thumbnailGeneric}>
                <Text style={styles.thumbnailText}>
                  {doc.ExtensionArchivo ? doc.ExtensionArchivo.replace(".", "").substring(0, 3).toUpperCase() : "DOC"}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>Ref: {refHistorial}</Text>
            <Text style={styles.cardDate}>{new Date(doc.FechaCarga).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={globalStyles.archivoDetalles}>
          <Text style={globalStyles.archivoTitulo} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
          <Text style={globalStyles.archivoRef}>Ref: {refHistorial}</Text>
          <Text style={globalStyles.movimientoFecha}>{new Date(doc.FechaCarga).toLocaleDateString()}</Text>
        </View>
        <View style={globalStyles.archivoAcciones}>
          <TouchableOpacity style={globalStyles.botonDescargaArchivos} onPress={() => Linking.openURL(`${SERVER_HOST}${doc.RutaArchivo}`)}>
            <Text style={globalStyles.textoDescarga}>Visualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.botonModalEliminarArchivos} onPress={() => eliminarDocumento(isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto, tipo)}>
            <Text style={globalStyles.textoEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#c8b277" />
        <Text style={styles.loadingText}>Cargando repositorio documental...</Text>
      </View>
    );
  }

  if (!rolHabilitado) {
    return (
      <View style={globalStyles.bloqueoContenedor}>
        <View style={globalStyles.bloqueoTarjeta}>
          <View style={{ marginBottom: 20, opacity: 0.8 }}>
            <Text style={{ fontSize: 50 }}>🔒</Text>
          </View>
          <Text style={styles.premiumTitle}>Apartado restringido</Text>
          <Text style={styles.premiumText}>
            Para acceder a esta función, necesitas contar con nuestro plan Premium. 
            ¡Desbloquea todo el potencial de FinanzARC ahora!
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.btnPremium} onPress={() => navigation.navigate("planes")}>
            <Text style={styles.btnPremiumText}>Mejorar mi Plan 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={styles.btnBackText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (errorVista) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{sesionExpirada ? "Autenticación" : "Error"}</Text>
          <Text style={styles.errorText}>{errorVista}</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.btnPremium} onPress={inicializarComponente}>
            <Text style={styles.btnPremiumText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Comprobantes</Text>
          <Text style={styles.headerSubtitle}>Gestor de tickets y facturas digitalizados.</Text>
        </View>

        <View style={globalStyles.filtrosRow}>
          <View style={globalStyles.pickerWrapperFiltro}>
            <Picker selectedValue={mesFiltro} style={globalStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setMesFiltro} itemStyle={{ color: '#c8b277', fontWeight: '500' }}>
              <Picker.Item label="Todos los meses" value="" />
              {Array.from({ length: 12 }, (_, i) => {
                const fechaMes = new Date(2024, i, 1);
                const nombreMes = fechaMes.toLocaleString('es-ES', { month: 'long' });
                
                return (
                  <Picker.Item 
                    key={i + 1} 
                    label={nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} 
                    value={(i + 1).toString()} 
                  />
                );
              })}
            </Picker>
          </View>
          <View style={globalStyles.pickerWrapperFiltro}>
            <Picker
              selectedValue={anioFiltro}
              style={globalStyles.pickerNativo}
              dropdownIconColor="#c8b277"
              onValueChange={setAnioFiltro}
              itemStyle={{ color: '#c8b277' }}
            >
              <Picker.Item label="2024" value="2024" />
              <Picker.Item label="2025" value="2025" />
              <Picker.Item label="2026" value="2026" />
              <Picker.Item label="2027" value="2027" />
              <Picker.Item label="2028" value="2028" />
              <Picker.Item label="2029" value="2029" />
              <Picker.Item label="2030" value="2030" />
              <Picker.Item label="2031" value="2031" />
              <Picker.Item label="2032" value="2032" />
              <Picker.Item label="2033" value="2033" />
              <Picker.Item label="2034" value="2034" />
              <Picker.Item label="2035" value="2035" />
            </Picker>
          </View>
        </View>
        <TouchableOpacity style={globalStyles.botonArchivar} onPress={() => abrirModalCarga("ingreso")}>
          <Text style={globalStyles.botonArchivarTexto}>+ Cargar Nuevo Comprobante</Text>
        </TouchableOpacity>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.tabButton, panelActivo === "ingreso" && styles.tabButtonActive]} 
            onPress={() => setPanelActivo("ingreso")}
          >
            <Text style={[styles.tabText, panelActivo === "ingreso" && styles.tabTextActive]}>Ingresos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.tabButton, panelActivo === "gasto" && styles.tabButtonActive]} 
            onPress={() => setPanelActivo("gasto")}
          >
            <Text style={[styles.tabText, panelActivo === "gasto" && styles.tabTextActive]}>Gastos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {panelActivo === "ingreso" ? (
            ingresosFiltrados.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyStateText}>No hay ingresos cargados en este periodo.</Text></View>
            ) : (ingresosFiltrados.map(doc => renderTarjetaDocumento(doc, "ingreso")))
          ) : (
            gastosFiltrados.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyStateText}>No hay gastos cargados en este periodo.</Text></View>
            ) : (gastosFiltrados.map(doc => renderTarjetaDocumento(doc, "gasto")))
          )}
        </View>

      </ScrollView>

      {/* MODAL DE CARGA */}
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
                <Text style={{ color: archivoSeleccionado ? "#fff" : "#8e8e93", fontWeight: archivoSeleccionado ? "bold" : "normal" }}>
                  {archivoSeleccionado ? archivoSeleccionado.name : "Toque para seleccionar..."}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={globalStyles.formularioAccionesVincularArchivo}>
              <TouchableOpacity
                style={globalStyles.botonModalCancelarArchivo}
                onPress={() => setModalAbierto(false)}
                disabled={subiendo}
              >
                <Text style={globalStyles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={globalStyles.botonModalSubirArchivo}
                onPress={ejecutarSubidaArchivo}
                disabled={subiendo}
              >
                {subiendo ? (
                  <ActivityIndicator color="#121212" size="small" />
                ) : (
                  <Text style={globalStyles.textoBotonSubir}>Subir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  loadingText: {
    color: "#a0a0a0",
    marginTop: 16,
    fontSize: 16,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#c8b277",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#a0a0a0",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    color: "#fff",
    width: "100%",
  },
  btnPrimary: {
    backgroundColor: "#c8b277",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#c8b277",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPrimaryText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#333",
  },
  tabText: {
    color: "#8e8e93",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#c8b277",
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#333",
  },
  emptyStateText: {
    color: "#8e8e93",
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  thumbnailContainer: {
    marginRight: 16,
  },
  thumbnailImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
  },
  thumbnailGeneric: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  thumbnailText: {
    color: "#c8b277",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#a0a0a0",
    fontSize: 13,
    marginBottom: 4,
  },
  cardDate: {
    color: "#c8b277",
    fontSize: 12,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 12,
  },
  btnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(200, 178, 119, 0.1)",
  },
  btnSecondaryText: {
    color: "#c8b277",
    fontSize: 13,
    fontWeight: "600",
  },
  btnDanger: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 69, 58, 0.1)",
  },
  btnDangerText: {
    color: "#ff453a",
    fontSize: 13,
    fontWeight: "600",
  },
  /* ESTILOS DEL MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#1e1e1e",
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c8b277",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: "#a0a0a0",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  fileDropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#c8b277",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "rgba(200, 178, 119, 0.05)",
  },
  fileDropText: {
    color: "#8e8e93",
    fontSize: 14,
    textAlign: "center",
  },
  fileDropTextActive: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  btnModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
  },
  btnModalCancelText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  btnModalSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#c8b277",
    alignItems: "center",
  },
  btnModalSubmitText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 15,
  },
  /* VISTAS DE ERROR Y PREMIUM */
  premiumCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c8b277",
    width: "100%",
  },
  iconContainer: {
    backgroundColor: "rgba(200, 178, 119, 0.1)",
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
  },
  premiumTitle: {
    color: "#c8b277",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  premiumText: {
    color: "#a0a0a0",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  btnPremium: {
    backgroundColor: "#c8b277",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  btnPremiumText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnBack: {
    paddingVertical: 12,
  },
  btnBackText: {
    color: "#8e8e93",
    fontSize: 15,
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff453a",
  },
  errorTitle: {
    color: "#ff453a",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  errorText: {
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 24,
  }
});