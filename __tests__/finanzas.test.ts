import { categoriaConMasGastos } from '../src/utils/finanzas';
import type { Operacion } from '../src/types/finanzas';

function crearOperacion(
  id: string,
  tipo: Operacion['tipo'],
  categoria: string,
  montoCentimos: number,
  fecha: string,
): Operacion {
  return { id, tipo, categoria, montoCentimos, fecha, cuentaId: 'principal', concepto: id };
}

describe('categoriaConMasGastos', () => {
  it('suma los gastos del mes y omite ingresos y otros meses', () => {
    const periodo = new Date(2026, 9, 15, 12);
    const operaciones = [
      crearOperacion('comida-1', 'egreso', 'Alimentación', 2500, new Date(2026, 9, 2, 12).toISOString()),
      crearOperacion('hogar-1', 'egreso', 'Hogar', 4000, new Date(2026, 9, 3, 12).toISOString()),
      crearOperacion('hogar-2', 'egreso', 'Hogar', 1000, new Date(2026, 9, 4, 12).toISOString()),
      crearOperacion('ingreso', 'ingreso', 'Salario', 90000, new Date(2026, 9, 5, 12).toISOString()),
      crearOperacion('mes-anterior', 'egreso', 'Transporte', 20000, new Date(2026, 8, 15, 12).toISOString()),
    ];

    expect(categoriaConMasGastos(operaciones, periodo)).toEqual({
      categoria: 'Hogar',
      montoCentimos: 5000,
    });
  });

  it('devuelve null si no hay gastos en el mes', () => {
    expect(categoriaConMasGastos([], new Date(2026, 9, 15, 12))).toBeNull();
  });
});