import { StyleSheet } from "react-native";

export const movimientoStyles = StyleSheet.create({
  tarjetaMovimiento: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  iconoMovimiento: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 16 },
  movimientoDesc: { color: "#ffffff", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  movimientoMonto: { fontSize: 16, fontWeight: "800" },
  movimientoTipo: { color: "#8e8e93", fontSize: 11, letterSpacing: 0.5, marginTop: 2 },
  contenedorPrincipal: { flex: 1, padding: 20 },
  seccionEncabezado: { marginBottom: 24 },
  tituloPrincipal: { fontSize: 24, fontWeight: "bold", color: "#c8b277", marginBottom: 8 },
  descripcionEncabezado: { color: "#8e8e93", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  buscadorContenedor: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1e1f", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(200, 178, 119, 0.15)" },
  buscadorIcono: { fontSize: 18, marginRight: 10, opacity: 0.7 },
  buscadorInput: { flex: 1, color: "#ffffff", fontSize: 15, padding: 0 },
  avisoVacio: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, backgroundColor: "rgba(200, 178, 119, 0.03)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(200, 178, 119, 0.1)", borderStyle: "dashed" },
  mensajeVacio: { color: "#ffffff", fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  movimientoFechaContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  movimientoFecha: { color: "#8e8e93", fontSize: 11, letterSpacing: 0.2 },
  movimientoFechaIcon: { fontSize: 10, marginRight: 4, opacity: 0.6 }
});