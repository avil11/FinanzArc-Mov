import AsyncStorage from "@react-native-async-storage/async-storage";

export const authStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Error leyendo llave de sesión movil:", error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error escribiendo llave de sesión movil:", error);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.removeItem("Token");
      await AsyncStorage.removeItem("Nombre");
      await AsyncStorage.removeItem("Apellido");
    } catch (error) {
      console.error("Error limpiando sesión:", error);
    }
  }
};