import { Operacion, cuentasFinancieras } from '../types/finanzas';

export const mensajesRecordatorio = {
  registro: { titulo: 'Registra tus movimientos', mensaje: 'Recuerda registrar tus ingresos y gastos de hoy.' },
  semanal: { titulo: 'Revisa tu resumen semanal', mensaje: 'Revisa tus ingresos, gastos y balance de los últimos 7 días.' },
  gastos: { titulo: 'Revisa tu balance', mensaje: 'Tienes un aviso sobre tus gastos del mes. Revisa tu balance.' },
};
export type TipoRecordatorio = keyof typeof mensajesRecordatorio;
export interface AvisoAbierto { tipo: TipoRecordatorio; titulo: string; mensaje: string }

export interface PreferenciasNotificaciones {
  registro: boolean;
  gastos: boolean;
  semanal: boolean;
  hora: string;
  diaSemana: number;
  ocultarDetalles: boolean;
}
export const preferenciasIniciales: PreferenciasNotificaciones = {
  registro: false, gastos: false, semanal: false, hora: '20:00', diaSemana: 0, ocultarDetalles: true,
};
export const horaValida = (hora: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
export const fechaLocal = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
export function leerPreferencias(valor: string | null): PreferenciasNotificaciones {
  if (!valor) { return { ...preferenciasIniciales }; }
  const dato = JSON.parse(valor);
  if (!dato || typeof dato !== 'object') { throw new Error('Preferencias no válidas.'); }
  return {
    registro: dato.registro === true, gastos: dato.gastos === true, semanal: dato.semanal === true,
    hora: typeof dato.hora === 'string' && horaValida(dato.hora) ? dato.hora : '20:00',
    diaSemana: Number.isInteger(dato.diaSemana) && dato.diaSemana >= 0 && dato.diaSemana <= 6 ? dato.diaSemana : 0,
    ocultarDetalles: dato.ocultarDetalles !== false,
  };
}
export function movimientosReales(operaciones: Operacion[]) {
  return operaciones.filter(op => cuentasFinancieras.some(c => c.id === op.cuentaId));
}
export function resumenSemanal(operaciones: Operacion[], ahora = new Date()) {
  const inicio = new Date(ahora);
  inicio.setDate(inicio.getDate() - 6);
  inicio.setHours(0, 0, 0, 0);
  const movimientos = movimientosReales(operaciones).filter(op => {
    const fecha = new Date(op.fecha).getTime();
    return fecha >= inicio.getTime() && fecha <= ahora.getTime();
  });
  const ingresos = movimientos.filter(op => op.tipo === 'ingreso').reduce((s, op) => s + op.montoCentimos, 0);
  const gastos = movimientos.filter(op => op.tipo === 'egreso').reduce((s, op) => s + op.montoCentimos, 0);
  return { inicio, fin: ahora, ingresos, gastos, neto: ingresos - gastos, cantidad: movimientos.length };
}
export function umbralGastos(operaciones: Operacion[], ahora = new Date()): '80' | '100' | null {
  const mes = fechaLocal(ahora).slice(0, 7);
  const movimientos = movimientosReales(operaciones).filter(op => fechaLocal(new Date(op.fecha)).slice(0, 7) === mes && new Date(op.fecha) <= ahora);
  const ingresos = movimientos.filter(op => op.tipo === 'ingreso').reduce((s, op) => s + op.montoCentimos, 0);
  const gastos = movimientos.filter(op => op.tipo === 'egreso').reduce((s, op) => s + op.montoCentimos, 0);
  if (gastos > ingresos) { return '100'; }
  return ingresos > 0 && gastos >= ingresos * 0.8 ? '80' : null;
}
// Ventana de 28 días: evita el límite de avisos pendientes de iOS y permite omitir hoy.
export function planificarAvisos(p: PreferenciasNotificaciones, operaciones: Operacion[], ahora = new Date()) {
  if (!horaValida(p.hora)) { throw new Error('Usa el formato de hora HH:MM, por ejemplo 20:00.'); }
  const [hora, minuto] = p.hora.split(':').map(Number);
  const hoy = fechaLocal(ahora);
  const registroHoy = movimientosReales(operaciones).some(op => fechaLocal(new Date(op.fecha)) === hoy);
  const avisos: { id: string; fecha: number; tipo: 'registro' | 'semanal' }[] = [];
  for (let dia = 0; dia < 28; dia++) {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() + dia);
    fecha.setHours(hora, minuto, 0, 0);
    if (fecha <= ahora) { continue; }
    const clave = fechaLocal(fecha);
    if (p.registro && !(dia === 0 && registroHoy)) { avisos.push({ id: `registro-${clave}`, fecha: fecha.getTime(), tipo: 'registro' }); }
    if (p.semanal && fecha.getDay() === p.diaSemana) {
      // Separa los avisos para que no suenen juntos si ambos están activos.
      if (p.registro) { fecha.setMinutes(fecha.getMinutes() + 5); }
      avisos.push({ id: `semanal-${clave}`, fecha: fecha.getTime(), tipo: 'semanal' });
    }
  }
  return avisos;
}
