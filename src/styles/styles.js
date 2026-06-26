import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({

  // ==========================================
  // 1. AUTENTICACIÓN Y LOGIN
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
  // 2. LAYOUT GENERAL Y ENCABEZADOS
  // ==========================================
  contenedorPrincipal: { flex: 1, padding: 20 },
  seccionEncabezado: { marginBottom: 24 },
  tituloPrincipal: { fontSize: 24, fontWeight: "bold", color: "#c8b277", marginBottom: 8 },
  descripcionEncabezado: { color: "#8e8e93", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  cotizacionesTexto: { color: "#c8b277", fontSize: 14, fontWeight: "bold", marginTop: 8, fontStyle: "italic" },
  centroTotal: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },

  // ==========================================
  // 3. BOTONES Y ACCIONES
  // ==========================================
  contenedorBotonesAccion: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  botonComparativa: { backgroundColor: "#c8b277", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, flex: 1, maxWidth: "40%", alignItems: "center" },
  botonComparativaTexto: { color: "#121212", fontWeight: "bold", fontSize: 14 },
  botonArchivar: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#c8b277", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 4 },
  botonArchivarTexto: { color: "#c8b277", fontWeight: "bold", fontSize: 14 },
  botonMejorarPlan: { backgroundColor: "#c8b277", paddingVertical: 14, width: "100%", alignItems: "center", borderRadius: 12, marginBottom: 12 },
  botonVolver: { paddingVertical: 14, width: "100%", alignItems: "center", backgroundColor: "transparent" },
  textoVolver: { color: "#8e8e93", fontWeight: "600", fontSize: 14 },
  botonSecundarioBorde: { paddingVertical: 12, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#8e8e93", borderRadius: 8, marginTop: 10 },
  textoSecundarioBorde: { color: "#ffffff", fontWeight: "600" },

  // ==========================================
  // 4. TARJETAS Y LISTAS (Movimientos)
  // ==========================================
  tarjetaGeneral: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  tituloTarjeta: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 16 },
  tarjetaMovimiento: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  iconoMovimiento: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 16 },
  movimientoDesc: { color: "#ffffff", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  movimientoFecha: { color: "#8e8e93", fontSize: 12 },
  movimientoMonto: { fontSize: 16, fontWeight: "800" },
  movimientoTipo: { color: "#8e8e93", fontSize: 11, letterSpacing: 0.5, marginTop: 2 },

  // ==========================================
  // 5. METAS Y GRÁFICOS
  // ==========================================
  infoLimitesPlan: { backgroundColor: "#1e1e1f", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(200,178,119,0.1)" },
  tarjetaAhorroItem: { backgroundColor: "#1e1e1f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  filaProgreso: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  pistaBarra: { height: 6, backgroundColor: "#2c2c2e", borderRadius: 3, marginBottom: 8, overflow: "hidden" },
  rellenoBarra: { height: "100%", backgroundColor: "#c8b277", borderRadius: 3 },
  textoMontoProgreso: { color: "#8e8e93", fontSize: 12, marginBottom: 12 },
  botonEditarAhorro: { alignSelf: "flex-end", paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#2c2c2e", borderRadius: 6 },
  botonEditarAhorroTexto: { color: "#c8b277", fontSize: 12, fontWeight: "bold" },
  tarjetaLogro: { backgroundColor: "#1e1e1f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#c8b277" },

  graficoConLeyenda: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contenedorGraficoPie: { width: 130, height: 130, justifyContent: "center", alignItems: "center" },
  leyendaGrafico: { flex: 1, marginLeft: 20 },
  itemLeyenda: { flexDirection: "row", alignItems: "center", marginBottom: 8, justifyContent: "space-between" },
  circuloColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  leyendaTextoContainer: { flex: 1, paddingRight: 8 },
  leyendaTexto: { color: "#ffffff", fontSize: 12 },
  valorMontoGasto: { color: "#ff4b4b", fontSize: 12, fontWeight: "bold" },
  valorMontoIngreso: { color: "#34c759", fontSize: 12, fontWeight: "bold" },

  // ==========================================
  // 6. MODALES Y FORMULARIOS
  // ==========================================
  capaModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  contenidoModal: { backgroundColor: "#1e1e1f", width: "100%", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.3)" },
  formularioGrupo: { marginBottom: 16 },
  labelForm: { color: "#ffffff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputForm: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#ffffff", fontSize: 15 },
  inputSelectContainer: { backgroundColor: "#2c2c2e", borderRadius: 8, overflow: "hidden" },
  pickerNativo: { color: "#ffffff", backgroundColor: "#2c2c2e" },
  botonModalBase: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  formularioAcciones: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 20, paddingHorizontal: 5 },
  botonModalSecundario: { backgroundColor: "#2c2c2e" },
  botonModalPrimario: { backgroundColor: "#c8b277" },
  botonModalEliminar: { backgroundColor: "#ff4b4b" },
  formularioAccionesVincularArchivo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    gap: 12,
  },
  botonModalCancelarArchivo: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ff4b4b", // Borde dorado
    alignItems: "center",
    justifyContent: "center",
  },
  botonModalSubirArchivo: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#c8b277", // Fondo dorado sólido
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonCancelar: {
    color: "#c8b277", // Texto dorado para combinar con el borde
    fontWeight: "bold",
    fontSize: 15,
  },
  textoBotonSubir: {
    color: "#121212", // Texto negro sobre fondo dorado
    fontWeight: "bold",
    fontSize: 15,
  },

  // ==========================================
  // 7. ALERTAS, BLOQUEOS Y ESTADOS VACÍOS
  // ==========================================
  bloqueoContenedor: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212", padding: 20 },
  bloqueoTarjeta: { backgroundColor: "#1e1e1f", borderRadius: 24, padding: 32, alignItems: "center", borderColor: "rgba(200,178,119,0.3)", borderWidth: 1, width: "100%" },
  bloqueoIcono: { fontSize: 48, marginBottom: 16 },
  bloqueoTitulo: { color: "#ffffff", fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  bloqueoTexto: { color: "#a4a4aa", textAlign: "center", marginBottom: 24, lineHeight: 22, fontSize: 14 },

  avisoVacio: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, backgroundColor: "rgba(200, 178, 119, 0.03)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(200, 178, 119, 0.1)", borderStyle: "dashed" },
  iconoPlaceholder: { fontSize: 40, marginBottom: 12, opacity: 0.8 },
  mensajeVacio: { color: "#ffffff", fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  sugerenciaVacio: { color: "#8e8e93", fontSize: 13, textAlign: 'center' },

  // ==========================================
  // 8. BUSCADOR
  // ==========================================
  buscadorContenedor: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(200, 178, 119, 0.15)" },
  buscadorIcono: { fontSize: 18, marginRight: 10, opacity: 0.7 },
  buscadorInput: { flex: 1, color: "#ffffff", fontSize: 15, padding: 0 },
  // ==========================================
  // 9. ARCHIVOS Y COMPROBANTES (Pantalla Archivos)
  // ==========================================

  // Filtros superiores (Mes y Año)
  pickerWrapperFiltroDedicado: {
    flex: 1,
    backgroundColor: '#ffffff', // Fondo blanco
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8b277',      // Borde dorado
    overflow: 'hidden',
    height: 50,                  // Altura fija para consistencia
    justifyContent: 'center',
  },
  pickerTextoDedicado: {
    color: '#000000',            // Color negro para que sea legible sobre blanco
  },
  filtrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12
  },
  pickerWrapperFiltro: {
    flex: 1,
    backgroundColor: "#1e1e1f",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200,178,119,0.2)",
    overflow: "hidden",
    backgroundColor: '#ffffff', // <-- Agrega esta línea
  },
  tabsContenedor: {
    flexDirection: "row",
    backgroundColor: "#1e1e1f",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(200,178,119,0.2)"
  },
  tabBoton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8
  },
  tabBotonActivo: {
    backgroundColor: "#c8b277"
  },
  tabTexto: {
    color: "#8e8e93",
    fontSize: 14,
    fontWeight: "600"
  },
  tabTextoActivo: {
    color: "#121212",
    fontWeight: "bold"
  },
  tarjetaArchivo: {
    backgroundColor: "#1e1e1f",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(200,178,119,0.2)"
  },
  archivoPreviewCaja: {
    height: 140,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)"
  },
  archivoImagen: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  archivoIconoGenerico: {
    justifyContent: "center",
    alignItems: "center"
  },
  archivoIconoTexto: {
    color: "#c8b277",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2
  },
  archivoDetalles: {
    marginBottom: 16
  },
  archivoTitulo: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6
  },
  archivoRef: {
    color: "#c8b277",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "500"
  },
  archivoAcciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  botonDescargaArchivos: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c8b277", // Borde dorado
    alignItems: "center",
  },
  botonModalEliminarArchivos: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4b4b",
    backgroundColor: "#3a3a3a", // Un gris oscuro/carbón para diferenciarlo
    alignItems: "center",
  },
  textoDescarga: {
    color: "#c8b277",
    fontWeight: "600",
    fontSize: 12,
  },
  textoEliminar: {
    color: "#c8b277",
    fontWeight: "bold",
    fontSize: 12,
  },
  alertaCaja: {
    backgroundColor: "#1e1e1f",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,75,75,0.4)",
    width: "85%"
  }
});