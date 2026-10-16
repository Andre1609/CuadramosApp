import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Operacion, cuentas } from '../types/finanzas';
import { prepararReporte } from '../utils/reporte';
import { formatoMonto } from '../utils/finanzas';
import { fechaTexto } from '../utils/fechas';
import { estilosReporte as e } from '../styles/estilosReporte';

export async function generarReportePdf(operaciones: Operacion[], mes: string, cliente?: string) {
  const reporte = prepararReporte(operaciones, mes);
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const caracteres = new Set(normal.getCharacterSet());
  // Helvetica incluye tildes y ñ. Símbolos no disponibles se sustituyen,
  // evitando que un emoji en el concepto impida exportar todo el reporte.
  const limpiar = (texto: string) => [...texto.normalize('NFC')].map(c =>
    /\s/.test(c) ? ' ' : caracteres.has(c.codePointAt(0)!) ? c : '').join('');
  let pagina = pdf.addPage([e.ancho, e.alto]);
  let y = e.alto - e.margen;
  const escribir = (texto: string, x: number, altura: number, fuerte = false, tamano = e.fuente, color: readonly [number, number, number] = e.texto) => {
    pagina.drawText(limpiar(texto), { x, y: altura, size: tamano, font: fuerte ? negrita : normal, color: rgb(...color) });
  };
  function encabezado() {
    pagina.drawRectangle({
      x: e.margen,
      y: e.alto - 43,
      width: 5,
      height: 18,
      color: rgb(...e.magenta),
    });
    escribir(
      'CuadramosApp | Reporte financiero',
      e.margen + 13,
      e.alto - 39,
      true,
      16,
    );
    escribir(reporte.periodo, e.margen, e.alto - 59, true, 11);
    y = e.alto - 85;
  }
  function nuevaPagina() { pagina = pdf.addPage([e.ancho, e.alto]); encabezado(); }
  function espacio(alto: number) { if (y - alto < 65) { nuevaPagina(); } }
  function linea(texto: string, fuerte = false, color: readonly [number, number, number] = e.texto) { espacio(22); escribir(texto, e.margen, y, fuerte, 11, color); y -= 22; }
  function envolver(texto: string, ancho: number): string[] {
    const medir = (t: string) => normal.widthOfTextAtSize(t, e.fuente);
    const resultado: string[] = [];
    let actual = '';
    for (const palabra of limpiar(texto).split(' ')) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (medir(prueba) <= ancho) { actual = prueba; continue; }
      if (actual) { resultado.push(actual); actual = ''; }
      // palabra más larga que la columna: se corta por letras
      let trozo = '';
      for (const c of palabra) {
        if (medir(trozo + c) > ancho && trozo) { resultado.push(trozo); trozo = ''; }
        trozo += c;
      }
      actual = trozo;
    }
    resultado.push(actual);
    return resultado;
  }
  function tablaResumen(titulos: [string, string], filas: [string, string][]) {
    const ancho = e.ancho - e.margen * 2;
    const division = ancho * 0.68;
    function fila(etiqueta: string, importe: string, cabecera = false) {
      const alto = 28;
      pagina.drawRectangle({ x: e.margen, y: y - alto + 10, width: ancho, height: alto,
        color: cabecera ? rgb(...e.magenta) : rgb(1, 1, 1),
        borderColor: cabecera ? rgb(...e.magenta) : rgb(0.85, 0.87, 0.9), borderWidth: 0.5 });
      pagina.drawLine({ start: { x: e.margen + division, y: y + 10 },
        end: { x: e.margen + division, y: y - alto + 10 }, color: cabecera ? rgb(...e.magenta): rgb(0.85, 0.87, 0.9), thickness: 0.5 });
      escribir(etiqueta, e.margen + 8, y - 7, cabecera, e.fuente, cabecera ? e.blanco : e.texto);
      const fuente = cabecera ? negrita : normal;
      escribir(importe, e.ancho - e.margen - 8 - fuente.widthOfTextAtSize(limpiar(importe), e.fuente), y - 7, cabecera, e.fuente, cabecera ? e.blanco : e.texto);
      y -= alto;
    }
    espacio(60);
    fila(...titulos, true);
    for (const datos of filas) {
      if (y - 28 < 65) {
        nuevaPagina();
        fila(...titulos, true);
      }
      fila(...datos);
    }
    y -= 14;
  }
  encabezado();
  if (cliente) { linea(`Cliente: ${cliente}`, true); }
  linea(`Generado: ${fechaTexto()} ${new Date().toLocaleTimeString('es-PE')}`, true);
  linea(`${reporte.movimientos.length} operaciones | Moneda: soles peruanos (PEN)`);
  linea('RESUMEN DEL PERIODO', true, e.magenta);
  tablaResumen(['Concepto', 'Monto S/'], [
    ['Total de ingresos', formatoMonto(reporte.ingresos)],
    ['Total de egresos', formatoMonto(reporte.egresos)],
    ['Resultado (ingresos - egresos)', formatoMonto(reporte.neto)],
  ]);
  linea('El resultado no incluye saldos de periodos anteriores.');
  y -= 12;
  linea('GASTOS POR CATEGORÍA', true, e.magenta);
  tablaResumen(['Categoría', 'Total gastado S/'], reporte.categorias.length
    ? reporte.categorias.map(([categoria, monto]) => [
      `${categoria}  (${Math.round((monto / reporte.egresos) * 100)}%)`,
      formatoMonto(monto),
    ])
    : [['Sin egresos registrados', formatoMonto(0)]]);
  y -= 12;
  espacio(80);
  linea('DETALLE DE OPERACIONES', true, e.magenta);
  function cabeceraTabla() {
    pagina.drawRectangle({ x: e.margen, y: y - 6, width: 523, height: 23, color: rgb(...e.magenta) });
    let x = e.margen;
    ['Fecha', 'Concepto', 'Cuenta', 'Categoría', 'Ingreso S/', 'Egreso S/'].forEach((titulo, indice) => {
      const posicion = indice >= 4 ? x + e.columnas[indice] - 4 - negrita.widthOfTextAtSize(titulo, e.fuente) : x + 3;
      escribir(titulo, posicion, y, true, e.fuente, e.blanco); x += e.columnas[indice];
    });
    y -= 25;
  }
  cabeceraTabla();
  if (!reporte.movimientos.length) {
    linea('No hay operaciones registradas en este periodo.');
  }
  for (const op of reporte.movimientos) {
    const celdas = [
      fechaTexto(new Date(op.fecha)),
      op.concepto,
      cuentas.find(cuenta => cuenta.id === op.cuentaId)?.nombre ?? op.cuentaId,
      op.categoria,
      op.tipo === 'ingreso' ? formatoMonto(op.montoCentimos) : '-',
      op.tipo === 'egreso' ? formatoMonto(op.montoCentimos) : '-',
    ];
    const lineas = celdas.map((celda, indice) =>
      envolver(celda, e.columnas[indice] - 8),
    );
    const cantidad = Math.max(...lineas.map(celda => celda.length));
    for (let fila = 0; fila < cantidad; fila++) {
      if (y < 80) {
        nuevaPagina();
        cabeceraTabla();
      }
      let x = e.margen;
      lineas.forEach((celda, indice) => {
        const texto = celda[fila] ?? '';
        const posicion = indice >= 4 ? x + e.columnas[indice] - 4 - normal.widthOfTextAtSize(texto, e.fuente) : x + 3;
        const color = indice === 4 && texto !== '-' ? e.verde : indice === 5 && texto !== '-' ? e.magenta : e.texto;
        escribir(texto, posicion, y, false, e.fuente, color); x += e.columnas[indice];
      });
      y -= e.interlineado;
    }
    pagina.drawLine({
      start: { x: e.margen, y: y + 4 },
      end: { x: e.ancho - e.margen, y: y + 4 },
      color: rgb(0.88, 0.9, 0.92),
      thickness: 0.5,
    });
    y -= 9;
  }
  y -= 8;
  linea(
    `TOTALES: Ingresos S/ ${formatoMonto(
      reporte.ingresos,
    )} | Egresos S/ ${formatoMonto(reporte.egresos)}`,
    true,
  );
  const paginas = pdf.getPages();
  paginas.forEach((hoja, indice) => {
    hoja.drawText(
      'Reporte basado en los movimientos registrados en la aplicación.',
      { x: e.margen, y: 35, size: 8, font: normal },
    );
    hoja.drawText(`Página ${indice + 1} de ${paginas.length}`, {
      x: e.margen,
      y: 22,
      size: 8,
      font: normal,
    });
  });
  pdf.setTitle(`CuadramosApp - ${reporte.periodo}`);
  pdf.setCreator('CuadramosApp');
  return { base64: await pdf.saveAsBase64(), nombre: `CuadramosApp-${mes || 'reporte-financiero'}-${Date.now()}` };
}
