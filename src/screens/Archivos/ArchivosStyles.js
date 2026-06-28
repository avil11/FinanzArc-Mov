import { StyleSheet } from "react-native";

export const archivosStyles = StyleSheet.create({
  filtrosRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  pickerWrapperFiltro: { flex: 1, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)", overflow: "hidden" },
  tabsContenedor: { flexDirection: "row", backgroundColor: "#1e1e1f", borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  tabBoton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  tabBotonActivo: { backgroundColor: "#c8b277" },
  tabTexto: { color: "#8e8e93", fontSize: 14, fontWeight: "600" },
  tabTextoActivo: { color: "#121212", fontWeight: "bold" },
  tarjetaArchivo: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  archivoPreviewCaja: { height: 140, width: "100%", borderRadius: 12, backgroundColor: "#2c2c2e", justifyContent: "center", alignItems: "center", marginBottom: 16, overflow: "hidden" },
  archivoImagen: { width: "100%", height: "100%", resizeMode: "cover" },
  // ... (todo lo que sea exclusivamente de la vista de archivos)

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
  movimientoFecha: { color: "#8e8e93", fontSize: 12 },
  botonDescargaArchivos: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c8b277", // Borde dorado
    alignItems: "center",
  },
  textoDescarga: {
    color: "#c8b277",
    fontWeight: "600",
    fontSize: 12,
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
  textoEliminar: {
    color: "#c8b277",
    fontWeight: "bold",
    fontSize: 12,
  },
  bloqueoContenedor: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212", padding: 20 },
  bloqueoTarjeta: { backgroundColor: "#1e1e1f", borderRadius: 24, padding: 32, alignItems: "center", borderColor: "rgba(200,178,119,0.3)", borderWidth: 1, width: "100%" },
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
  botonArchivar: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#c8b277", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 4 },
  botonArchivarTexto: { color: "#c8b277", fontWeight: "bold", fontSize: 14 },
  capaModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  contenidoModal: { backgroundColor: "#1e1e1f", width: "100%", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.3)" },
  tituloTarjeta: { fontSize: 18, fontWeight: "bold", color: "#ffffff", marginBottom: 16 },
  formularioGrupo: { marginBottom: 16 },
  labelForm: { color: "#ffffff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputSelectContainer: { backgroundColor: "#2c2c2e", borderRadius: 8, overflow: "hidden" },
  pickerNativo: { color: "#ffffff", backgroundColor: "#2c2c2e" },
  inputForm: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#ffffff", fontSize: 15 },

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


});