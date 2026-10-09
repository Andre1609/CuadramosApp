export function indicadorBalance(ingresos: number, egresos: number) {
  const porcentaje = ingresos > 0 ? egresos / ingresos * 100 : null;
  const progreso = porcentaje === null ? (egresos > 0 ? 1 : 0) : Math.min(1, porcentaje / 100);
  if (ingresos === 0 && egresos === 0) {
    return { progreso, porcentaje, color: '#94A3B8', emoji: '—', mensaje: 'Sin movimientos' };
  }
  if (ingresos === 0) {
    return { progreso, porcentaje, color: '#DC2626', emoji: '😟', mensaje: 'Gastos sin ingresos registrados' };
  }
  if (egresos > ingresos) {
    return { progreso, porcentaje, color: '#DC2626', emoji: '😟', mensaje: 'Gastos superiores a ingresos' };
  }
  if (egresos >= ingresos * 0.8) {
    return { progreso, porcentaje, color: '#CA8A04', emoji: '😐', mensaje: 'Cerca de tu límite' };
  }
  return { progreso, porcentaje, color: '#16A34A', emoji: '🙂', mensaje: 'Tienes margen' };
}
