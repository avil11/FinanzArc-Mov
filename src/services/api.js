// Nota: 'localhost' no es accesible desde emuladores o dispositivos físicos.
// Se mapea por defecto la IP de loopback de Android (10.0.2.2). Modificar por tu IP local si testeas en dispositivo real.
export const API_BASE_URL = "http://192.168.1.126:45455/api";

export const API_ENDPOINTS = {
  gastos: "/Gasto",
  ingresos: "/Ingreso",
  usuarios: "/Usuarios",
  ahorros: "/MetaAhorro",
  transacciones: "/Transacciones",
  cierre: "/Cierre"
};