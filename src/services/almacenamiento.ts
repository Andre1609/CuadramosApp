import AsyncStorage from '@react-native-async-storage/async-storage';
import { Operacion, cuentas, categoriasPorTipo } from '../types/finanzas';

// Espacio local provisional. Al integrar el login, usar un espacio por usuario.
const CLAVE = '@cuadramos/operaciones/local/v1';

export async function cargarOperaciones(): Promise<Operacion[]> {
  const texto = await AsyncStorage.getItem(CLAVE);
  if (!texto) { return []; }
  const datos: unknown = JSON.parse(texto);
  if (!Array.isArray(datos) || !datos.every(op =>
    op && typeof op.id === 'string' && typeof op.concepto === 'string' && op.concepto.trim() &&
    (op.tipo === 'ingreso' || op.tipo === 'egreso') &&
    Number.isSafeInteger(op.montoCentimos) && op.montoCentimos > 0 &&
    cuentas.some(cuenta => cuenta.id === op.cuentaId) &&
    categoriasPorTipo[op.tipo as 'ingreso' | 'egreso'].includes(op.categoria) &&
    typeof op.fecha === 'string' && Number.isFinite(Date.parse(op.fecha)),
  )) {
    throw new Error('No se pudieron leer las operaciones guardadas.');
  }
  return datos;
}

export async function guardarOperaciones(operaciones: Operacion[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(operaciones));
}
