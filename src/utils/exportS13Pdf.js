import plantillaUrl from '../assets/s13-plantilla.pdf?url';
import { descargarBlob } from './descargar';
import { formatearFecha, nombreArchivoS13 } from './s13';

// El PDF se genera escribiendo sobre el formulario oficial S-13-S, así que la planilla
// sale idéntica al original. Las coordenadas de abajo están medidas sobre su grilla
// (A4, 595.3 x 842 pt, origen abajo a la izquierda).

// Los 11 bordes verticales: núm. de terr., última fecha y las 8 subcolumnas de fecha.
const COLUMNAS = [
  35.94, 71.42, 135.2, 188.69, 241.97, 295.39, 348.79, 402.1, 455.5, 508.92, 562.26,
];
const TOPE_TABLA = 696.34;
const ALTO_FILA = 31.32;
const FILAS_POR_PAGINA = 20;

// La raya del "Año de servicio" va de x=134.5 a x=190.2 sobre la línea base y=744.7.
const ANIO_X = 145;
const ANIO_Y = 747.5;
const ANIO_TAMANIO = 11;

const TAMANIO_TEXTO = 8;
const TAMANIO_MINIMO = 5;
const MARGEN_CELDA = 3;

function anchoBloque(indice) {
  return {
    izquierda: COLUMNAS[2 + indice * 2],
    medio: COLUMNAS[3 + indice * 2],
    derecha: COLUMNAS[4 + indice * 2],
  };
}

// Achica el texto si no entra en la celda, en vez de desbordarla.
function tamanioQueEntra(fuente, texto, ancho) {
  let tamanio = TAMANIO_TEXTO;
  while (
    tamanio > TAMANIO_MINIMO &&
    fuente.widthOfTextAtSize(texto, tamanio) > ancho - MARGEN_CELDA * 2
  ) {
    tamanio -= 0.5;
  }
  return tamanio;
}

function escribirCentrado(pagina, fuente, texto, izquierda, derecha, y) {
  if (!texto) return;
  const tamanio = tamanioQueEntra(fuente, texto, derecha - izquierda);
  const ancho = fuente.widthOfTextAtSize(texto, tamanio);
  pagina.drawText(texto, {
    x: (izquierda + derecha) / 2 - ancho / 2,
    y,
    size: tamanio,
    font: fuente,
  });
}

function escribirFila(pagina, fuente, indiceEnPagina, bloques, cabecera) {
  const tope = TOPE_TABLA - indiceEnPagina * ALTO_FILA;
  const fondo = tope - ALTO_FILA;
  const medio = (tope + fondo) / 2;

  // "Núm. de terr." y "Última fecha" ocupan las dos sub-filas: van centradas.
  if (cabecera) {
    escribirCentrado(pagina, fuente, cabecera.numero, COLUMNAS[0], COLUMNAS[1], medio - 3);
    escribirCentrado(pagina, fuente, cabecera.ultimaFecha, COLUMNAS[1], COLUMNAS[2], medio - 3);
  }

  // Sub-fila de arriba: el nombre, a lo ancho del bloque. Abajo: las dos fechas.
  bloques.forEach((bloque, i) => {
    if (!bloque) return;
    const { izquierda, medio: divisor, derecha } = anchoBloque(i);
    escribirCentrado(pagina, fuente, bloque.nombre, izquierda, derecha, medio + 5);
    escribirCentrado(
      pagina,
      fuente,
      formatearFecha(bloque.fechaAsignacion),
      izquierda,
      divisor,
      fondo + 5
    );
    escribirCentrado(
      pagina,
      fuente,
      formatearFecha(bloque.fechaCompletado),
      divisor,
      derecha,
      fondo + 5
    );
  });
}

export async function construirPdfS13(PDFDocument, StandardFonts, plantillaBytes, datos) {
  const doc = await PDFDocument.load(plantillaBytes);
  const fuente = await doc.embedFont(StandardFonts.Helvetica);

  // Una hoja de la plantilla entra 20 filas; si hicieran falta más, se agregan hojas.
  const paginasNecesarias = Math.max(1, Math.ceil(datos.filas.length / FILAS_POR_PAGINA));
  for (let i = 1; i < paginasNecesarias; i += 1) {
    const [copia] = await doc.copyPages(doc, [0]);
    doc.addPage(copia);
  }

  doc.getPages().forEach((pagina) => {
    pagina.drawText(String(datos.anioServicio), {
      x: ANIO_X,
      y: ANIO_Y,
      size: ANIO_TAMANIO,
      font: fuente,
    });
  });

  datos.filas.forEach((bloques, indice) => {
    const pagina = doc.getPage(Math.floor(indice / FILAS_POR_PAGINA));
    const indiceEnPagina = indice % FILAS_POR_PAGINA;
    // El número y la última fecha se escriben una sola vez por hoja, en su primera fila.
    const cabecera =
      indiceEnPagina === 0
        ? {
            numero: String(datos.numero),
            ultimaFecha: formatearFecha(datos.ultimaFechaCompletado),
          }
        : null;
    escribirFila(pagina, fuente, indiceEnPagina, bloques, cabecera);
  });

  return doc.save();
}

export async function exportarS13Pdf(datos) {
  const [{ PDFDocument, StandardFonts }, plantilla] = await Promise.all([
    import('pdf-lib'),
    fetch(plantillaUrl).then((r) => r.arrayBuffer()),
  ]);

  const bytes = await construirPdfS13(PDFDocument, StandardFonts, plantilla, datos);
  descargarBlob(
    new Blob([bytes], { type: 'application/pdf' }),
    nombreArchivoS13(datos.numero, datos.anioServicio, 'pdf')
  );
}
