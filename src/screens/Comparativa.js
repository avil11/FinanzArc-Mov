import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "https://192.168.100.3:45458/api";
const screenWidth = Dimensions.get("window").width;

const ComparativaScreen = () => {
    const [datos, setDatos] = useState({ ingresos: [], gastos: [] });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("Token");
                const [resI, resG] = await Promise.all([
                    fetch(`${API_BASE_URL}/Ingreso/ByUsuario/9`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()),
                    fetch(`${API_BASE_URL}/Gasto/ByUsuario/9`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json())
                ]);
                setDatos({ ingresos: resI, gastos: resG });
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, []);

    const chartData = [
        { name: "Ingresos", population: datos.ingresos.length, color: "#4caf50", legendFontColor: "#fff" },
        { name: "Gastos", population: datos.gastos.length, color: "#ff5252", legendFontColor: "#fff" }
    ];

    if (cargando) return <View style={styles.center}><ActivityIndicator size="large" color="#c8b277" /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Balance Comparativo</Text>
            
            <View style={styles.card}>
                <PieChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                />
            </View>

            <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Descripción</Text>
                <Text style={styles.headerText}>Monto</Text>
            </View>

            {[...datos.ingresos, ...datos.gastos].map((item, index) => (
                <View key={index} style={styles.row}>
                    <Text style={styles.cellText}>{item.Descripcion || "Registro"}</Text>
                    <Text style={[styles.cellText, { color: item.MontoGasto ? "#ff5252" : "#4caf50" }]}>
                        ${item.MontoGasto || item.MontoIngreso}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212", padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#c8b277', marginBottom: 20 },
    card: { backgroundColor: "#1e1e1f", borderRadius: 16, padding: 10, alignItems: "center" },
    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', marginTop: 20 },
    headerText: { color: '#c8b277', fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#222' },
    cellText: { color: '#ffffff', fontSize: 14 }
});

export default ComparativaScreen;