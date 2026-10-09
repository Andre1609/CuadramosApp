import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_META = '@cuadramos/meta/local/v1';
export async function cargarMeta(): Promise<number | null> {
  const valor = await AsyncStorage.getItem(CLAVE_META);
  if (valor === null) {
    return null;
  }
  const monto = Number(valor);
  if (!Number.isSafeInteger(monto) || monto < 0) {
    throw new Error('Meta guardada inválida.');
  }
  return monto;
}
export async function guardarMetaLocal(monto: number) {
  await AsyncStorage.setItem(CLAVE_META, String(monto));
}
import { Operacion, cuentas, categoriasPorTipo } from '../types/finanzas';

// Espacio local provisional. Al integrar el login, usar un espacio por usuario.
const CLAVE = '@cuadramos/operaciones/local/v1';

export async function cargarOperaciones(): Promise<Operacion[]> {
  const texto = await AsyncStorage.getItem(CLAVE);
  if (!texto) {
    return [];
  }
  const datos: unknown = JSON.parse(texto);
  if (
    !Array.isArray(datos) ||
    !datos.every(
      op =>
        op &&
        typeof op.id === 'string' &&
        typeof op.concepto === 'string' &&
        op.concepto.trim() &&
        (op.tipo === 'ingreso' || op.tipo === 'egreso') &&
        Number.isSafeInteger(op.montoCentimos) &&
        op.montoCentimos > 0 &&
        cuentas.some(cuenta => cuenta.id === op.cuentaId) &&
        categoriasPorTipo[op.tipo as 'ingreso' | 'egreso'].includes(
          op.categoria,
        ) &&
        typeof op.fecha === 'string' &&
        Number.isFinite(Date.parse(op.fecha)),
    )
  ) {
    throw new Error('No se pudieron leer las operaciones guardadas.');
  }
  return datos;
}

export async function guardarOperaciones(
  operaciones: Operacion[],
): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(operaciones));
}
