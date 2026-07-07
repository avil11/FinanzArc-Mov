import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, Modal, Image, Linking, StyleSheet, Dimensions
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { archivosStyles } from "./ArchivosStyles";


const API_BASE_URL = "http://192.168.1.126:45457/api";
const SERVER_HOST = "http://192.168.1.126:4541"; 


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

  useFocusEffect(
    useCallback(() => {
      inicializarComponente();
    }, [])
  );

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

      // 1. Convertimos a número para evitar que un "3" (string) falle la validación
      const rolNumerico = Number(datosUsuario.IdRol);

      // 2. SOLO roles 3 y 4 pasan. Si es 1, 2, o cualquier otro, será false.
      const esPremium = (rolNumerico === 3 || rolNumerico === 4);

      setRolHabilitado(esPremium);

      // 3. Si NO es premium, cortamos la ejecución aquí mismo. 
      // Esto evita que se hagan peticiones a la API para traer documentos.
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
      // Dejamos "*/*" porque sabemos que esto SÍ te abre el selector correctamente
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true
      });

      let archivoTemp = null;

      // 1. Extraemos los datos del archivo de forma segura (soporta cualquier versión de Expo)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        archivoTemp = result.assets[0];
      } else if (result.type === 'success') {
        archivoTemp = result;
      } else {
        // El usuario canceló o cerró el modal de archivos
        return;
      }

      // 2. VALIDACIÓN ESTRICTA DE FORMATO
      const nombreArchivo = archivoTemp.name.toLowerCase();
      const esValido = nombreArchivo.endsWith('.jpg') ||
        nombreArchivo.endsWith('.jpeg') ||
        nombreArchivo.endsWith('.png') ||
        nombreArchivo.endsWith('.pdf');

      if (!esValido) {
        Alert.alert("Formato no válido", "Solo puedes subir archivos .jpg, .jpeg, .png o .pdf");
        return; // Cortamos la ejecución para que no se guarde
      }

      // 3. Si pasa la validación, lo guardamos en el estado para poder subirlo
      setArchivoSeleccionado(archivoTemp);

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

    // 1. Instanciamos el FormData igual que en la web
    const formData = new FormData();

    // 2. Adjuntamos el archivo. Este objeto { uri, name, type } es el 
    // equivalente directo en móvil al "archivoSeleccionado" de la web.
    formData.append("archivo", {
      uri: archivoSeleccionado.uri,
      name: archivoSeleccionado.name,
      type: archivoSeleccionado.mimeType || 'application/octet-stream'
    });

    // 3. Respetamos tu lógica de la web para la URL y el ID
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
          "Authorization": `Bearer ${token}`
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

 const abrirArchivoVisualizador = async (rutaArchivo) => {
    // 1. Si rutaArchivo ya es una URL absoluta, la usamos. Si no, la armamos.
    let urlFinal = rutaArchivo.startsWith('http') 
      ? rutaArchivo 
      : `${SERVER_HOST}${rutaArchivo}`;

    // 2. CORRECCIÓN: Si la URL contiene "localhost", la reemplazamos por tu IP actual
    // Esto soluciona que la base de datos tenga guardado el localhost viejo
    urlFinal = urlFinal.replace('localhost:60496', '192.168.100.3:45455');

    // 3. CORRECCIÓN: Si por error la URL tiene "/api/Uploads", cambiamos a "/Uploads"
    // (A veces el IIS mapea el /api solo para la lógica, no para los archivos estáticos)
    urlFinal = urlFinal.replace('/api/Uploads', '/Uploads');

    console.log("Intentando abrir URL:", urlFinal); // MIRA ESTO EN TU CONSOLA DE DESARROLLO

    try {
      const puedeAbrir = await Linking.canOpenURL(urlFinal);
      if (puedeAbrir) {
        await Linking.openURL(urlFinal);
      } else {
        Alert.alert("Aviso", "No se puede abrir este enlace. Verifica la ruta.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir el comprobante.");
    }
  };
  const renderTarjetaDocumento = (doc, tipo) => {
    const isIngreso = tipo === "ingreso";
    const refHistorial = isIngreso
      ? (historialIngresos.find(h => h.IdHistorialIngreso === doc.IdIngreso)?.Descripcion || "No encontrada")
      : (historialGastos.find(h => h.IdHistorialGasto === doc.IdGasto)?.Descripcion || "No encontrada");

    return (
      <View key={isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto} style={archivosStyles.card}>
        <View style={archivosStyles.cardContent}>
          <View style={archivosStyles.thumbnailContainer}>
            {esImagen(doc.ExtensionArchivo) ? (
              <Image source={{ uri: `${SERVER_HOST}${doc.RutaArchivo}` }} style={archivosStyles.thumbnailImage} />
            ) : (
              <View style={archivosStyles.thumbnailGeneric}>
                <Text style={archivosStyles.thumbnailText}>
                  {doc.ExtensionArchivo ? doc.ExtensionArchivo.replace(".", "").substring(0, 3).toUpperCase() : "DOC"}
                </Text>
              </View>
            )}
          </View>

          <View style={archivosStyles.cardDetails}>
            <Text style={archivosStyles.cardTitle} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
            <Text style={archivosStyles.cardSubtitle} numberOfLines={1}>Ref: {refHistorial}</Text>
            <Text style={archivosStyles.cardDate}>{new Date(doc.FechaCarga).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={archivosStyles.archivoDetalles}>
          <Text style={archivosStyles.archivoTitulo} numberOfLines={1}>{doc.NombreArchivoOriginal}</Text>
          <Text style={archivosStyles.archivoRef}>Ref: {refHistorial}</Text>
          <Text style={archivosStyles.movimientoFecha}>{new Date(doc.FechaCarga).toLocaleDateString()}</Text>
        </View>
        <View style={archivosStyles.archivoAcciones}>
          <TouchableOpacity 
      style={archivosStyles.botonDescargaArchivos} 
      onPress={() => abrirArchivoVisualizador(doc.RutaArchivo)}
    >
      <Text style={archivosStyles.textoDescarga}>Visualizar</Text>
    </TouchableOpacity>
          <TouchableOpacity style={archivosStyles.botonModalEliminarArchivos} onPress={() => eliminarDocumento(isIngreso ? doc.IdDocumentoIngreso : doc.IdDocumentoGasto, tipo)}>
            <Text style={archivosStyles.textoEliminar}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={archivosStyles.centerContainer}>
        <ActivityIndicator size="large" color="#c8b277" />
        <Text style={archivosStyles.loadingText}>Cargando repositorio documental...</Text>
      </View>
    );
  }
  if (!rolHabilitado) {
    return (
      <View style={archivosStyles.bloqueoContenedor}>
        <View style={archivosStyles.bloqueoTarjeta}>
          <View style={{ marginBottom: 20, opacity: 0.8 }}>
            <Text style={{ fontSize: 50 }}>🔒</Text>
          </View>
          <Text style={archivosStyles.premiumTitle}>Apartado restringido</Text>
          <Text style={archivosStyles.premiumText}>
            Para acceder a esta función, necesitas contar con nuestro plan Premium.
            ¡Desbloquea todo el potencial de FinanzARC ahora!
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={archivosStyles.btnPremium} onPress={() => navigation.navigate("planes")}>
            <Text style={archivosStyles.btnPremiumText}>Mejorar mi Plan 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={archivosStyles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={archivosStyles.btnBackText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (errorVista) {
    return (
      <View style={archivosStyles.centerContainer}>
        <View style={archivosStyles.errorCard}>
          <Text style={archivosStyles.errorTitle}>{sesionExpirada ? "Autenticación" : "Error"}</Text>
          <Text style={archivosStyles.errorText}>{errorVista}</Text>
          <TouchableOpacity activeOpacity={0.8} style={archivosStyles.btnPremium} onPress={inicializarComponente}>
            <Text style={archivosStyles.btnPremiumText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={archivosStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={archivosStyles.scrollContent}>

        <View style={archivosStyles.headerSection}>
          <Text style={archivosStyles.headerTitle}>Comprobantes</Text>
          <Text style={archivosStyles.headerSubtitle}>Gestor de tickets y facturas digitalizados.</Text>
        </View>

        <View style={archivosStyles.filtrosRow}>
          <View style={archivosStyles.pickerWrapperFiltro}>
            <Picker selectedValue={mesFiltro} style={archivosStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setMesFiltro} itemStyle={{ color: '#c8b277', fontWeight: '500' }}>
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
          <View style={archivosStyles.pickerWrapperFiltro}>
            <Picker
              selectedValue={anioFiltro}
              style={archivosStyles.pickerNativo}
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
        <TouchableOpacity style={archivosStyles.botonArchivar} onPress={() => abrirModalCarga("ingreso")}>
          <Text style={archivosStyles.botonArchivarTexto}>+ Cargar Nuevo Comprobante</Text>
        </TouchableOpacity>

        <View style={archivosStyles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[archivosStyles.tabButton, panelActivo === "ingreso" && archivosStyles.tabButtonActive]}
            onPress={() => setPanelActivo("ingreso")}
          >
            <Text style={[archivosStyles.tabText, panelActivo === "ingreso" && archivosStyles.tabTextActive]}>Ingresos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[archivosStyles.tabButton, panelActivo === "gasto" && archivosStyles.tabButtonActive]}
            onPress={() => setPanelActivo("gasto")}
          >
            <Text style={[archivosStyles.tabText, panelActivo === "gasto" && archivosStyles.tabTextActive]}>Gastos</Text>
          </TouchableOpacity>
        </View>

        <View style={archivosStyles.listContainer}>
          {panelActivo === "ingreso" ? (
            ingresosFiltrados.length === 0 ? (
              <View style={archivosStyles.emptyState}><Text style={archivosStyles.emptyStateText}>No hay ingresos cargados en este periodo.</Text></View>
            ) : (ingresosFiltrados.map(doc => renderTarjetaDocumento(doc, "ingreso")))
          ) : (
            gastosFiltrados.length === 0 ? (
              <View style={archivosStyles.emptyState}><Text style={archivosStyles.emptyStateText}>No hay gastos cargados en este periodo.</Text></View>
            ) : (gastosFiltrados.map(doc => renderTarjetaDocumento(doc, "gasto")))
          )}
        </View>

      </ScrollView>

      {/* MODAL DE CARGA */}
      <Modal visible={modalAbierto} animationType="slide" transparent={true} onRequestClose={() => setModalAbierto(false)}>
        <View style={archivosStyles.capaModal}>
          <View style={archivosStyles.contenidoModal}>

            <Text style={[archivosStyles.tituloTarjeta, { color: "#c8b277" }]}>Vincular Archivo</Text>
            <View style={archivosStyles.formularioGrupo}>
              <Text style={archivosStyles.labelForm}>Clasificación</Text>
              <View style={archivosStyles.inputSelectContainer}>
                <Picker selectedValue={tipoSubida} style={archivosStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={(val) => { setTipoSubida(val); setIdTransaccion(""); }}>
                  <Picker.Item label="Vincular a un Ingreso" value="ingreso" />
                  <Picker.Item label="Vincular a un Gasto" value="gasto" />
                </Picker>
              </View>
            </View>
            <View style={archivosStyles.formularioGrupo}>
              <Text style={archivosStyles.labelForm}>Movimiento Registrado</Text>
              <View style={archivosStyles.inputSelectContainer}>
                <Picker selectedValue={idTransaccion} style={archivosStyles.pickerNativo} dropdownIconColor="#c8b277" onValueChange={setIdTransaccion}>
                  <Picker.Item label="-- Seleccione --" value="" />
                  {(tipoSubida === "ingreso" ? historialIngresos : historialGastos).map((item) => {
                    const id = tipoSubida === "ingreso" ? item.IdHistorialIngreso : item.IdHistorialGasto;
                    return <Picker.Item key={id} label={`${item.Descripcion} - $${item.Monto}`} value={id} />;
                  })}
                </Picker>
              </View>
            </View>
            <View style={archivosStyles.formularioGrupo}>
              <Text style={archivosStyles.labelForm}>Documento (PDF o Imagen)</Text>
              <TouchableOpacity style={[archivosStyles.inputForm, { borderStyle: "dashed", borderColor: "rgba(200,178,119,0.5)", alignItems: "center", paddingVertical: 16 }]} onPress={seleccionarArchivo}>
                <Text style={{ color: archivoSeleccionado ? "#fff" : "#8e8e93", fontWeight: archivoSeleccionado ? "bold" : "normal" }}>
                  {archivoSeleccionado ? archivoSeleccionado.name : "Toque para seleccionar..."}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={archivosStyles.formularioAccionesVincularArchivo}>
              <TouchableOpacity
                style={archivosStyles.botonModalCancelarArchivo}
                onPress={() => setModalAbierto(false)}
                disabled={subiendo}
              >
                <Text style={archivosStyles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={archivosStyles.botonModalSubirArchivo}
                onPress={ejecutarSubidaArchivo}
                disabled={subiendo}
              >
                {subiendo ? (
                  <ActivityIndicator color="#121212" size="small" />
                ) : (
                  <Text style={archivosStyles.textoBotonSubir}>Subir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}