import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL, API_ENDPOINTS } from "../services/api";
import { authStorage } from "../services/auth";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const manejarLogin = async () => {
    if (!NombreUsuario.trim() || !passwordHash.trim()) {
      setErrorMensaje("Por favor, rellene todos los campos requeridos.");
      return;
    }

    try {
      setCargando(true);
      setErrorMensaje("");

      const respuesta = await fetch(`${API_BASE_URL}${API_ENDPOINTS.usuarios}/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NombreUsuario: NombreUsuario, PasswordHash: passwordHash })
      });

      if (!respuesta.ok) {
        throw new Error("Credenciales inválidas o error de servidor.");
      }

      const data = await respuesta.json();
      
      // Persistencia estricta emulando localStorage web mediante AsyncStorage nativo
      await authStorage.setItem("Token", data.Token);
      await authStorage.setItem("Nombre", data.Nombre || "Usuario");
      await authStorage.setItem("Apellido", data.Apellido || "");

      navigation.replace("General");
    } catch (err) {
      setErrorMensaje(err.message || "Error al intentar iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>FinanzArc</Text>
        <Text style={styles.sub}>Ingreso al Ecosistema Financiero Móvil</Text>

        {errorMensaje ? <Text style={styles.errorText}>{errorMensaje}</Text> : null}

        <View style={styles.group}>
          <Text style={styles.label}>Nombre de Usuario</Text>
          <TextInput style={styles.input} value={NombreUsuario} onChangeText={setNombreUsuario} placeholder="nombredeusuario" placeholderTextColor="#555" autoCapitalize="none" />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={passwordHash} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#555" secureTextEntry={true} />
        </View>

        <TouchableOpacity style={styles.btn} onPress={manejarLogin} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#121212" /> : <Text style={styles.btnText}>Iniciar Sesión</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "rgba(200,178,119,0.2)" },
  logo: { fontSize: 28, fontWeight: "bold", color: "#c8b277", textAlign: "center" },
  sub: { fontSize: 13, color: "#8e8e93", textAlign: "center", marginBottom: 24, marginTop: 4 },
  group: { marginBottom: 16 },
  label: { color: "#fff", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: "#2c2c2e", borderRadius: 8, padding: 12, color: "#fff", fontSize: 15 },
  btn: { backgroundColor: "#c8b277", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 10 },
  btnText: { color: "#121212", fontWeight: "bold", fontSize: 15 },
  errorText: { color: "#ff4b4b", fontSize: 13, textAlign: "center", marginBottom: 12, fontWeight: "500" }
});

export default LoginScreen;