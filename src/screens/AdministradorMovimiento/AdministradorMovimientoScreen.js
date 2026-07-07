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
import { obtenerTasas } from '../../services/api'; 

import { administrarMovimientoStyles } from './AdministradorMovimientoStyles';


const API_BASE_URL = "http://192.168.1.126:45457/api";

const AdministradorMovimientos = () => {

  const [tipoActual, setTipoActual] = useState('ingreso');
  const [usuarioId, setUsuarioId] = useState(null);
  const [tasas, setTasas] = useState({ USD: 1450, EUR: 1650 });
  const [listaDatos, setListaDatos] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const [catalogos, setCatalogos] = useState({
    tipoIngreso: [],
    categorias: [],
    modosPago: [],
    divisa: []
  });

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
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
  const [pickerConfig, setPickerConfig] = useState({ visible: false, titulo: '', data: [], onSelect: null, valorActual: null });

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

  const inicializarPantalla = async () => {
    try {
      const tasasActuales = await obtenerTasas();
      if (tasasActuales) setTasas(tasasActuales);

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

      const token = await AsyncStorage.getItem("Token");
      const resUser = await fetch(`${API_BASE_URL}/Usuarios/ByToken`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resUser.ok) {
        const usuario = await resUser.json();
        setUsuarioId(usuario.IdUsuario);
        cargarRegistros('ingreso', usuario.IdUsuario);
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

  const colorPrimario = tipoActual === 'ingreso' ? '#D4AF37' : '#FF4B4B';
  const colorBotonPrimario = tipoActual === 'ingreso' ? ['#d4af37', '#a68b2a'] : ['#FF4B4B', '#CC3333'];
  const abrirPicker = (titulo, data, valorActual, onSelect) => {
    setPickerConfig({ visible: true, titulo, data, valorActual, onSelect });
  };

  const SelectorCustom = () => (
    <Modal visible={pickerConfig.visible} transparent animationType="slide">
      <TouchableOpacity
        style={administrarMovimientoStyles.modalOverlay}
        activeOpacity={1}
        onPress={() =>
          setPickerConfig({ ...pickerConfig, visible: false })
        }
      >
        <View
          style={[
            administrarMovimientoStyles.pickerContainer,
            {
              borderTopColor: colorPrimario,
              borderTopWidth: 4,
            },
          ]}
        >
          <Text style={administrarMovimientoStyles.pickerTitle}>
            {pickerConfig.titulo}
          </Text>

          <FlatList
            data={pickerConfig.data}
            keyExtractor={(item, idx) => idx.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected =
                pickerConfig.valorActual === item.id;

              return (
                <TouchableOpacity
                  style={[
                    administrarMovimientoStyles.pickerItem,
                    isSelected && {
                      backgroundColor:
                        "rgba(255,255,255,0.08)",
                    },
                  ]}
                  onPress={() => {
                    pickerConfig.onSelect(item.id);
                    setPickerConfig({
                      ...pickerConfig,
                      visible: false,
                    });
                  }}
                >
                  <Text
                    style={[
                      administrarMovimientoStyles.pickerItemText,
                      isSelected && {
                        color: colorPrimario,
                        fontWeight: "700",
                      },
                    ]}
                  >
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
      <View style={administrarMovimientoStyles.cardItem}>
        <View style={administrarMovimientoStyles.cardInfo}>
          <Text style={administrarMovimientoStyles.cardTitulo} numberOfLines={1}>{item.Descripcion}</Text>
          <Text style={administrarMovimientoStyles.cardFecha}>{new Date(fecha).toLocaleDateString('es-AR')}</Text>
        </View>
        <View style={administrarMovimientoStyles.cardDerecha}>
          <View style={administrarMovimientoStyles.contenedorMontos}>
            <Text style={[administrarMovimientoStyles.cardMonto, { color: colorPrimario }]}>
              {simbolo} {Number(monto).toLocaleString('es-AR')}
            </Text>
            {item.IdDivisa !== 1 && (
              <Text style={administrarMovimientoStyles.cardMontoConvertido}>
                ≈ ${calcularPesos(Number(monto), item.IdDivisa).toLocaleString('es-AR')} ARS
              </Text>
            )}
          </View>
          <View style={administrarMovimientoStyles.cardAcciones}>
            <TouchableOpacity onPress={() => prepararEdicion(item)}><Text style={administrarMovimientoStyles.iconBtn}>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarRegistro(id)}><Text style={administrarMovimientoStyles.iconBtn}>🗑️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => abrirDetalle(item)}><Text style={administrarMovimientoStyles.iconBtn}>📊</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (

    <SafeAreaView style={administrarMovimientoStyles.container}>

      <View style={administrarMovimientoStyles.headerTabs}>
        <TouchableOpacity
          style={[administrarMovimientoStyles.tab, tipoActual === 'ingreso' && administrarMovimientoStyles.tabActive]}
          onPress={() => { setTipoActual('ingreso'); setBusqueda(''); }}
        >
          <Text style={[administrarMovimientoStyles.tabText, tipoActual === 'ingreso' && administrarMovimientoStyles.tabTextActive]}>INGRESOS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[administrarMovimientoStyles.tab, tipoActual === 'gasto' && administrarMovimientoStyles.tabActive]}
          onPress={() => { setTipoActual('gasto'); setBusqueda(''); }}
        >
          <Text style={[administrarMovimientoStyles.tabText, tipoActual === 'gasto' && administrarMovimientoStyles.tabTextActive]}>GASTOS</Text>
        </TouchableOpacity>
      </View>

      <View style={administrarMovimientoStyles.cotizacionesBox}>
        <Text style={administrarMovimientoStyles.cotizacionesText}>1 USD = ${tasas.USD}  •  1 EUR = ${tasas.EUR}</Text>
      </View>

      <View style={[administrarMovimientoStyles.resumenContainer, { borderTopColor: colorPrimario }]}>
        <Text style={administrarMovimientoStyles.resumenLabel}>Total Acumulado (ARS)</Text>
        <Text style={administrarMovimientoStyles.resumenTotal}>${totalMonto.toLocaleString('es-AR')}</Text>
        <TextInput
          style={administrarMovimientoStyles.inputBusqueda}
          placeholder={`Buscar en ${tipoActual}s...`}
          placeholderTextColor="#7C818C"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        data={datosFiltrados}
        keyExtractor={(item) => {
          const id = tipoActual === 'ingreso' ? item?.IdIngreso : item?.IdGasto;
          return id ? id.toString() : Math.random().toString();
        }}
        renderItem={renderItemLista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} 
      />

      <TouchableOpacity
        style={[administrarMovimientoStyles.fab, { backgroundColor: colorPrimario }]}
        onPress={() => { setForm(formInicial); setModalFormAbierto(true); }}
        activeOpacity={0.8}
      >
        <Text style={administrarMovimientoStyles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalFormAbierto} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={administrarMovimientoStyles.modalOverlay}>
          <View style={[administrarMovimientoStyles.modalContent, { borderTopColor: colorPrimario }]}>
            <Text style={administrarMovimientoStyles.modalTitle}>
              {form.id ? `Editar ${tipoActual === 'ingreso' ? 'Ingreso' : 'Gasto'}` : `Nuevo ${tipoActual === 'ingreso' ? 'Ingreso' : 'Gasto'}`}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Descripción</Text>
              <TextInput
                style={administrarMovimientoStyles.input}
                value={form.descripcion}
                onChangeText={t => setForm({ ...form, descripcion: t })}
                maxLength={100}
                placeholderTextColor="#7C818C"
                placeholder={tipoActual === 'ingreso' ? "Ej. Sueldo mensual..." : "Ej. Compra supermercado..."}
              />
              <Text style={administrarMovimientoStyles.charCount}>{form.descripcion.length} / 100</Text>

              <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Monto</Text>
              <TextInput
                style={administrarMovimientoStyles.input}
                keyboardType="numeric"
                value={formatMontoParaInput(form.monto)}
                onChangeText={manejarCambioMonto}
                placeholder="0.00"
                placeholderTextColor="#7C818C"
              />
              <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Fecha</Text>
              <TouchableOpacity
                style={administrarMovimientoStyles.selectorBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={administrarMovimientoStyles.selectorText}>{form.fecha}</Text>
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
                  <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Tipo de Ingreso</Text>
                  <TouchableOpacity style={administrarMovimientoStyles.selectorBtn} onPress={() => abrirPicker('Tipo de Ingreso', catalogos.tipoIngreso.map(c => ({ id: c.IdTipoIngreso, label: c.Nombre })), form.idCategoria, (val) => setForm({ ...form, idCategoria: val }))}>
                    <Text style={administrarMovimientoStyles.selectorText}>{catalogos.tipoIngreso.find(c => c.IdTipoIngreso === form.idCategoria)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Categoría</Text>
                  <TouchableOpacity style={administrarMovimientoStyles.selectorBtn} onPress={() => abrirPicker('Categoría', catalogos.categorias.map(c => ({ id: c.IdCategoria, label: c.Nombre })), form.idCategoria, (val) => setForm({ ...form, idCategoria: val }))}>
                    <Text style={administrarMovimientoStyles.selectorText}>{catalogos.categorias.find(c => c.IdCategoria === form.idCategoria)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>

                  <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Modo de Pago</Text>
                  <TouchableOpacity style={administrarMovimientoStyles.selectorBtn} onPress={() => abrirPicker('Modo de Pago', catalogos.modosPago.map(c => ({ id: c.IdModoPago, label: c.Nombre })), form.idModoPago, (val) => setForm({ ...form, idModoPago: val }))}>
                    <Text style={administrarMovimientoStyles.selectorText}>{catalogos.modosPago.find(c => c.IdModoPago === form.idModoPago)?.Nombre || 'Seleccionar...'}</Text>
                  </TouchableOpacity>
                </>
              )}
              <Text style={[administrarMovimientoStyles.inputLabel, { color: colorPrimario }]}>Divisa</Text>
              <TouchableOpacity
                style={administrarMovimientoStyles.selectorBtn}
                onPress={() => abrirPicker('Seleccionar Divisa', [
                  { id: 1, label: 'ARS' },
                  { id: 2, label: 'USD' },
                  { id: 3, label: 'EUR' }
                ], form.idDivisa, (val) => setForm({ ...form, idDivisa: val }))}
              >
                <Text style={administrarMovimientoStyles.selectorText}>
                  {[
                    { id: 1, label: 'ARS' },
                    { id: 2, label: 'USD' },
                    { id: 3, label: 'EUR' }
                  ].find(d => d.id === form.idDivisa)?.label || 'Seleccionar...'}
                </Text>
              </TouchableOpacity>

              <View style={administrarMovimientoStyles.modalActions}>
                <TouchableOpacity style={administrarMovimientoStyles.btnSecondary} onPress={() => setModalFormAbierto(false)}>
                  <Text style={administrarMovimientoStyles.btnSecondaryText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[administrarMovimientoStyles.btnPrimary, { backgroundColor: colorPrimario }]} onPress={manejarGuardar}>
                  <Text style={administrarMovimientoStyles.btnPrimaryText}>GUARDAR</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <SelectorCustom />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalDetalleAbierto} transparent animationType="fade">
        <View style={administrarMovimientoStyles.modalOverlay}>
          <View style={[administrarMovimientoStyles.modalContent, { borderTopColor: colorPrimario }]}>
            {itemSeleccionado && (
              <>
                <Text style={administrarMovimientoStyles.modalTitle}>Detalles del Registro</Text>
                <View style={administrarMovimientoStyles.detalleRow}>
                  <Text style={administrarMovimientoStyles.detalleLabel}>Descripción:</Text>
                  <Text style={administrarMovimientoStyles.detalleValor}>{itemSeleccionado.Descripcion}</Text>
                </View>
                <View style={administrarMovimientoStyles.detalleRow}>
                  <Text style={administrarMovimientoStyles.detalleLabel}>Monto:</Text>
                  <Text style={[administrarMovimientoStyles.detalleValor, { color: colorPrimario, fontWeight: '800', fontSize: 17 }]}>
                    {catalogos.divisa.find(d => d.IdDivisa === itemSeleccionado.IdDivisa)?.CodigoISO} {Number(tipoActual === 'ingreso' ? itemSeleccionado.MontoIngreso : itemSeleccionado.MontoGasto).toLocaleString('es-AR')}
                  </Text>
                </View>
                <View style={administrarMovimientoStyles.detalleRow}>
                  <Text style={administrarMovimientoStyles.detalleLabel}>Fecha:</Text>
                  <Text style={administrarMovimientoStyles.detalleValor}>{new Date(tipoActual === 'ingreso' ? itemSeleccionado.FechaIngreso : itemSeleccionado.FechaGasto).toLocaleDateString('es-AR')}</Text>
                </View>

                {tipoActual === 'ingreso' ? (
                  <View style={administrarMovimientoStyles.detalleRow}>
                    <Text style={administrarMovimientoStyles.detalleLabel}>Tipo:</Text>
                    <Text style={administrarMovimientoStyles.detalleValor}>{catalogos.tipoIngreso.find(t => t.IdTipoIngreso === itemSeleccionado.IdTipoIngreso)?.Nombre}</Text>
                  </View>
                ) : (
                  <>
                    <View style={administrarMovimientoStyles.detalleRow}>
                      <Text style={administrarMovimientoStyles.detalleLabel}>Categoría:</Text>
                      <Text style={administrarMovimientoStyles.detalleValor}>{catalogos.categorias.find(c => c.IdCategoria === itemSeleccionado.IdCategoria)?.Nombre}</Text>
                    </View>
                    <View style={administrarMovimientoStyles.detalleRow}>
                      <Text style={administrarMovimientoStyles.detalleLabel}>Modo Pago:</Text>
                      <Text style={administrarMovimientoStyles.detalleValor}>{catalogos.modosPago.find(m => m.IdModoPago === itemSeleccionado.IdModoPago)?.Nombre}</Text>
                    </View>
                  </>
                )}

                <TouchableOpacity style={[ administrarMovimientoStyles.btnPrimary,{ marginTop: 24, flex: 0,  width: '100%', backgroundColor: colorPrimario || '#007AFF'}]}onPress={() => setModalDetalleAbierto(false)} >
                  <Text style={administrarMovimientoStyles.btnCerrarText}>CERRAR</Text>
                </TouchableOpacity>
                
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    
  );
};

export default AdministradorMovimientos;