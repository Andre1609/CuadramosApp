import AsyncStorage from '@react-native-async-storage/async-storage';
import { Operacion, cuentas, categoriasPorTipo } from '../types/finanzas';

// espacio de almacenamiento distinto por cada usuario
const claveUsuario = (usuarioId: string) =>
  `@cuadramos/operaciones/${usuarioId}/v1`;

export async function cargarOperaciones(
  usuarioId: string,
): Promise<Operacion[]> {
  const texto = await AsyncStorage.getItem(claveUsuario(usuarioId));
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
  usuarioId: string,
  operaciones: Operacion[],
): Promise<void> {
  await AsyncStorage.setItem(
    claveUsuario(usuarioId),
    JSON.stringify(operaciones),
  );
}