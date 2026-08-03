import dayjs from 'dayjs';
import { calcularCiclos, rangoAnioServicio } from './ciclos';

export const BLOQUES_POR_FILA = 4;

export function formatearFecha(fecha) {
  return fecha ? dayjs(fecha).format('DD/MM/YYYY') : '';
}

export function nombreArchivoS13(numero, anio, extension) {
  return `S-13_Territorio-${numero}_${anio}.${extension}`;
}

// Arma los datos de la planilla S-13-S para un territorio y un año de servicio.
// Cada ciclo del territorio se convierte en un bloque "Asignado a": el nombre es el
// conductor de la primera salida del ciclo, y las fechas son la de esa primera salida
// y la de la salida que cerró el ciclo.
export function generarDatosS13({ numero, manzanas, salidas, anioServicio }) {
  const { desde, hasta } = rangoAnioServicio(anioServicio);
  const ciclos = calcularCiclos(salidas, manzanas);

  // La última vez que se completó el territorio hasta el cierre del año de servicio.
  // No se limita a lo anterior al 1 de septiembre para que la celda no quede vacía
  // cuando el territorio no tiene historial previo al año que se está imprimiendo.
  const completados = ciclos.filter(
    (c) => c.completo && dayjs(c.fechaCompletado).valueOf() <= hasta.valueOf()
  );
  const ultimaFechaCompletado = completados[completados.length - 1]?.fechaCompletado ?? null;

  const asignaciones = ciclos
    .filter((c) => {
      const asignacion = dayjs(c.fechaAsignacion).valueOf();
      return asignacion >= desde.valueOf() && asignacion <= hasta.valueOf();
    })
    .map((c) => ({
      nombre: c.conductorAsignacion ?? '-',
      fechaAsignacion: c.fechaAsignacion,
      fechaCompletado: c.fechaCompletado,
    }));

  // Los bloques se agrupan de a 4 por fila; si sobran, continúan en la fila siguiente
  // (igual que el formulario impreso). Sin asignaciones, una fila en blanco.
  const filas = [];
  for (let i = 0; i < asignaciones.length; i += BLOQUES_POR_FILA) {
    const grupo = asignaciones.slice(i, i + BLOQUES_POR_FILA);
    while (grupo.length < BLOQUES_POR_FILA) grupo.push(null);
    filas.push(grupo);
  }
  if (filas.length === 0) filas.push(new Array(BLOQUES_POR_FILA).fill(null));

  return {
    numero,
    anioServicio,
    ultimaFechaCompletado,
    asignaciones,
    filas,
  };
}
