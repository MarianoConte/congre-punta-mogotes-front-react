import dayjs from 'dayjs';

// Un "ciclo" es el recorrido completo de un territorio: arranca con la primera salida
// que trabaja alguna manzana y se cierra cuando entre todas las salidas se cubrieron
// todas las manzanas del territorio.

function ordenarPorFecha(salidas) {
  return [...(salidas ?? [])].sort(
    (a, b) => new Date(a.attributes.Fecha) - new Date(b.attributes.Fecha)
  );
}

export function calcularCiclos(salidas, manzanas) {
  if (!manzanas || manzanas.length === 0) return [];

  const salidasOrdenadas = ordenarPorFecha(salidas);
  const ciclos = [];

  let cubiertas = new Set();
  let salidaInicial = null;

  for (const salida of salidasOrdenadas) {
    const manzanasSalida = salida.attributes.Manzanas ?? [];
    if (!salidaInicial && manzanasSalida.length > 0) salidaInicial = salida;
    manzanasSalida.forEach((m) => cubiertas.add(m));

    const todasCubiertas = manzanas.every((m) => cubiertas.has(m));
    if (todasCubiertas) {
      ciclos.push({
        fechaAsignacion: salidaInicial.attributes.Fecha,
        conductorAsignacion: salidaInicial.attributes.Conductor ?? null,
        fechaCompletado: salida.attributes.Fecha,
        conductorCompletado: salida.attributes.Conductor ?? null,
        completo: true,
        manzanasPendientes: [],
      });
      cubiertas = new Set();
      salidaInicial = null;
    }
  }

  // Ciclo abierto al final: se asignó pero todavía no se completó.
  if (salidaInicial) {
    ciclos.push({
      fechaAsignacion: salidaInicial.attributes.Fecha,
      conductorAsignacion: salidaInicial.attributes.Conductor ?? null,
      fechaCompletado: null,
      conductorCompletado: null,
      completo: false,
      manzanasPendientes: manzanas.filter((m) => !cubiertas.has(m)),
    });
  }

  return ciclos;
}

export function calcularEstadoTerritorio(salidas, manzanas) {
  if (!manzanas || manzanas.length === 0) return null;

  const ciclos = calcularCiclos(salidas, manzanas);
  const salidasOrdenadas = ordenarPorFecha(salidas);
  const ultimaSalida = salidasOrdenadas[salidasOrdenadas.length - 1];

  const diasDesdeUltima = ultimaSalida
    ? dayjs().diff(dayjs(ultimaSalida.attributes.Fecha), 'day')
    : null;
  const conductorUltima = ultimaSalida?.attributes?.Conductor ?? '-';

  const ultimo = ciclos[ciclos.length - 1] ?? null;
  const cicloAbierto = ultimo && !ultimo.completo ? ultimo : null;
  const ciclosCompletos = ciclos.filter((c) => c.completo);
  const ultimoCompleto = ciclosCompletos[ciclosCompletos.length - 1] ?? null;

  const completo = !cicloAbierto && ultimoCompleto !== null;

  return {
    fechaFinalizacion: ultimoCompleto?.fechaCompletado ?? null,
    conductor: completo
      ? ultimoCompleto.conductorCompletado ?? conductorUltima
      : conductorUltima,
    diasDesdeUltima,
    estado: completo ? 'Completo' : 'Incompleto',
    manzanasPendientes: completo
      ? []
      : cicloAbierto
      ? cicloAbierto.manzanasPendientes
      : [...manzanas],
  };
}

// El año de servicio va del 1 de septiembre al 31 de agosto y se nombra por el año
// en que termina: el que va de sep/2025 a ago/2026 es el año de servicio 2026.
export function getAnioDeServicio(fecha) {
  const d = dayjs(fecha);
  return d.month() >= 8 ? d.year() + 1 : d.year();
}

export function rangoAnioServicio(anio) {
  return {
    desde: dayjs(`${anio - 1}-09-01`).startOf('day'),
    hasta: dayjs(`${anio}-08-31`).endOf('day'),
  };
}
