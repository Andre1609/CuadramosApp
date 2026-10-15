import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidVisibility, AuthorizationStatus, Notification, TriggerType } from '@notifee/react-native';
import { Operacion } from '../types/finanzas';
import { fechaLocal, leerPreferencias, planificarAvisos, PreferenciasNotificaciones, umbralGastos } from '../utils/notificaciones';
import { sinCierreAutomatico } from './seguridadSesion';
import { AvisoAbierto, mensajesRecordatorio, TipoRecordatorio } from '../utils/notificaciones';

const propietario = '@cuadramos/avisos/cuenta';
const canal = 'cuadramos-recordatorios';
const clavePreferencias = (id: string) => `@cuadramos/avisos/preferencias/${id}`;
let cola: Promise<unknown> = Promise.resolve();
const oyentes = new Set<() => void>();
export function alRecibirDestino(oyente: () => void) {
  oyentes.add(oyente);
  return () => { oyentes.delete(oyente); };
}
function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const resultado = cola.then(tarea);
  cola = resultado.catch(() => undefined);
  return resultado;
}
export const cargarPreferenciasNotificaciones = async (id: string) => leerPreferencias(await AsyncStorage.getItem(clavePreferencias(id)));
export const guardarPreferenciasNotificaciones = (id: string, p: PreferenciasNotificaciones) => AsyncStorage.setItem(clavePreferencias(id), JSON.stringify(p));
export async function permisoNotificaciones() {
  const estado = await notifee.getNotificationSettings();
  const canalActual = Platform.OS === 'android' ? await notifee.getChannel(canal) : null;
  return estado.authorizationStatus >= AuthorizationStatus.AUTHORIZED && !canalActual?.blocked;
}
export async function pedirPermisoNotificaciones() {
  const estado = await sinCierreAutomatico(() => notifee.requestPermission());
  return estado.authorizationStatus >= AuthorizationStatus.AUTHORIZED && await permisoNotificaciones();
}
export const abrirAjustesNotificaciones = () => sinCierreAutomatico(() => notifee.openNotificationSettings());

// La sesión automática puede expirar sin borrar recordatorios. El cierre manual sí los cancela.
export function cambiarCuentaNotificaciones(id: string | null) {
  return enCola(async () => {
    const anterior = await AsyncStorage.getItem(propietario);
    if (anterior !== id || id === null) {
      await notifee.cancelAllNotifications();
      await AsyncStorage.removeItem('@cuadramos/avisos/destino');
    }
    if (id) { await AsyncStorage.setItem(propietario, id); }
    else { await AsyncStorage.removeItem(propietario); }
  });
}
function aviso(id: string, tipo: TipoRecordatorio, cuenta: string, ocultar: boolean, cuerpo: string): Notification {
  const texto = mensajesRecordatorio[tipo];
  return {
    id, title: texto.titulo, body: ocultar ? texto.mensaje : cuerpo,
    data: { tipo, cuenta },
    android: { channelId: canal, smallIcon: 'ic_notificacion', color: '#C8005B', pressAction: { id: 'default' }, visibility: AndroidVisibility.PRIVATE },
    ios: { sound: 'default' },
  };
}
export function sincronizarNotificaciones(cuenta: string, p: PreferenciasNotificaciones, operaciones: Operacion[]) {
  return enCola(async () => {
    if (await AsyncStorage.getItem(propietario) !== cuenta) { return; }
    if (!await permisoNotificaciones()) { await notifee.cancelAllNotifications(); return; }
    await notifee.createChannel({ id: canal, name: 'Recordatorios y balance', importance: AndroidImportance.DEFAULT });
    const ahora = new Date();
    const plan = planificarAvisos(p, operaciones, ahora);
    const ids = new Set(plan.map(a => a.id));
    for (const id of await notifee.getTriggerNotificationIds()) {
      if (!ids.has(id)) { await notifee.cancelTriggerNotification(id); }
    }
    try {
      for (const item of plan) {
        await notifee.createTriggerNotification(aviso(item.id, item.tipo, cuenta, p.ocultarDetalles,
          item.tipo === 'registro' ? '¿Tuviste ingresos o gastos hoy? Regístralos para mantener tu balance actualizado.' : 'Revisa tu resumen de los últimos 7 días: ingresos, gastos y balance.'),
        { type: TriggerType.TIMESTAMP, timestamp: item.fecha, alarmManager: false });
      }
    } catch (error) {
      await notifee.cancelTriggerNotifications();
      throw error;
    }
    if (!p.gastos) { await notifee.cancelDisplayedNotifications(); return; }
    const umbral = umbralGastos(operaciones, ahora);
    if (!umbral) { return; }
    const mes = fechaLocal(ahora).slice(0, 7);
    const clave = `@cuadramos/avisos/umbrales/${cuenta}/${mes}`;
    const enviados: string[] = JSON.parse(await AsyncStorage.getItem(clave) || '[]');
    if (enviados.includes(umbral)) { return; }
    // Reserva antes de mostrar: impide avisos repetidos si se cierra la app durante el envío.
    const nuevos = Array.from(new Set([...enviados, ...(umbral === '100' ? ['80', '100'] : ['80'])]));
    await AsyncStorage.setItem(clave, JSON.stringify(nuevos));
    try {
      await notifee.displayNotification(aviso(`gastos-${mes}-${umbral}`, 'gastos', cuenta, p.ocultarDetalles,
        umbral === '100' ? 'Este mes registraste más gastos que ingresos. Revisa tu balance.' : 'Tus gastos alcanzaron el 80% de tus ingresos registrados del mes. Revisa tu balance.'));
    } catch (error) {
      await AsyncStorage.setItem(clave, JSON.stringify(enviados));
      throw error;
    }
  });
}

export async function recordarDestino(notificacion?: Notification) {
  const tipo = notificacion?.data?.tipo;
  const cuenta = notificacion?.data?.cuenta;
  if (typeof cuenta === 'string' && ['registro', 'semanal', 'gastos'].includes(String(tipo))) {
    await AsyncStorage.setItem('@cuadramos/avisos/destino', JSON.stringify({ tipo, cuenta, titulo: notificacion?.title, mensaje: notificacion?.body }));
    oyentes.forEach(oyente => oyente());
  }
}
export async function consumirAviso(cuenta: string): Promise<AvisoAbierto | null> {
  const dato = await AsyncStorage.getItem('@cuadramos/avisos/destino');
  if (!dato) { return null; }
  await AsyncStorage.removeItem('@cuadramos/avisos/destino');
  const destino = JSON.parse(dato);
  if (destino.cuenta !== cuenta || !Object.prototype.hasOwnProperty.call(mensajesRecordatorio, destino.tipo)) { return null; }
  const tipo = destino.tipo as TipoRecordatorio;
  const texto = mensajesRecordatorio[tipo];
  return {
    tipo,
    titulo: destino.titulo && destino.titulo !== 'Cuadramos' ? destino.titulo : texto.titulo,
    mensaje: destino.mensaje && !destino.mensaje.startsWith('Tienes un recordatorio.') ? destino.mensaje : texto.mensaje,
  };
}
export async function consumirDestino(cuenta: string): Promise<string | null> {
  return (await consumirAviso(cuenta))?.tipo ?? null;
}
