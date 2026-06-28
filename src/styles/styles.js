import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({

  botonMejorarPlan: { backgroundColor: "#c8b277", paddingVertical: 14, width: "100%", alignItems: "center", borderRadius: 12, marginBottom: 12 },
  botonVolver: { paddingVertical: 14, width: "100%", alignItems: "center", backgroundColor: "transparent" },
  textoVolver: { color: "#8e8e93", fontWeight: "600", fontSize: 14 },
  botonSecundarioBorde: { paddingVertical: 12, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#8e8e93", borderRadius: 8, marginTop: 10 },
  textoSecundarioBorde: { color: "#ffffff", fontWeight: "600" },
  
  

  bloqueoIcono: { fontSize: 48, marginBottom: 16 },
  bloqueoTitulo: { color: "#ffffff", fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  bloqueoTexto: { color: "#a4a4aa", textAlign: "center", marginBottom: 24, lineHeight: 22, fontSize: 14 },

  pickerWrapperFiltroDedicado: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8b277',      
    overflow: 'hidden',
    height: 50,               
    justifyContent: 'center',
  },
  pickerTextoDedicado: {
    color: '#000000',            
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