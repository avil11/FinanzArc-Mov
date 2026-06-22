import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL, API_ENDPOINTS } from "../services/api";
import { authStorage } from "../services/auth";

// IMPORTAMOS LOS ESTILOS GLOBALES
import { globalStyles } from "../styles/styles";

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
    <View style={globalStyles.loginContainer}>
      <View style={globalStyles.loginCard}>
        <Text style={globalStyles.loginLogo}>FinanzArc</Text>
        <Text style={globalStyles.loginSub}>Ingrese al Ecosistema Financiero Móvil.</Text>
        
        <Text style={globalStyles.loginInfoText}>
          Si usted no tiene una cuenta de FinanzARC, diríjase a nuestra página web para crear una.
        </Text>

        <TouchableOpacity onPress={abrirWeb} activeOpacity={0.7}>
          <Text style={globalStyles.loginLinkText}>Crear cuenta en FinanzARC Web →</Text>
        </TouchableOpacity>
        
        {errorMensaje ? <Text style={globalStyles.loginErrorText}>{errorMensaje}</Text> : null}

        <View style={globalStyles.loginGroup}>
          <Text style={globalStyles.loginLabel}>Nombre de Usuario</Text>
          <TextInput 
            style={globalStyles.loginInput} 
            value={NombreUsuario} 
            onChangeText={setNombreUsuario} 
            placeholder="nombredeusuario" 
            placeholderTextColor="#555" 
            autoCapitalize="none" 
          />
        </View>

        <View style={globalStyles.loginGroup}>
          <Text style={globalStyles.loginLabel}>Contraseña</Text>
          
          <View style={globalStyles.loginPasswordContainer}>
            <TextInput 
              style={globalStyles.loginPasswordInput} 
              value={passwordHash} 
              onChangeText={setPassword} 
              placeholder="••••••••" 
              placeholderTextColor="#555" 
              secureTextEntry={ocultarPassword}
            />
            <TouchableOpacity 
              style={globalStyles.loginEyeButton} 
              onPress={() => setOcultarPassword(!ocultarPassword)}
            >
              <Text style={globalStyles.loginEyeText}>
                {ocultarPassword ? "Mostrar" : "Ocultar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={globalStyles.loginBtn} onPress={manejarLogin} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#121212" /> : <Text style={globalStyles.loginBtnText}>Iniciar Sesión</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;