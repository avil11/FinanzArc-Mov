import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL, API_ENDPOINTS } from "../../services/api";
import { authStorage } from "../../services/auth";

// IMPORTAMOS LOS ESTILOS GLOBALES
import { globalStyles } from "../../styles/styles";
import { loginStyles } from './LoginStyles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [passwordHash, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [ocultarPassword, setOcultarPassword] = useState(true);

  const abrirWeb = async () => {
    const url = "https://tu-pagina-web.com";
    const soportado = await Linking.canOpenURL(url);
    if (soportado) {
      await Linking.openURL(url);
    } else {
      console.log("No se puede abrir la URL: " + url);
    }
  };

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

      // 🔐 ALMACENAMIENTO SEGURO DEL ECOSISTEMA DE AUTENTICACIÓN
      await authStorage.setItem("Token", data.Token);
      await authStorage.setItem("Nombre", data.Nombre || "Usuario");
      await authStorage.setItem("Apellido", data.Apellido || "");

      const uid = data.idUsuario ?? data.IdUsuario;
      if (uid !== undefined && uid !== null) {
        // IMPORTANTE: Usa la importación directa de AsyncStorage para evitar el problema de 'undefined'
        await AsyncStorage.setItem("IdUsuario", uid.toString());
        console.log("IdUsuario guardado correctamente:", uid);
      } else {
        console.warn("Alerta: La API de Login no retornó ningún campo 'idUsuario'.");
      }

      navigation.replace("General");
    } catch (err) {
      setErrorMensaje(err.message || "Error al intentar iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };


  return (
    // CAMBIO CLAVE: loginStyles en lugar de globalStyles
    <View style={loginStyles.loginContainer}>
      <View style={loginStyles.loginCard}>
        <Text style={loginStyles.loginLogo}>FinanzArc</Text>
        <Text style={loginStyles.loginSub}>Ingrese al Ecosistema Financiero Móvil.</Text>

        <Text style={loginStyles.loginInfoText}>
          Si usted no tiene una cuenta de FinanzARC, diríjase a nuestra página web para crear una.
        </Text>

        <TouchableOpacity onPress={abrirWeb} activeOpacity={0.7}>
          <Text style={loginStyles.loginLinkText}>Crear cuenta en FinanzARC Web →</Text>
        </TouchableOpacity>

        {errorMensaje ? <Text style={loginStyles.loginErrorText}>{errorMensaje}</Text> : null}

        <View style={loginStyles.loginGroup}>
          <Text style={loginStyles.loginLabel}>Nombre de Usuario</Text>
          <TextInput
            style={loginStyles.loginInput}
            value={NombreUsuario}
            onChangeText={setNombreUsuario}
            placeholder="nombredeusuario"
            placeholderTextColor="#555"
            autoCapitalize="none"
          />
        </View>

        <View style={loginStyles.loginGroup}>
          <Text style={loginStyles.loginLabel}>Contraseña</Text>

          <View style={loginStyles.loginPasswordContainer}>
            <TextInput
              style={loginStyles.loginPasswordInput}
              value={passwordHash}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#555"
              secureTextEntry={ocultarPassword}
            />
            <TouchableOpacity
              style={loginStyles.loginEyeButton}
              onPress={() => setOcultarPassword(!ocultarPassword)}
            >
              <Text style={loginStyles.loginEyeText}>
                {ocultarPassword ? "Mostrar" : "Ocultar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={loginStyles.loginBtn} onPress={manejarLogin} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#121212" /> : <Text style={loginStyles.loginBtnText}>Iniciar Sesión</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;