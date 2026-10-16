import { Operacion } from '../types/finanzas';

export function montoACentimos(texto: string): number {
  const normalizado = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
    throw new Error('Ingresa un monto positivo con hasta dos decimales.');
  }
  const centimos = Math.round(Number(normalizado) * 100);
  if (
    !Number.isSafeInteger(centimos) ||
    centimos <= 0 ||
    centimos > 99999999999
  ) {
    throw new Error(
      'El monto debe ser mayor que cero y menor que mil millones.',
    );
  }
  return centimos;
}

export const formatoMonto = (centimos: number) =>
  (centimos / 100).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function resumenMes(operaciones: Operacion[], fecha = new Date()) {
  const delMes = operaciones.filter(op => {
    const dia = new Date(op.fecha);
    return (
      dia.getMonth() === fecha.getMonth() &&
      dia.getFullYear() === fecha.getFullYear()
    );
  });
  const ingresos = delMes
    .filter(op => op.tipo === 'ingreso')
    .reduce((total, op) => total + op.montoCentimos, 0);
  const egresos = delMes
    .filter(op => op.tipo === 'egreso')
    .reduce((total, op) => total + op.montoCentimos, 0);
  const pequenas = delMes.filter(
    op => op.tipo === 'egreso' && op.montoCentimos < 2000,
  );
  return {
    ingresos,
    egresos,
    neto: ingresos - egresos,
    estado: !delMes.length
      ? 'Sin movimientos'
      : ingresos >= egresos
      ? 'Balance positivo'
      : 'Balance negativo',
    porcentaje: ingresos
      ? `${Math.round((egresos / ingresos) * 100)}% de tus ingresos`
      : 'Sin ingresos este mes',
    ahorro: Math.round(Math.max(0, ingresos - egresos) * 0.2),
    gastosHormiga: pequenas.reduce((total, op) => total + op.montoCentimos, 0),
    cantidadHormiga: pequenas.length,
  };
}

export function categoriaConMasGastos(operaciones: Operacion[], fecha = new Date()) {
  const totales = operaciones.reduce<Record<string, number>>((acumulados, operacion) => {
    const dia = new Date(operacion.fecha);
    if (
      operacion.tipo === 'egreso' &&
      dia.getMonth() === fecha.getMonth() &&
      dia.getFullYear() === fecha.getFullYear()
    ) {
      acumulados[operacion.categoria] = (acumulados[operacion.categoria] ?? 0) + operacion.montoCentimos;
    }
    return acumulados;
  }, {});
  const [categoria, montoCentimos] = Object.entries(totales)
    .sort(([, montoA], [, montoB]) => montoB - montoA)[0] ?? [];
  return categoria ? { categoria, montoCentimos } : null;
}

export function movimientoVisual(op: Operacion) {
  const ingreso = op.tipo === 'ingreso';
  const fecha = new Date(op.fecha);
  return {
    id: op.id,
    titulo: op.concepto,
    categoria: op.categoria,
    fechaDia: fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    }),
    fechaAnio: String(fecha.getFullYear()),
    monto: `${ingreso ? '+' : '-'} S/ ${formatoMonto(op.montoCentimos)}`,
    tipo: ingreso ? 'Ingreso' : 'Egreso',
    icono: ingreso ? 'arrow-bottom-left' : 'arrow-top-right',
    colorFondo: ingreso ? '#E6F4EA' : '#FFF0F5',
    colorIcono: ingreso ? '#1E8E3E' : '#C8005B',
    colorMonto: ingreso ? '#1E8E3E' : '#C8005B',
  };
}

const mismoMes = (op: Operacion, fecha: Date) => {
  const dia = new Date(op.fecha);
  return (
    dia.getMonth() === fecha.getMonth() &&
    dia.getFullYear() === fecha.getFullYear()
  );
};

export interface GastoCategoria {
  categoria: string;
  centimos: number;
  porcentaje: number;
}

// Gastos del mes agrupados por categoría 
// y la operación de egreso más grande del mes.
export function gastosPorCategoria(
  operaciones: Operacion[],
  fecha = new Date(),
  maxCategorias = 5,
) {
  const egresos = operaciones.filter(
    op => op.tipo === 'egreso' && mismoMes(op, fecha),
  );
  const total = egresos.reduce((t, op) => t + op.montoCentimos, 0);

  const porCategoria = new Map<string, number>();
  egresos.forEach(op => {
    porCategoria.set(
      op.categoria,
      (porCategoria.get(op.categoria) ?? 0) + op.montoCentimos,
    );
  });

  const conocidas = [...porCategoria.entries()]
    .filter(([categoria]) => categoria !== 'Otros')
    .map(([categoria, centimos]) => ({ categoria, centimos }))
    .sort((a, b) => b.centimos - a.centimos);
  const otros = porCategoria.get('Otros') ?? 0;

  const cabeza =
    conocidas.length + (otros > 0 ? 1 : 0) <= maxCategorias
      ? conocidas
      : conocidas.slice(0, maxCategorias - 1);
  const resto =
    conocidas.slice(cabeza.length).reduce((t, c) => t + c.centimos, 0) + otros;
  const lista =
    resto > 0 ? [...cabeza, { categoria: 'Otros', centimos: resto }] : cabeza;

  const categorias: GastoCategoria[] = lista.map(c => ({
    ...c,
    porcentaje: total > 0 ? (c.centimos / total) * 100 : 0,
  }));

  const mayor = egresos.reduce<Operacion | null>(
    (max, op) => (max === null || op.montoCentimos > max.montoCentimos ? op : max),
    null,
  );

  return { total, categorias, mayor };
}
