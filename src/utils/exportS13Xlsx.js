import { descargarBlob } from './descargar';
import { formatearFecha, nombreArchivoS13 } from './s13';

const TITULO = 'REGISTRO DE ASIGNACIÓN DE TERRITORIO';
const NOTA_AL_PIE =
  '*Cuando comience una nueva página, anote en esta columna la última fecha en que los territorios se completaron.';

const MIME_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// A: núm. de terr., B: última fecha, C-J: los 4 bloques "Asignado a" (2 columnas cada uno)
const ULTIMA_COLUMNA = 'J';
const BORDE_FINO = { style: 'thin', color: { argb: 'FF000000' } };
const BORDES = {
  top: BORDE_FINO,
  left: BORDE_FINO,
  bottom: BORDE_FINO,
  right: BORDE_FINO,
};
const CENTRADO = { vertical: 'middle', horizontal: 'center', wrapText: true };

function aplicarEstilo(hoja, fila, { negrita = false } = {}) {
  for (let col = 1; col <= 10; col += 1) {
    const celda = hoja.getRow(fila).getCell(col);
    celda.border = BORDES;
    celda.alignment = CENTRADO;
    if (negrita) celda.font = { bold: true, size: 9 };
    else celda.font = { size: 9 };
  }
}

export function construirLibroS13(ExcelJS, datos) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('S-13');

  hoja.getColumn(1).width = 9;
  hoja.getColumn(2).width = 16;
  for (let col = 3; col <= 10; col += 1) hoja.getColumn(col).width = 13;

  // Título y año de servicio
  hoja.mergeCells(`A1:${ULTIMA_COLUMNA}1`);
  hoja.getCell('A1').value = TITULO;
  hoja.getCell('A1').font = { bold: true, size: 14 };
  hoja.getCell('A1').alignment = { horizontal: 'center' };

  hoja.getCell('A2').value = `Año de servicio: ${datos.anioServicio}`;
  hoja.getCell('A2').font = { bold: true, size: 11 };

  // Encabezado en dos filas (4 y 5)
  hoja.mergeCells('A4:A5');
  hoja.getCell('A4').value = 'Núm. de terr.';
  hoja.mergeCells('B4:B5');
  hoja.getCell('B4').value = 'Última fecha en que se completó*';

  for (let bloque = 0; bloque < 4; bloque += 1) {
    const primera = 3 + bloque * 2;
    hoja.mergeCells(4, primera, 4, primera + 1);
    hoja.getRow(4).getCell(primera).value = 'Asignado a';
    hoja.getRow(5).getCell(primera).value = 'Fecha en que se asignó';
    hoja.getRow(5).getCell(primera + 1).value = 'Fecha en que se completó';
  }

  hoja.getRow(4).height = 20;
  hoja.getRow(5).height = 30;
  aplicarEstilo(hoja, 4, { negrita: true });
  aplicarEstilo(hoja, 5, { negrita: true });

  // Cuerpo: cada fila de la planilla ocupa dos filas de hoja
  let fila = 6;
  datos.filas.forEach((bloques, indice) => {
    const filaNombres = fila;
    const filaFechas = fila + 1;

    hoja.mergeCells(filaNombres, 1, filaFechas, 1);
    hoja.mergeCells(filaNombres, 2, filaFechas, 2);
    if (indice === 0) {
      hoja.getRow(filaNombres).getCell(1).value = datos.numero;
      hoja.getRow(filaNombres).getCell(2).value = formatearFecha(
        datos.ultimaFechaCompletado
      );
    }

    bloques.forEach((bloque, i) => {
      const primera = 3 + i * 2;
      hoja.mergeCells(filaNombres, primera, filaNombres, primera + 1);
      hoja.getRow(filaNombres).getCell(primera).value = bloque ? bloque.nombre : '';
      hoja.getRow(filaFechas).getCell(primera).value = formatearFecha(
        bloque?.fechaAsignacion
      );
      hoja.getRow(filaFechas).getCell(primera + 1).value = formatearFecha(
        bloque?.fechaCompletado
      );
    });

    hoja.getRow(filaNombres).height = 18;
    hoja.getRow(filaFechas).height = 18;
    aplicarEstilo(hoja, filaNombres);
    aplicarEstilo(hoja, filaFechas);

    fila += 2;
  });

  hoja.getCell(`A${fila + 1}`).value = NOTA_AL_PIE;
  hoja.getCell(`A${fila + 1}`).font = { size: 8, italic: true };
  hoja.getCell(`A${fila + 2}`).value = 'S-13-S';
  hoja.getCell(`A${fila + 2}`).font = { size: 8 };

  return libro;
}

export async function exportarS13Xlsx(datos) {
  const modulo = await import('exceljs');
  const ExcelJS = modulo.default ?? modulo;

  const libro = construirLibroS13(ExcelJS, datos);

  const buffer = await libro.xlsx.writeBuffer();
  descargarBlob(
    new Blob([buffer], { type: MIME_XLSX }),
    nombreArchivoS13(datos.numero, datos.anioServicio, 'xlsx')
  );
}
