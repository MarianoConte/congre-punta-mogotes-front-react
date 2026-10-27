import dayjs from 'dayjs';
import { calcularCiclos, rangoAnioServicio } from './ciclos';

export const BLOQUES_POR_FILA = 4;

export function formatearFecha(fecha) {
  return fecha ? dayjs(fecha).format('DD/MM/YYYY') : '';
}

export function nombreArchivoS13(datos, extension) {
  const quien = datos.territorios ? 'Todos-los-territorios' : `Territorio-${datos.numero}`;
  return `S-13_${quien}_${datos.anioServicio}.${extension}`;
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

// El S-13 completo: un territorio debajo del otro, ordenados por número. Los que no tienen
// manzanas salen con una línea en blanco para completar a mano.
export function generarDatosS13Todos({ territorios, anioServicio }) {
  const ordenados = [...territorios].sort((a, b) => Number(a.numero) - Number(b.numero));
  return {
    anioServicio,
    territorios: ordenados.map((t) => generarDatosS13({ ...t, anioServicio })),
  };
}

function cabeceraDe(datos) {
  return {
    numero: String(datos.numero),
    ultimaFecha: formatearFecha(datos.ultimaFechaCompletado),
  };
}

// Las líneas de la planilla, agrupadas por territorio. El número y la última fecha van solo
// en la primera línea de cada territorio; las que siguen son la continuación de sus bloques.
export function lineasS13(datos) {
  return (datos.territorios ?? [datos]).map((t) =>
    t.filas.map((bloques, i) => ({ bloques, cabecera: i === 0 ? cabeceraDe(t) : null }))
  );
}

// Reparte las líneas en hojas. Un territorio que no entra en lo que queda de la hoja pasa entero
// a la siguiente; si no entra ni en una hoja sola, al cortarse repite su cabecera arriba.
export function paginarS13(datos, filasPorPagina) {
  const paginas = [[]];
  lineasS13(datos).forEach((lineas, indice) => {
    let pagina = paginas[paginas.length - 1];
    if (pagina.length > 0 && pagina.length + lineas.length > filasPorPagina) {
      pagina = [];
      paginas.push(pagina);
    }
    const cabecera = cabeceraDe((datos.territorios ?? [datos])[indice]);
    lineas.forEach((linea) => {
      if (pagina.length === filasPorPagina) {
        pagina = [];
        paginas.push(pagina);
      }
      pagina.push(pagina.length === 0 ? { ...linea, cabecera } : linea);
    });
  });
  return paginas;
}
