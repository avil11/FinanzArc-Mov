import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import 'react-native-gesture-handler';


import LoginScreen from "./src/screens/LoginScreen";
import GeneralScreen from "./src/screens/GeneralScreen";
import ComparativaScreen from "./src/screens/Comparativa";
import ArchivosScreen from "./src/screens/ArchivosScreen";
import Navbar from "./src/components/Navbar";


// Componentes Contenedores para las rutas secundarias del ecosistema web
import { View, Text, StyleSheet } from "react-native";
const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      
      <StatusBar style="light" backgroundColor="#1e1e1f" />
      
      <NavigationContainer>

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: "#1e1e1f", borderBottomWidth: 0 },
            headerTintColor: "#c8b277",
            headerTitleStyle: { fontWeight: "bold" },
            cardStyle: { backgroundColor: "#121212" },
          }}
        >
          <Stack.Screen name="Comparativa" component={ComparativaScreen} options={{ title: "Balance" }} />
<Stack.Screen name="Archivos" component={ArchivosScreen} options={{ title: "Archivos" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="General" component={GeneralScreen} options={{ title: "Resumen Financiero" }} />
         
        
        </Stack.Navigator>

      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },
  text: { color: "#ffffff", fontSize: 16, fontWeight: "600" }
});
