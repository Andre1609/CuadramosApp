import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Operacion, cuentas } from '../types/finanzas';
import { prepararReporte } from '../utils/reporte';
import { formatoMonto } from '../utils/finanzas';
import { fechaTexto } from '../utils/fechas';
import { estilosReporte as e } from '../styles/estilosReporte';

export async function generarReportePdf(operaciones: Operacion[], mes: string) {
  const reporte = prepararReporte(operaciones, mes);
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const caracteres = new Set(normal.getCharacterSet());
  // Helvetica incluye tildes y ñ. Símbolos no disponibles se sustituyen,

  const limpiar = (texto: string) =>
    [...texto.normalize('NFC')]
      .map(c =>
        /\s/.test(c) ? ' ' : caracteres.has(c.codePointAt(0)!) ? c : '?',
      )
      .join('');
  let pagina = pdf.addPage([e.ancho, e.alto]);
  let y = e.alto - e.margen;
  const escribir = (
    texto: string,
    x: number,
    altura: number,
    fuerte = false,
    tamano = e.fuente,
  ) => {
    pagina.drawText(limpiar(texto), {
      x,
      y: altura,
      size: tamano,
      font: fuerte ? negrita : normal,
      color: rgb(...e.texto),
    });
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
  function nuevaPagina() {
    pagina = pdf.addPage([e.ancho, e.alto]);
    encabezado();
  }
  function espacio(alto: number) {
    if (y - alto < 65) {
      nuevaPagina();
    }
  }
  function linea(texto: string, fuerte = false) {
    espacio(22);
    escribir(texto, e.margen, y, fuerte, 11);
    y -= 22;
  }
  function envolver(texto: string, ancho: number): string[] {
    const resultado: string[] = [];
    let actual = '';
    for (const caracter of limpiar(texto)) {
      if (
        normal.widthOfTextAtSize(actual + caracter, e.fuente) > ancho &&
        actual
      ) {
        resultado.push(actual);
        actual = '';
      }
      actual += caracter;
    }
    resultado.push(actual);
    return resultado;
  }
  function tablaResumen(titulos: [string, string], filas: [string, string][]) {
    const ancho = e.ancho - e.margen * 2;
    const division = ancho * 0.68;
    function fila(etiqueta: string, importe: string, cabecera = false) {
      const alto = 28;
      pagina.drawRectangle({
        x: e.margen,
        y: y - alto + 10,
        width: ancho,
        height: alto,
        color: cabecera ? rgb(0.96, 0.93, 0.95) : rgb(1, 1, 1),
        borderColor: rgb(0.85, 0.87, 0.9),
        borderWidth: 0.5,
      });
      pagina.drawLine({
        start: { x: e.margen + division, y: y + 10 },
        end: { x: e.margen + division, y: y - alto + 10 },
        color: rgb(0.85, 0.87, 0.9),
        thickness: 0.5,
      });
      escribir(etiqueta, e.margen + 8, y - 7, cabecera);
      const fuente = cabecera ? negrita : normal;
      escribir(
        importe,
        e.ancho -
          e.margen -
          8 -
          fuente.widthOfTextAtSize(limpiar(importe), e.fuente),
        y - 7,
        cabecera,
      );
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

  type DatoGrafico = {
    etiqueta: string;
    monto: number;
    color: readonly [number, number, number];
  };

  function dibujarGraficoBarras(titulo: string, datos: DatoGrafico[]) {
    if (datos.length === 0) return;
    espacio(260);

    escribir(titulo, e.margen, y, true, 11);
    y -= 38;
    const alturaMaxima = 150;
    const baseY = y - alturaMaxima - 12;

    const anchoDisponible = e.ancho - e.margen * 2;
    const separacion = anchoDisponible / datos.length;
    const anchoBarra = Math.min(95, separacion * 0.42);

    const montoMaximo = Math.max(1, ...datos.map(dato => dato.monto));
    pagina.drawLine({
      start: {
        x: e.margen,
        y: baseY,
      },
      end: {
        x: e.ancho - e.margen,
        y: baseY,
      },
      color: rgb(0.82, 0.85, 0.89),
      thickness: 1,
    });
    datos.forEach((dato, indice) => {
      const centroX = e.margen + separacion * (indice + 0.5);

      const xBarra = centroX - anchoBarra / 2;

      const alturaBarra =
        (Math.max(0, dato.monto) / montoMaximo) * alturaMaxima;
      if (alturaBarra > 0) {
        pagina.drawRectangle({
          x: xBarra,
          y: baseY,
          width: anchoBarra,
          height: alturaBarra,
          color: rgb(...dato.color),
        });
      }
      const montoTexto = `S/ ${formatoMonto(dato.monto)}`;

      const anchoMonto = normal.widthOfTextAtSize(
        limpiar(montoTexto),
        e.fuente,
      );

      escribir(
        montoTexto,
        centroX - anchoMonto / 2,
        baseY + alturaBarra + 9,
        true,
      );
      const etiqueta = limpiar(dato.etiqueta);

      const anchoEtiqueta = normal.widthOfTextAtSize(etiqueta, e.fuente);

      escribir(etiqueta, centroX - anchoEtiqueta / 2, baseY - 19);
    });
    y = baseY - 38;
  }

  function dibujarGraficoCircular(titulo: string, datos: DatoGrafico[]) {
    const categorias = datos.filter(d => d.monto > 0);

    const total = categorias.reduce((suma, dato) => suma + dato.monto, 0);

    espacio(250);
    escribir(titulo, e.margen, y, true, 11);
    y -= 28;

    if (total === 0) {
      escribir('No hay egresos registrados.', e.margen, y);
      y -= 35;
      return;
    }

    const centroX = e.margen + 105;
    const centroY = y - 100;
    const radio = 85;

    let anguloActual = -Math.PI / 2;

    for (const dato of categorias) {
      const anguloPorcion = (dato.monto / total) * Math.PI * 2;

      if (categorias.length === 1) {
        pagina.drawCircle({
          x: centroX,
          y: centroY,
          size: radio,
          color: rgb(...dato.color),
        });
      } else {
        const pasos = Math.max(2, Math.ceil(anguloPorcion / (Math.PI / 90)));

        const ruta: string[] = ['M 0 0'];

        for (let i = 0; i <= pasos; i++) {
          const angulo = anguloActual + (anguloPorcion * i) / pasos;

          const x = Math.cos(angulo) * radio;
          const puntoY = Math.sin(angulo) * radio;

          ruta.push(`L ${x.toFixed(3)} ${puntoY.toFixed(3)}`);
        }

        ruta.push('Z');

        pagina.drawSvgPath(ruta.join(' '), {
          x: centroX,
          y: centroY,
          color: rgb(...dato.color),
        });
      }

      anguloActual += anguloPorcion;
    }

    const xLeyenda = e.margen + 215;
    let yLeyenda = y - 28;

    for (const dato of categorias) {
      pagina.drawRectangle({
        x: xLeyenda,
        y: yLeyenda - 2,
        width: 11,
        height: 11,
        color: rgb(...dato.color),
      });

      let etiqueta = limpiar(dato.etiqueta);

      const anchoMaximo = e.ancho - e.margen - xLeyenda - 85;

      while (
        etiqueta.length > 0 &&
        normal.widthOfTextAtSize(etiqueta, e.fuente) > anchoMaximo
      ) {
        etiqueta = etiqueta.slice(0, -1);
      }

      escribir(etiqueta, xLeyenda + 17, yLeyenda);

      const porcentaje = `${((dato.monto / total) * 100).toFixed(1)}%`;

      const anchoPorcentaje = negrita.widthOfTextAtSize(
        limpiar(porcentaje),
        e.fuente,
      );

      escribir(
        porcentaje,
        e.ancho - e.margen - anchoPorcentaje,
        yLeyenda,
        true,
      );

      yLeyenda -= 23;
    }

    y -= 220;
  }

  encabezado();
  linea(`Generado: ${fechaTexto()} ${new Date().toLocaleTimeString('es-PE')}`);
  linea(
    `${reporte.movimientos.length} operaciones | Moneda: soles peruanos (PEN)`,
  );
  linea('RESUMEN DEL PERIODO', true);
  tablaResumen(
    ['Concepto', 'Monto S/'],
    [
      ['Total de ingresos', formatoMonto(reporte.ingresos)],
      ['Total de egresos', formatoMonto(reporte.egresos)],
      ['Resultado (ingresos - egresos)', formatoMonto(reporte.neto)],
    ],
  );
  linea('El resultado no incluye saldos de periodos anteriores.');
  y -= 12;
  linea('GASTOS POR CATEGORÍA', true);
  tablaResumen(
    ['Categoría', 'Total gastado S/'],
    reporte.categorias.length
      ? reporte.categorias.map(([categoria, monto]) => [
          categoria,
          formatoMonto(monto),
        ])
      : [['Sin egresos registrados', formatoMonto(0)]],
  );

  y -= 12;
  espacio(80);
  linea('DETALLE DE OPERACIONES', true);
  function cabeceraTabla() {
    pagina.drawRectangle({
      x: e.margen,
      y: y - 6,
      width: 523,
      height: 23,
      color: rgb(0.96, 0.93, 0.95),
    });
    let x = e.margen;
    [
      'Fecha',
      'Concepto',
      'Cuenta',
      'Categoría',
      'Ingreso S/',
      'Egreso S/',
    ].forEach((titulo, indice) => {
      escribir(titulo, x + 3, y, true);
      x += e.columnas[indice];
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
        const posicion =
          indice >= 4
            ? x +
              e.columnas[indice] -
              4 -
              normal.widthOfTextAtSize(texto, e.fuente)
            : x + 3;
        escribir(texto, posicion, y);
        x += e.columnas[indice];
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

  nuevaPagina();

  linea('ANÁLISIS GRÁFICO FINANCIERO', true);

  if (reporte.movimientos.length === 0) {
    linea('No hay movimientos para graficar.');
  } else {
    dibujarGraficoBarras('Comparación de ingresos y egresos', [
      {
        etiqueta: 'Ingresos',
        monto: reporte.ingresos,
        color: [0.12, 0.55, 0.3],
      },
      {
        etiqueta: 'Egresos',
        monto: reporte.egresos,
        color: e.magenta,
      },
    ]);

    const colores: ReadonlyArray<readonly [number, number, number]> = [
      [0.78, 0.0, 0.36],
      [0.22, 0.49, 0.84],
      [0.16, 0.65, 0.43],
      [0.96, 0.63, 0.18],
      [0.55, 0.36, 0.78],
      [0.55, 0.59, 0.65],
    ];

    const categoriasOrdenadas = [...reporte.categorias]
      .filter(([, monto]) => monto > 0)
      .sort((a, b) => b[1] - a[1]);

    const datosCategorias: DatoGrafico[] = categoriasOrdenadas
      .slice(0, 5)
      .map(([categoria, monto], indice) => ({
        etiqueta: categoria,
        monto,
        color: colores[indice],
      }));

    const montoOtras = categoriasOrdenadas
      .slice(5)
      .reduce((suma, [, monto]) => suma + monto, 0);

    if (montoOtras > 0) {
      datosCategorias.push({
        etiqueta: 'Otras categorías',
        monto: montoOtras,
        color: colores[5],
      });
    }

    dibujarGraficoCircular(
      'Distribución de egresos por categoría',
      datosCategorias,
    );
  }

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
  return {
    base64: await pdf.saveAsBase64(),
    nombre: `CuadramosApp-${mes || 'todos-los-meses'}-${Date.now()}`,
  };
}
