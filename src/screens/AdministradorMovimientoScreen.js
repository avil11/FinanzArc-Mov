import React, { useState, useEffect, useMemo } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerTasas } from '../services/api'; // Asegúrate de tener esta función en tu archivo api.js

// NOTA PARA EXPO: Si pruebas en un emulador Android, recuerda que localhost a veces
// debe cambiarse por 10.0.2.2 o tu IP local (ej. 192.168.x.x) para que conecte al backend de .NET.
const API_BASE_URL = "http://192.168.100.3:45455/api";

const AdministradorMovimientos = () => {
  // ==========================================
  // ESTADOS GLOBALES Y DE NAVEGACIÓN
  // ==========================================
  const [tipoActual, setTipoActual] = useState('ingreso'); // 'ingreso' | 'gasto'
  const [usuarioId, setUsuarioId] = useState(null);
  const [tasas, setTasas] = useState({ USD: 1450, EUR: 1650 });
  const [listaDatos, setListaDatos] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());


  // Catálogos
  const [catalogos, setCatalogos] = useState({
    tipoIngreso: [],
    categorias: [],
    modosPago: [],
    divisa: []
  });

  // Estados de UI
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // ==========================================
  // ESTADO DEL FORMULARIO UNIFICADO
  // ==========================================
  const formInicial = {
    id: null,
    monto: "",
    fecha: new Date().toISOString().split('T')[0],
    descripcion: "",
    idCategoria: 1, // Mapea a IdTipoIngreso o IdCategoria
    idModoPago: 1,  // Solo para gastos
    idDivisa: 1
  };
  const [form, setForm] = useState(formInicial);

  // Selector personalizado (para Divisas, Categorías, etc.)
  const [pickerConfig, setPickerConfig] = useState({ visible: false, titulo: '', data: [], onSelect: null, valorActual: null });

  // ==========================================
  // EFECTOS Y CARGA DE DATOS
  // ==========================================
  useEffect(() => {
    inicializarPantalla();
  }, []);

  useEffect(() => {
    if (usuarioId) {
      cargarRegistros(tipoActual, usuarioId);
    }
  }, [tipoActual]);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, fecha: selectedDate.toISOString().split('T')[0] });
    }
  };

  // En tu componente AdministradorMovimientos
 
  const inicializarPantalla = async () => {
    try {
      const tasasActuales = await obtenerTasas();
      if (tasasActuales) setTasas(tasasActuales);

      // Cargar todos los catálogos en paralelo
      const [resTipos, resCat, resPago, resDiv] = await Promise.all([
        fetch(`${API_BASE_URL}/TipoIngreso`).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE_URL}/Categoria`).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE_URL}/ModoPago`).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE_URL}/Divisa`).then(r => r.ok ? r.json() : [])
      ]);

      setCatalogos({
        tipoIngreso: resTipos,
        categorias: resCat,
        modosPago: resPago,
        divisa: resDiv
      });

      // Identificar usuario
      const token = await AsyncStorage.getItem("Token");
      const resUser = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resUser.ok) {
        const usuario = await resUser.json();
        setUsuarioId(usuario.IdUsuario);
        cargarRegistros('ingreso', usuario.IdUsuario); // Carga inicial
      }
    } catch (error) {
      console.error("Error inicializando pantalla:", error);
    }
  };

  const cargarRegistros = async (tipo, uid) => {
    try {
      const token = await AsyncStorage.getItem("Token");
      const endpoint = tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
      const res = await fetch(`${API_BASE_URL}/${endpoint}/ByUsuario/${uid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setListaDatos(data);
      }
    } catch (error) {
      console.error(`Error cargando ${tipo}s:`, error);
    }
  };

  // ==========================================
  // LÓGICA CRUD UNIFICADA
  // ==========================================
  const manejarGuardar = async () => {
    if (!form.descripcion || !form.monto) {
      Alert.alert("Error", "La descripción y el monto son obligatorios.");
      return;
    }

    const esIngreso = tipoActual === 'ingreso';
    const esEdicion = form.id !== null;
    const baseEndpoint = esIngreso ? 'Ingreso' : 'Gasto';
    const url = esEdicion ? `${API_BASE_URL}/${baseEndpoint}/${form.id}` : `${API_BASE_URL}/${baseEndpoint}`;
    const metodo = esEdicion ? "PUT" : "POST";

    // Mapeo estricto a las propiedades requeridas por tus endpoints
    const payload = esIngreso ? {
      IdIngreso: form.id,
      IdUsuario: usuarioId,
      IdTipoIngreso: form.idCategoria,
      IdDivisa: form.idDivisa,
      MontoIngreso: form.monto.toString(),
      FechaIngreso: new Date(form.fecha).toISOString(),
      Descripcion: form.descripcion
    } : {
      IdGasto: form.id,
      IdUsuario: usuarioId,
      IdCategoria: form.idCategoria,
      IdModoPago: form.idModoPago,
      MontoGasto: form.monto.toString(),
      FechaGasto: new Date(form.fecha).toISOString(),
      Descripcion: form.descripcion,
      IdDivisa: form.idDivisa
    };

    try {
      const token = await AsyncStorage.getItem("Token");
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalFormAbierto(false);
        setForm(formInicial);
        cargarRegistros(tipoActual, usuarioId);
      } else {
        Alert.alert("Error", "No se pudo guardar el registro.");
      }
    } catch (err) {
      console.error("Error al guardar", err);
    }
  };

  const eliminarRegistro = (id) => {
    Alert.alert(
      "Eliminar Registro",
      "¿Estás seguro de que deseas eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const endpoint = tipoActual === 'ingreso' ? 'Ingreso' : 'Gasto';
              const token = await AsyncStorage.getItem("Token");
              await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
              });
              cargarRegistros(tipoActual, usuarioId);
            } catch (error) {
              console.error("Error eliminando", error);
            }
          }
        }
      ]
    );
  };

  const prepararEdicion = (item) => {
    const esIngreso = tipoActual === 'ingreso';
    setForm({
      id: esIngreso ? item.IdIngreso : item.IdGasto,
      monto: esIngreso ? item.MontoIngreso : item.MontoGasto,
      fecha: (esIngreso ? item.FechaIngreso : item.FechaGasto).split('T')[0],
      descripcion: item.Descripcion,
      idCategoria: esIngreso ? item.IdTipoIngreso : item.IdCategoria,
      idModoPago: item.IdModoPago || 1,
      idDivisa: item.IdDivisa
    });
    setModalFormAbierto(true);
  };

  const abrirDetalle = (item) => {
    setItemSeleccionado(item);
    setModalDetalleAbierto(true);
  };

  // ==========================================
  // FORMATEOS Y CÁLCULOS
  // ==========================================
  const formatMontoParaInput = (val) => {
    if (!val) return "";
    let stringVal = val.toString().replace(/\./g, "").replace(/,/g, ".");
    const parts = stringVal.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + "," + parts[1] : (stringVal.endsWith(".") ? parts[0] + "," : parts[0]);
  };

  const manejarCambioMonto = (text) => {
    let val = text.replace(/\./g, "").replace(/,/g, ".");
    const numVal = parseFloat(val);
    const regex = /^\d*\.?\d{0,2}$/;
    if (val === "" || (regex.test(val) && numVal <= 1000000000)) {
      setForm({ ...form, monto: val });
    }
  };

  const calcularPesos = (monto, idDivisa) => {
    if (idDivisa === 2) return monto * (tasas.USD || 1450);
    if (idDivisa === 3) return monto * (tasas.EUR || 1650);
    return monto;
  };

  // ==========================================
  // MEMOS (Filtros y Totales)
  // ==========================================
  const datosFiltrados = useMemo(() => {
    return listaDatos.filter(i =>
      i.Descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [listaDatos, busqueda]);

  const totalMonto = useMemo(() => {
    return datosFiltrados.reduce((acc, item) => {
      const monto = tipoActual === 'ingreso' ? item.MontoIngreso : item.MontoGasto;
      return acc + calcularPesos(Number(monto), item.IdDivisa);
    }, 0);
  }, [datosFiltrados, tasas, tipoActual]);

  // ==========================================
  // RENDERIZADOS AUXILIARES (Componentes UI)
  // ==========================================
  const colorPrimario = tipoActual === 'ingreso' ? '#D4AF37' : '#FF4B4B';
  const colorBotonPrimario = tipoActual === 'ingreso' ? ['#d4af37', '#a68b2a'] : ['#FF4B4B', '#CC3333'];

  const abrirPicker = (titulo, data, valorActual, onSelect) => {
    setPickerConfig({ visible: true, titulo, data, valorActual, onSelect });
  };

  const SelectorCustom = () => (
    <Modal visible={pickerConfig.visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerConfig({ ...pickerConfig, visible: false })}>
        <View style={[styles.pickerContainer, { borderTopColor: colorPrimario, borderTopWidth: 4 }]}>
          <Text style={styles.pickerTitle}>{pickerConfig.titulo}</Text>
          <FlatList
            data={pickerConfig.data}
            keyExtractor={(item, idx) => idx.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = pickerConfig.valorActual === item.id;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                  onPress={() => {
                    pickerConfig.onSelect(item.id);
                    setPickerConfig({ ...pickerConfig, visible: false });
                  }}
                >
                  <Text style={[styles.pickerItemText, isSelected && { color: colorPrimario, fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderItemLista = ({ item }) => {
    const esIngreso = tipoActual === 'ingreso';
    const monto = esIngreso ? item.MontoIngreso : item.MontoGasto;
    const id = esIngreso ? item.IdIngreso : item.IdGasto;
    const fecha = esIngreso ? item.FechaIngreso : item.FechaGasto;

    const divisaObj = catalogos.divisa.find(d => d.IdDivisa === item.IdDivisa);
    const simbolo = item.IdDivisa === 1 ? "$" : (item.IdDivisa === 2 ? "USD" : "EUR");

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitulo} numberOfLines={1}>{item.Descripcion}</Text>
          <Text style={styles.cardFecha}>{new Date(fecha).toLocaleDateString('es-AR')}</Text>
        </View>
        <View style={styles.cardDerecha}>
          <View style={styles.contenedorMontos}>
            <Text style={[styles.cardMonto, { color: colorPrimario }]}>
              {simbolo} {Number(monto).toLocaleString('es-AR')}
            </Text>
            {item.IdDivisa !== 1 && (
              <Text style={styles.cardMontoConvertido}>
                ≈ ${calcularPesos(Number(monto), item.IdDivisa).toLocaleString('es-AR')} ARS
              </Text>
            )}
          </View>
          <View style={styles.cardAcciones}>
            <TouchableOpacity onPress={() => prepararEdicion(item)}><Text style={styles.iconBtn}>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarRegistro(id)}><Text style={styles.iconBtn}>🗑️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => abrirDetalle(item)}><Text style={styles.iconBtn}>📊</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TABS DE NAVEGACIÓN */}
      <View style={styles.headerTabs}>
        <TouchableOpacity
          style={[styles.tab, tipoActual === 'ingreso' && styles.tabActive]}
          onPress={() => { setTipoActual('ingreso'); setBusqueda(''); }}
        >
          <Text style={[styles.tabText, tipoActual === 'ingreso' && styles.tabTextActive]}>INGRESOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tipoActual === 'gasto' && styles.tabActive]}
          onPress={() => { setTipoActual('gasto'); setBusqueda(''); }}
        >
          <Text style={[styles.tabText, tipoActual === 'gasto' && styles.tabTextActive]}>GASTOS</Text>
        </TouchableOpacity>
      </View>

      {/* COTIZACIONES */}
      <View style={styles.cotizacionesBox}>
        <Text style={styles.cotizacionesText}>1 USD = ${tasas.USD}  •  1 EUR = ${tasas.EUR}</Text>
      </View>

      {/* RESUMEN Y BUSCADOR */}
      <View style={[styles.resumenContainer, { borderTopColor: colorPrimario }]}>
        <Text style={styles.resumenLabel}>Total Acumulado (ARS)</Text>
        <Text style={styles.resumenTotal}>${totalMonto.toLocaleString('es-AR')}</Text>
        <TextInput
          style={styles.inputBusqueda}
          placeholder={`Buscar en ${tipoActual}s...`}
          placeholderTextColor="#7C818C"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* LISTA PRINCIPAL */}
      <FlatList
        data={datosFiltrados}
        keyExtractor={(item) => {
          // Verificación de seguridad para evitar que falle si el ID es undefined
          const id = tipoActual === 'ingreso' ? item?.IdIngreso : item?.IdGasto;
          return id ? id.toString() : Math.random().toString();
        }}
        renderItem={renderItemLista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Espacio para el FAB
      />

      {/* BOTÓN FLOTANTE (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colorPrimario }]}
        onPress={() => { setForm(formInicial); setModalFormAbierto(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ========================================== */}
      {/* MODAL: FORMULARIO CRUD UNIFICADO */}
      {/* ========================================== */}
      <Modal visible={modalFormAbierto} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderTopColor: colorPrimario }]}>
            <Text style={styles.modalTitle}>
              {form.id ? `Editar ${tipoActual === 'ingreso' ? 'Ingreso' : 'Gasto'}` : `Nuevo ${tipoActual === 'ingreso' ? 'Ingreso' : 'Gasto'}`}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colorPrimario }]}>Descripción</Text>
              <TextInput
                style={styles.input}
                value={form.descripcion}
                onChangeText={t => setForm({ ...form, descripcion: t })}
                maxLength={100}
                placeholderTextColor="#7C818C"
                placeholder={tipoActual === 'ingreso' ? "Ej. Sueldo mensual..." : "Ej. Compra supermercado..."}
              />
              <Text style={styles.charCount}>{form.descripcion.length} / 100</Text>

              <Text style={[styles.inputLabel, { color: colorPrimario }]}>Monto</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formatMontoParaInput(form.monto)}
                onChangeText={manejarCambioMonto}
                placeholder="0.00"
                placeholderTextColor="#7C818C"
              />
              <Text style={[styles.inputLabel, { color: colorPrimario }]}>Fecha</Text>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.selectorText}>{form.fecha}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(form.fecha)}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {tipoActual === 'ingreso' ? (
                <>
                  <Text style={[styles.inputLabel, { color: colorPrimario }]}>Tipo de Ingreso</Text>
                  <TouchableOpacity style={styles.selectorBtn} onPress={() => abrirPicker('Tipo de Ingreso', catalogos.tipoIngreso.map(c => ({ id: c.IdTipoIngreso, label: c.Nombre })), form.idCategoria, (val) => setForm({ ...form, idCategoria: val }))}>
                    <Text style={styles.selectorText}>{catalogos.tipoIngreso.find(c => c.IdTipoIngreso === form.idCategoria)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.inputLabel, { color: colorPrimario }]}>Categoría</Text>
                  <TouchableOpacity style={styles.selectorBtn} onPress={() => abrirPicker('Categoría', catalogos.categorias.map(c => ({ id: c.IdCategoria, label: c.Nombre })), form.idCategoria, (val) => setForm({ ...form, idCategoria: val }))}>
                    <Text style={styles.selectorText}>{catalogos.categorias.find(c => c.IdCategoria === form.idCategoria)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.inputLabel, { color: colorPrimario }]}>Modo de Pago</Text>
                  <TouchableOpacity style={styles.selectorBtn} onPress={() => abrirPicker('Modo de Pago', catalogos.modosPago.map(c => ({ id: c.IdModoPago, label: c.Nombre })), form.idModoPago, (val) => setForm({ ...form, idModoPago: val }))}>
                    <Text style={styles.selectorText}>{catalogos.modosPago.find(c => c.IdModoPago === form.idModoPago)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>
                </>
              )}
              <Text style={[styles.inputLabel, { color: colorPrimario }]}>Divisa</Text>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => abrirPicker('Seleccionar Divisa', [
                  { id: 1, label: 'ARS' },
                  { id: 2, label: 'USD' },
                  { id: 3, label: 'EUR' }
                ], form.idDivisa, (val) => setForm({ ...form, idDivisa: val }))}
              >
                <Text style={styles.selectorText}>
                  {[
                    { id: 1, label: 'ARS' },
                    { id: 2, label: 'USD' },
                    { id: 3, label: 'EUR' }
                  ].find(d => d.id === form.idDivisa)?.label || 'Seleccionar...'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setModalFormAbierto(false)}>
                  <Text style={styles.btnSecondaryText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colorPrimario }]} onPress={manejarGuardar}>
                  <Text style={styles.btnPrimaryText}>GUARDAR</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: DETALLES DEL REGISTRO */}
      {/* ========================================== */}
      <Modal visible={modalDetalleAbierto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderTopColor: colorPrimario }]}>
            {itemSeleccionado && (
              <>
                <Text style={styles.modalTitle}>Detalles del Registro</Text>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Descripción:</Text>
                  <Text style={styles.detalleValor}>{itemSeleccionado.Descripcion}</Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Monto:</Text>
                  <Text style={[styles.detalleValor, { color: colorPrimario, fontWeight: '800', fontSize: 17 }]}>
                    {catalogos.divisa.find(d => d.IdDivisa === itemSeleccionado.IdDivisa)?.CodigoISO} {Number(tipoActual === 'ingreso' ? itemSeleccionado.MontoIngreso : itemSeleccionado.MontoGasto).toLocaleString('es-AR')}
                  </Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Fecha:</Text>
                  <Text style={styles.detalleValor}>{new Date(tipoActual === 'ingreso' ? itemSeleccionado.FechaIngreso : itemSeleccionado.FechaGasto).toLocaleDateString('es-AR')}</Text>
                </View>

                {tipoActual === 'ingreso' ? (
                  <View style={styles.detalleRow}>
                    <Text style={styles.detalleLabel}>Tipo:</Text>
                    <Text style={styles.detalleValor}>{catalogos.tipoIngreso.find(t => t.IdTipoIngreso === itemSeleccionado.IdTipoIngreso)?.Nombre}</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>Categoría:</Text>
                      <Text style={styles.detalleValor}>{catalogos.categorias.find(c => c.IdCategoria === itemSeleccionado.IdCategoria)?.Nombre}</Text>
                    </View>
                    <View style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>Modo Pago:</Text>
                      <Text style={styles.detalleValor}>{catalogos.modosPago.find(m => m.IdModoPago === itemSeleccionado.IdModoPago)?.Nombre}</Text>
                    </View>
                  </>
                )}

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colorPrimario, marginTop: 24 }]} onPress={() => setModalDetalleAbierto(false)}>
                  <Text style={styles.btnPrimaryText}>CERRAR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Renderizado del Picker Customizado */}
      <SelectorCustom />
    </SafeAreaView>
  );
};

