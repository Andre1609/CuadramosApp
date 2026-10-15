import { describe, expect, test } from '@jest/globals';
import { fechaLocal, horaValida, leerPreferencias, planificarAvisos, preferenciasIniciales, resumenSemanal, umbralGastos } from '../src/utils/notificaciones';
import { Operacion } from '../src/types/finanzas';

const ahora = new Date(2026, 9, 14, 12, 0);
const op = (tipo: 'ingreso' | 'egreso', montoCentimos: number, fecha = ahora, cuentaId = 'principal'): Operacion => ({ id: Math.random().toString(), tipo, montoCentimos, fecha: fecha.toISOString(), cuentaId, concepto: 'Prueba', categoria: 'Otros' });

describe('planificación local', () => {
  test('empieza desactivada y valida la hora', () => {
    expect(planificarAvisos(preferenciasIniciales, [], ahora)).toEqual([]);
    expect(horaValida('23:59')).toBe(true);
    expect(horaValida('24:00')).toBe(false);
    expect(horaValida('8:70')).toBe(false);
    expect(leerPreferencias(null)).toEqual(preferenciasIniciales);
    expect(leerPreferencias('{"hora":"99:00","diaSemana":9}').hora).toBe('20:00');
  });
  test('omite hoy si hay movimientos y renueva sin superar el límite de avisos', () => {
    const p = { ...preferenciasIniciales, registro: true, semanal: true, diaSemana: 3 };
    const plan = planificarAvisos(p, [op('egreso', 100)], ahora);
    expect(plan.some(a => a.id === `registro-${fechaLocal(ahora)}`)).toBe(false);
    expect(plan.filter(a => a.tipo === 'registro')).toHaveLength(27);
    expect(plan.filter(a => a.tipo === 'semanal')).toHaveLength(4);
    expect(plan.every(a => a.fecha > ahora.getTime())).toBe(true);
    expect(new Set(plan.map(a => a.id)).size).toBe(plan.length);
    const resumenHoy = plan.find(a => a.id === `semanal-${fechaLocal(ahora)}`)!;
    expect(new Date(resumenHoy.fecha).getMinutes()).toBe(5);
  });
  test('no programa en el pasado ni omite hoy por un movimiento antiguo', () => {
    const antes = new Date(2026, 9, 13, 10);
    const p = { ...preferenciasIniciales, registro: true };
    expect(planificarAvisos(p, [op('ingreso', 100, antes)], ahora)[0].id).toBe('registro-2026-10-14');
    expect(planificarAvisos(p, [], new Date(2026, 9, 14, 22))[0].id).toBe('registro-2026-10-15');
  });
});
describe('umbrales y resumen', () => {
  test('distingue 80%, 100% y déficit sin ingresos', () => {
    expect(umbralGastos([], ahora)).toBeNull();
    expect(umbralGastos([op('ingreso', 10000), op('egreso', 7999)], ahora)).toBeNull();
    expect(umbralGastos([op('ingreso', 10000), op('egreso', 8000)], ahora)).toBe('80');
    expect(umbralGastos([op('ingreso', 10000), op('egreso', 10000)], ahora)).toBe('80');
    expect(umbralGastos([op('ingreso', 10000), op('egreso', 10001)], ahora)).toBe('100');
    expect(umbralGastos([op('egreso', 1)], ahora)).toBe('100');
    expect(umbralGastos([op('egreso', 5000, new Date(2026, 8, 1))], ahora)).toBeNull();
  });
  test('incluye siete días naturales, excluye metas y datos futuros', () => {
    const r = resumenSemanal([
      op('ingreso', 10000, new Date(2026, 9, 8)), op('egreso', 2000),
      op('ingreso', 99999, new Date(2026, 9, 7)), op('egreso', 50000, new Date(2026, 9, 15)),
      op('ingreso', 99999, ahora, 'metas'),
    ], ahora);
    expect(r.ingresos).toBe(10000); expect(r.gastos).toBe(2000);
    expect(r.neto).toBe(8000); expect(r.cantidad).toBe(2);
  });
});
