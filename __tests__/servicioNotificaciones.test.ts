import { beforeEach, expect, jest, test } from '@jest/globals';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cambiarCuentaNotificaciones, sincronizarNotificaciones, recordarDestino, consumirDestino, consumirAviso } from '../src/services/notificaciones';
import { preferenciasIniciales } from '../src/utils/notificaciones';
import { Operacion } from '../src/types/finanzas';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    getNotificationSettings: jest.fn(async () => ({ authorizationStatus: 1 })),
    getChannel: jest.fn(async () => ({ blocked: false })),
    createChannel: jest.fn(async () => 'canal'),
    getTriggerNotificationIds: jest.fn(async () => []),
    createTriggerNotification: jest.fn(async () => 'id'),
    cancelAllNotifications: jest.fn(async () => {}),
    cancelTriggerNotification: jest.fn(async () => {}),
    cancelTriggerNotifications: jest.fn(async () => {}),
    cancelDisplayedNotifications: jest.fn(async () => {}),
    displayNotification: jest.fn(async () => 'id'),
  },
  AuthorizationStatus: { AUTHORIZED: 1 }, AndroidImportance: { DEFAULT: 3 },
  AndroidVisibility: { PRIVATE: 0 }, TriggerType: { TIMESTAMP: 0 },
}));
const movimientos: Operacion[] = [
  { id: '1', tipo: 'ingreso', montoCentimos: 10000, cuentaId: 'principal', fecha: new Date().toISOString(), concepto: '', categoria: 'Otros' },
  { id: '2', tipo: 'egreso', montoCentimos: 8000, cuentaId: 'principal', fecha: new Date().toISOString(), concepto: '', categoria: 'Otros' },
];
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); await cambiarCuentaNotificaciones('ana'); });

test('no repite umbrales al sincronizar simultáneamente o reiniciar configuración', async () => {
  const p = { ...preferenciasIniciales, gastos: true };
  await Promise.all([sincronizarNotificaciones('ana', p, movimientos), sincronizarNotificaciones('ana', p, movimientos)]);
  expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
  expect(jest.mocked(notifee.displayNotification).mock.calls[0][0].body).not.toContain('80%');
  await sincronizarNotificaciones('ana', p, [movimientos[0], { ...movimientos[1], montoCentimos: 11000 }]);
  expect(notifee.displayNotification).toHaveBeenCalledTimes(2);
  await sincronizarNotificaciones('ana', p, movimientos);
  expect(notifee.displayNotification).toHaveBeenCalledTimes(2);
});
test('cancelar la sesión impide que tareas antiguas vuelvan a programar avisos', async () => {
  await cambiarCuentaNotificaciones(null);
  await sincronizarNotificaciones('ana', { ...preferenciasIniciales, registro: true }, []);
  expect(notifee.cancelAllNotifications).toHaveBeenCalled();
  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
});
test('un permiso revocado cancela avisos sin consumir los umbrales', async () => {
  jest.mocked(notifee.getNotificationSettings).mockResolvedValueOnce({ authorizationStatus: 0 } as Awaited<ReturnType<typeof notifee.getNotificationSettings>>);
  await sincronizarNotificaciones('ana', { ...preferenciasIniciales, gastos: true }, movimientos);
  expect(notifee.displayNotification).not.toHaveBeenCalled();
  await sincronizarNotificaciones('ana', { ...preferenciasIniciales, gastos: true }, movimientos);
  expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
});
test('limpia una programación incompleta y permite reintentar', async () => {
  jest.mocked(notifee.createTriggerNotification).mockRejectedValueOnce(new Error('Fallo nativo'));
  await expect(sincronizarNotificaciones('ana', { ...preferenciasIniciales, registro: true }, [])).rejects.toThrow('Fallo nativo');
  expect(notifee.cancelTriggerNotifications).toHaveBeenCalled();
  await expect(sincronizarNotificaciones('ana', { ...preferenciasIniciales, registro: true }, [])).resolves.toBeUndefined();
});
test('los enlaces no abren datos de una cuenta diferente', async () => {
  await recordarDestino({ data: { cuenta: 'ana', tipo: 'semanal' } });
  expect(await consumirDestino('otra')).toBeNull();
  await recordarDestino({ data: { cuenta: 'ana', tipo: 'registro' } });
  expect(await consumirDestino('ana')).toBe('registro');
  expect(await consumirDestino('ana')).toBeNull();
});

test('cada aviso discreto identifica su recordatorio y conserva el mensaje al abrirlo', async () => {
  await sincronizarNotificaciones('ana', { ...preferenciasIniciales, registro: true, semanal: true }, []);
  const notificaciones = jest.mocked(notifee.createTriggerNotification).mock.calls.map(c => c[0]);
  const semanal = notificaciones.find(n => n.data?.tipo === 'semanal')!;
  const registro = notificaciones.find(n => n.data?.tipo === 'registro')!;
  expect(semanal.title).toBe('Revisa tu resumen semanal');
  expect(registro.title).toBe('Registra tus movimientos');
  await recordarDestino(semanal);
  expect(await consumirAviso('ana')).toEqual({ tipo: 'semanal', titulo: semanal.title, mensaje: semanal.body });
});