// ==========================================
// ESTILOS NATIVOS MÓVILES (PREMIUM UI)
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1015', paddingHorizontal: 16 },

  headerTabs: { 
    flexDirection: 'row', 
    marginTop: 16, 
    marginBottom: 12, 
    borderRadius: 16, 
    backgroundColor: '#1C1C1E', 
    padding: 6 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12 
  },
  tabActive: { 
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2 
  },
  tabText: { color: '#7C818C', fontWeight: '600', letterSpacing: 0.5, fontSize: 13 },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  cotizacionesBox: { alignItems: 'center', marginBottom: 16 },
  cotizacionesText: { color: '#7C818C', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  resumenContainer: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 20, 
    borderTopWidth: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, 
    shadowRadius: 10, 
    elevation: 8 
  },
  resumenLabel: { color: '#9BA1A6', fontSize: 13, textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  resumenTotal: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },

  inputBusqueda: { 
    backgroundColor: '#252528', 
    color: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 16,
    paddingVertical: 14, 
    fontSize: 15, 
    marginTop: 20 
  },

  cardItem: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 4 
  },
  cardInfo: { flex: 1, paddingRight: 12 },
  cardTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6, letterSpacing: 0.2 },
  cardFecha: { color: '#9BA1A6', fontSize: 13, fontWeight: '500' },
  cardDerecha: { alignItems: 'flex-end' },
  contenedorMontos: { alignItems: 'flex-end', marginBottom: 12 },
  cardMonto: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  cardMontoConvertido: { fontSize: 11, color: '#7C818C', marginTop: 4, fontWeight: '500' },
  cardAcciones: { flexDirection: 'row', gap: 18 },
  iconBtn: { fontSize: 17 },

  emptyText: { color: '#7C818C', textAlign: 'center', marginTop: 40, fontSize: 16, fontWeight: '500' },

  fab: { 
    position: 'absolute', 
    bottom: 32, 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 10, 
    elevation: 10 
  },
  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 24, 
    padding: 24, 
    maxHeight: '90%', 
    borderTopWidth: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, 
    shadowRadius: 15, 
    elevation: 15 
  },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 24, letterSpacing: 0.5 },

  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 18, textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    backgroundColor: '#252528', 
    color: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#333336' 
  },
  charCount: { color: '#7C818C', fontSize: 11, textAlign: 'right', marginTop: 6, fontWeight: '500' },

  selectorBtn: { 
    backgroundColor: '#252528', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: '#333336' 
  },
  selectorText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },

  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 12 },
  btnSecondary: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#2C2C2E', alignItems: 'center' },
  btnSecondaryText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.5 },
  btnPrimary: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },

  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  detalleLabel: { color: '#9BA1A6', fontSize: 15, fontWeight: '500' },
  detalleValor: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 15 },

  pickerContainer: { 
    backgroundColor: '#1C1C1E', 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: 24, 
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20
  },
  pickerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center', letterSpacing: 0.5 },
  pickerItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', borderRadius: 8 },
  pickerItemText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', fontWeight: '500' }
});

export default AdministradorMovimientos;