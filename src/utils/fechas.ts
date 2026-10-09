export const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function fechaTexto(fecha = new Date()): string {
  return `${String(fecha.getDate()).padStart(2, '0')}/${String(
    fecha.getMonth() + 1,
  ).padStart(2, '0')}/${fecha.getFullYear()}`;
}

export function fechaDesdeTexto(texto: string): string {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) {
    throw new Error('Escribe la fecha en formato DD/MM/AAAA.');
  }
  const [, dia, mes, anio] = partes.map(Number);
  const fecha = new Date(anio, mes - 1, dia, 12);
  if (
    anio < 1900 ||
    anio > 9999 ||
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    throw new Error('La fecha no existe. Revisa el día, mes y año.');
  }
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (fecha > hoy) {
    throw new Error('La fecha no puede ser posterior a hoy.');
  }
  return fecha.toISOString();
}

export function claveMes(fecha = new Date()): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
    2,
    '0',
  )}`;
}

export function inicioMes(clave: string): Date {
  const [anio, mes] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, 1, 12);
}

export function etiquetaMes(clave: string): string {
  const fecha = inicioMes(clave);
  return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
