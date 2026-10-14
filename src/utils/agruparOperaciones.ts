
import type { Operacion, TipoOperacion } from '../types/finanzas';
import { claveMes } from './fechas';

export type ModoAgrupacion = 'concepto' | 'categoria';

export interface GrupoMovimiento {
  clave: string;
  titulo: string;
  categoria: string;
  tipo: TipoOperacion;
  periodo: string;
  totalCentimos: number;
  movimientos: Operacion[];
  fechaReciente: string;
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function agruparOperaciones(
  operaciones: Operacion[],
  modo: ModoAgrupacion,
): GrupoMovimiento[] {
  const grupos = new Map<string, GrupoMovimiento>();

  for (const op of operaciones) {
    const periodo = claveMes(new Date(op.fecha));

    const clave = JSON.stringify(
      modo === 'concepto'
        ? [
            periodo,
            op.tipo,
            normalizarTexto(op.categoria),
            normalizarTexto(op.concepto),
          ]
        : [
            periodo,
            op.tipo,
            normalizarTexto(op.categoria),
          ],
    );

    let grupo = grupos.get(clave);

    if (!grupo) {
      grupo = {
        clave,
        titulo: modo === 'concepto'
          ? op.concepto.trim()
          : op.categoria,
        categoria: op.categoria,
        tipo: op.tipo,
        periodo,
        totalCentimos: 0,
        movimientos: [],
        fechaReciente: op.fecha,
      };

      grupos.set(clave, grupo);
    }

    grupo.totalCentimos += op.montoCentimos;
    grupo.movimientos.push(op);

    if (Date.parse(op.fecha) > Date.parse(grupo.fechaReciente)) {
      grupo.fechaReciente = op.fecha;
    }
  }

  return [...grupos.values()]
    .map(grupo => ({
      ...grupo,
      movimientos: [...grupo.movimientos].sort(
        (a, b) => Date.parse(b.fecha) - Date.parse(a.fecha),
      ),
    }))
    .sort(
      (a, b) =>
        Date.parse(b.fechaReciente) -
        Date.parse(a.fechaReciente),
    );
}
