import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AgregarIngresoGastoScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Rami cara e anchoa aca si podes hace que puedan hacer el registro de gasto e ingreso estaria bueno</Text>
            <Text style={styles.subtitulo}>Vas a tener un problema que cuando vos haces el login NO GUARDA EL ID USUARIO en ningun lado. asi que capaz eso te trae problemas. si guarda el token pero no el id usuario.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212', 
    },
    titulo: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitulo: {
        color: '#8e8e93',
        fontSize: 16,
    }
});