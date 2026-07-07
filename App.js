import React from "react";
import 'react-native-gesture-handler';
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";

import LoginScreen from "./src/screens/Login/LoginScreen";
import GeneralScreen from "./src/screens/General/GeneralScreen";
import MovimientosScreen from "./src/screens/Movimientos/MovimientosScreen";
import ArchivosScreen from "./src/screens/Archivos/ArchivosScreen";
import PlanesScreen from "./src/screens/Planes/PlanesScreen";
import AdministradorMovimientos from "./src/screens/AdministradorMovimiento/AdministradorMovimientoScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#1e1e1f" />
      
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: "#1e1e1f", borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0 },
            headerTintColor: "#c8b277",
            headerTitleStyle: { fontWeight: "bold" },
            cardStyle: { backgroundColor: "#121212" },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="General" component={GeneralScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Movimientos" component={MovimientosScreen} options={{ title: "Movimientos" }} />
          <Stack.Screen name="Archivos" component={ArchivosScreen} options={{ title: "Archivos" }} />
          <Stack.Screen name="Planes" component={PlanesScreen} options={{ title: "Planes" }} />
          <Stack.Screen name="AgregarIngresoGasto" component={AdministradorMovimientos} options={{ title: "AgregarIngresoGasto" }} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },
  text: { color: "#ffffff", fontSize: 16, fontWeight: "600" }
});