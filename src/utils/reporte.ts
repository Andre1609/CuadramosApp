import { Operacion } from '../types/finanzas';
import { claveMes, etiquetaMes } from './fechas';

export function prepararReporte(operaciones: Operacion[], mes: string) {
  const movimientos = operaciones
    .filter(op => !mes || claveMes(new Date(op.fecha)) === mes)
    .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
  let ingresos = 0;
  let egresos = 0;
  const categorias = new Map<string, number>();
  for (const op of movimientos) {
    if (op.tipo === 'ingreso') {
      ingresos += op.montoCentimos;
    } else {
      egresos += op.montoCentimos;
      categorias.set(
        op.categoria,
        (categorias.get(op.categoria) ?? 0) + op.montoCentimos,
      );
    }
  }
  return {
    periodo: mes ? etiquetaMes(mes) : 'Todos los meses',
    movimientos,
    ingresos,
    egresos,
    neto: ingresos - egresos,
    categorias: [...categorias.entries()].sort((a, b) => b[1] - a[1]),
  };
}
