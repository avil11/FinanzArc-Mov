import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: "#121212", justifyContent: "center", padding: 20 },
  loginCard: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  loginLogo: { fontSize: 28, fontWeight: "bold", color: "#c8b277", textAlign: "center" },
  loginSub: { fontSize: 13, color: "#8e8e93", textAlign: "center", marginBottom: 24, marginTop: 4 },
  
  // Estas líneas faltaban:
  loginGroup: { marginBottom: 16 },
  loginLabel: { color: "#fff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  loginInput: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#fff", fontSize: 15 },
  loginBtn: { backgroundColor: "#c8b277", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 10 },
  loginBtnText: { color: "#121212", fontWeight: "bold", fontSize: 15 },
  loginInfoText: { color: "#a4a4aa", fontSize: 13, textAlign: "center", lineHeight: 18 },
  
  loginErrorText: { color: "#ff4b4b", fontSize: 13, textAlign: "center", marginBottom: 12, fontWeight: "500" },
  loginLinkText: { color: "#c8b277", fontSize: 13, fontWeight: "bold", textAlign: "center", textDecorationLine: "underline", marginTop: 6, marginBottom: 20 },
  loginPasswordContainer: { flexDirection: "row", backgroundColor: "#2c2c2e", borderRadius: 8, alignItems: "center" },
  loginPasswordInput: { flex: 1, padding: 12, color: "#fff", fontSize: 15 },
  loginEyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  loginEyeText: { color: "#c8b277", fontSize: 12, fontWeight: "bold" },
});