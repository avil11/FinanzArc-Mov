// Nota: 'localhost' no es accesible desde emuladores o dispositivos físicos.
// Se mapea por defecto la IP de loopback de Android (10.0.2.2). Modificar por tu IP local si testeas en dispositivo real.
export const API_BASE_URL = "http://192.168.1.126:45459/api";

export const API_ENDPOINTS = {
  gastos: "/Gasto",
  ingresos: "/Ingreso",
  usuarios: "/Usuarios",
  ahorros: "/MetaAhorro",
  transacciones: "/Transacciones",
  cierre: "/Cierre"
};

export const obtenerTasas = async () => {
  try {
    // Realizamos ambas peticiones al mismo tiempo para mejorar la velocidad
    const [resUsd, resEur] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares/blue"),
      fetch("https://dolarapi.com/v1/cotizaciones/eur")
    ]);

    // Verificamos si ambas peticiones fueron exitosas
    if (!resUsd.ok || !resEur.ok) {
      throw new Error("Error en la conexión con DolarAPI");
    }

    const dataUsd = await resUsd.json();
    const dataEur = await resEur.json();

    // DolarAPI nos devuelve un objeto que contiene 'venta'
    // 'venta' es el valor que realmente pagarías en el mercado
    return {
      USD: Number(dataUsd.venta),
      EUR: Number(dataEur.venta)
    };

  } catch (error) {
    console.error("Error al obtener tasas de DolarAPI, usando respaldo:", error);
    // Mantenemos tus valores predefinidos por si la API falla
    return { USD: 1450, EUR: 1650 };
  }
};