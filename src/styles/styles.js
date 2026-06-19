import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // ==========================================
  // 1. ESTILOS DE LOGIN SCREEN
  // ==========================================
  loginContainer: { flex: 1, backgroundColor: "#121212", justifyContent: "center", padding: 20 },
  loginCard: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  loginLogo: { fontSize: 28, fontWeight: "bold", color: "#c8b277", textAlign: "center" },
  loginSub: { fontSize: 13, color: "#8e8e93", textAlign: "center", marginBottom: 24, marginTop: 4 },
  loginGroup: { marginBottom: 16 },
  loginLabel: { color: "#fff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  loginInput: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#fff", fontSize: 15 },
  loginBtn: { backgroundColor: "#c8b277", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 10 },
  loginBtnText: { color: "#121212", fontWeight: "bold", fontSize: 15 },
  loginErrorText: { color: "#ff4b4b", fontSize: 13, textAlign: "center", marginBottom: 12, fontWeight: "500" },
  loginInfoText: { color: "#a4a4aa", fontSize: 13, textAlign: "center", lineHeight: 18 },
  loginLinkText: { color: "#c8b277", fontSize: 13, fontWeight: "bold", textAlign: "center", textDecorationLine: "underline", marginTop: 6, marginBottom: 20 },
  loginPasswordContainer: { flexDirection: "row", backgroundColor: "#2c2c2e", borderRadius: 8, alignItems: "center" },
  loginPasswordInput: { flex: 1, padding: 12, color: "#fff", fontSize: 15 },
  loginEyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  loginEyeText: { color: "#c8b277", fontSize: 12, fontWeight: "bold" },

  // ==========================================
  // 2. ESTILOS DE GENERAL SCREEN (Resumen Financiero)
  // ==========================================
  contenedorPrincipal: { flex: 1, padding: 20 },
  seccionEncabezado: { marginBottom: 24 },
  tituloPrincipal: { fontSize: 24, fontWeight: "bold", color: "#c8b277", marginBottom: 8 },
  descripcionEncabezado: { color: "#8e8e93", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  cotizacionesTexto: { color: "#c8b277", fontSize: 14, fontWeight: "bold", marginTop: 8, fontStyle: "italic" },
  
  // Botones
  contenedorBotonesAccion: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  botonComparativa: { backgroundColor: "#c8b277", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, flex: 1, minWidth: "45%", alignItems: "center" },
  botonComparativaTexto: { color: "#121212", fontWeight: "bold", fontSize: 14 },
  botonArchivar: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#c8b277", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 4 },
  botonArchivarTexto: { color: "#c8b277", fontWeight: "bold", fontSize: 14 },

  // Tarjetas y Módulos
  tarjetaGeneral: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  tituloTarjeta: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 16 },
  
  // Gráficos
  graficoConLeyenda: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contenedorGraficoPie: { width: 130, height: 130, justifyContent: "center", alignItems: "center" },
  leyendaGrafico: { flex: 1, marginLeft: 20 },
  itemLeyenda: { flexDirection: "row", alignItems: "center", marginBottom: 8, justifyContent: "space-between" },
  circuloColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  leyendaTextoContainer: { flex: 1, paddingRight: 8 },
  leyendaTexto: { color: "#ffffff", fontSize: 12 },
  valorMontoGasto: { color: "#ff4b4b", fontSize: 12, fontWeight: "bold" },
  valorMontoIngreso: { color: "#34c759", fontSize: 12, fontWeight: "bold" },

  // Metas de Ahorro
  infoLimitesPlan: { backgroundColor: "#1e1e1f", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(200,178,119,0.1)" },
  tarjetaAhorroItem: { backgroundColor: "#1e1e1f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  filaProgreso: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  pistaBarra: { height: 6, backgroundColor: "#2c2c2e", borderRadius: 3, marginBottom: 8, overflow: "hidden" },
  rellenoBarra: { height: "100%", backgroundColor: "#c8b277", borderRadius: 3 },
  textoMontoProgreso: { color: "#8e8e93", fontSize: 12, marginBottom: 12 },
  botonEditarAhorro: { alignSelf: "flex-end", paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#2c2c2e", borderRadius: 6 },
  botonEditarAhorroTexto: { color: "#c8b277", fontSize: 12, fontWeight: "bold" },
  tarjetaLogro: { backgroundColor: "#1e1e1f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#c8b277" },

  // Modales
  capaModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  contenidoModal: { backgroundColor: "#1e1e1f", width: "100%", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.3)" },
  formularioGrupo: { marginBottom: 16 },
  labelForm: { color: "#ffffff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputForm: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#ffffff", fontSize: 15 },
  inputSelectContainer: { backgroundColor: "#2c2c2e", borderRadius: 8, overflow: "hidden" },
  pickerNativo: { color: "#ffffff", backgroundColor: "#2c2c2e" },
  formularioAcciones: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  botonModalSecundario: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#2c2c2e" },
  botonModalPrimario: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#c8b277" },
  botonModalEliminar: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#ff4b4b" },

  // Toasts y Alertas
  toastBanner: { position: "absolute", top: 50, left: 20, right: 20, padding: 16, borderRadius: 8, zIndex: 1000, alignItems: "center", elevation: 5 },
  toastTexto: { color: "#ffffff", fontWeight: "bold", fontSize: 14, textAlign: "center" },
  avisoVacio: { alignItems: "center", paddingVertical: 20 },
  iconoPlaceholder: { fontSize: 32, marginBottom: 8 },
  mensajeVacio: { color: "#ffffff", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  sugerenciaVacio: { color: "#8e8e93", fontSize: 12 },

  // ==========================================
  // 3. ESTILOS DE COMPARATIVA Y ARCHIVOS
  // ==========================================
  // Buscador y Listas (Comparativa)
  buscadorContenedor: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)", marginBottom: 20 },
  buscadorInput: { flex: 1, color: "#fff", paddingVertical: 12, fontSize: 15 },
  buscadorIcono: { fontSize: 16, marginRight: 8, color: "#8e8e93" },
  listaContenedor: { paddingBottom: 40 },
  tarjetaMovimiento: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  movimientoInfo: { flex: 1, marginRight: 15 },
  movimientoDesc: { color: "#ffffff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  movimientoFecha: { color: "#8e8e93", fontSize: 12 },
  movimientoMontoCaja: { alignItems: "flex-end" },
  movimientoMonto: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  movimientoTipo: { color: "#c8b277", fontSize: 10, letterSpacing: 1, fontWeight: "bold" },
  
  // Tabs, Filtros y Tarjetas (Archivos)
  filtrosRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  pickerWrapperFiltro: { flex: 1, backgroundColor: "#1e1e1f", borderRadius: 8, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)", marginHorizontal: 4, overflow: "hidden" },
  tabsContenedor: { flexDirection: "row", marginBottom: 20, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  tabBoton: { flex: 1, paddingVertical: 14, alignItems: "center", backgroundColor: "#1a1a1a" },
  tabBotonActivo: { backgroundColor: "rgba(200,178,119,0.15)", borderBottomWidth: 3, borderBottomColor: "#c8b277" },
  tabTexto: { color: "#8e8e93", fontWeight: "600", fontSize: 15 },
  tabTextoActivo: { color: "#ffffff", fontWeight: "bold" },
  
  tarjetaArchivo: { backgroundColor: "#1e1e1f", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, marginBottom: 16 },
  archivoPreviewCaja: { height: 120, backgroundColor: "#121212", borderRadius: 8, justifyContent: "center", alignItems: "center", overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  archivoImagen: { width: "100%", height: "100%", resizeMode: "cover" },
  archivoIconoGenerico: { backgroundColor: "rgba(200,178,119,0.1)", paddingVertical: 15, paddingHorizontal: 25, borderRadius: 8, borderWidth: 1, borderColor: "rgba(200,178,119,0.3)", borderStyle: "dashed" },
  archivoIconoTexto: { color: "#c8b277", fontWeight: "bold", fontSize: 22 },
  archivoDetalles: { marginBottom: 15 },
  archivoTitulo: { color: "#ffffff", fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  archivoRef: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 2 },
  archivoAcciones: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  botonDescarga: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", marginRight: 10 },
  textoDescarga: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  
  // Alertas y Bloqueos
  alertaCaja: { backgroundColor: "rgba(200,178,119,0.1)", padding: 24, borderRadius: 12, borderColor: "rgba(200,178,119,0.3)", borderWidth: 1, maxWidth: "90%", alignItems: "center" },
  bloqueoContenedor: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212", padding: 20 },
  bloqueoTarjeta: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 30, alignItems: "center", borderColor: "rgba(200,178,119,0.2)", borderWidth: 1, width: "100%" },
  bloqueoIcono: { fontSize: 48, marginBottom: 16 },
  bloqueoTitulo: { color: "#ff4b4b", fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  botonSecundarioBorde: { paddingVertical: 12, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#8e8e93", borderRadius: 8, marginTop: 10 },
  textoSecundarioBorde: { color: "#ffffff", fontWeight: "600" },
  centroTotal: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },

});