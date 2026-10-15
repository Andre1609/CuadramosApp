import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { useFinanzas } from './FinanzasContext';
import { PreferenciasNotificaciones, preferenciasIniciales } from '../utils/notificaciones';
import { cargarPreferenciasNotificaciones, guardarPreferenciasNotificaciones, pedirPermisoNotificaciones, permisoNotificaciones, sincronizarNotificaciones } from '../services/notificaciones';

interface Estado {
  preferencias: PreferenciasNotificaciones;
  cargando: boolean;
  guardando: boolean;
  permitido: boolean;
  error: string;
  mensaje: string;
  guardar: (p: PreferenciasNotificaciones) => Promise<boolean>;
  actualizar: () => void;
}
const Contexto = createContext<Estado | null>(null);
export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const { operaciones, cargando: cargandoFinanzas, error: errorFinanzas } = useFinanzas();
  const [preferencias, setPreferencias] = useState(preferenciasIniciales);
  const actuales = useRef(preferenciasIniciales);
  const [cargando, setCargando] = useState(true);
  const [cuentaLeida, setCuentaLeida] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const ocupado = useRef(false);
  const [permitido, setPermitido] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [revision, setRevision] = useState(0);
  const cuenta = usuario?.id ?? null;
  const cuentaActiva = useRef<string | null>(cuenta);
  useLayoutEffect(() => {
    cuentaActiva.current = cuenta;
    return () => { cuentaActiva.current = null; };
  }, [cuenta]);
  useEffect(() => {
    setCuentaLeida(null);
    setCargando(true);
    if (!cuenta) { return; }
    let activo = true;
    cargarPreferenciasNotificaciones(cuenta).then(p => {
      if (activo) { actuales.current = p; setPreferencias(p); setCuentaLeida(cuenta); setCargando(false); }
    }).catch(() => { if (activo) { setError('No se pudieron leer tus preferencias. Selecciona tus opciones y vuelve a guardarlas.'); setCargando(false); } });
    return () => { activo = false; };
  }, [cuenta]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', estado => { if (estado === 'active') { setRevision(v => v + 1); } });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!cuenta || cargando || cuentaLeida !== cuenta || cargandoFinanzas || errorFinanzas) { return; }
    let activo = true;
    const sincronizar = async () => {
      const permiso = await permisoNotificaciones();
      if (!activo || cuentaActiva.current !== cuenta) { return; }
      setPermitido(permiso);
      await sincronizarNotificaciones(cuenta, actuales.current, operaciones);
    };
    sincronizar().catch(() => { if (activo) { setError('No se pudieron programar los avisos. Revisa los permisos e inténtalo nuevamente.'); } });
    return () => { activo = false; };
  }, [cuenta, operaciones, cargando, cuentaLeida, cargandoFinanzas, errorFinanzas, revision]);

  const guardar = async (p: PreferenciasNotificaciones) => {
    if (!cuenta || cuentaActiva.current !== cuenta || ocupado.current || cargando || cargandoFinanzas || errorFinanzas) { return false; }
    ocupado.current = true;
    setGuardando(true); setError(''); setMensaje('');
    try {
      const necesitaPermiso = p.registro || p.semanal || p.gastos;
      const permiso = necesitaPermiso ? await pedirPermisoNotificaciones() : await permisoNotificaciones();
      if (cuentaActiva.current !== cuenta) { return false; }
      setPermitido(permiso);
      if (necesitaPermiso && !permiso) {
        setError('Las notificaciones están bloqueadas. Actívalas en los ajustes del teléfono y vuelve a guardar.');
        return false;
      }
      await guardarPreferenciasNotificaciones(cuenta, p);
      if (cuentaActiva.current === cuenta) {
        actuales.current = p; setPreferencias(p); setCuentaLeida(cuenta);
      }
      await sincronizarNotificaciones(cuenta, p, operaciones);
      if (cuentaActiva.current === cuenta) { setMensaje('Preferencias guardadas.'); }
      return true;
    } catch {
      setError('No se pudo completar la configuración. Revisa los permisos y vuelve a guardar.');
      return false;
    } finally { ocupado.current = false; setGuardando(false); }
  };
  return <Contexto.Provider value={{ preferencias, cargando: !cuenta || cargando || cargandoFinanzas || !!errorFinanzas, guardando, permitido, error, mensaje, guardar, actualizar: () => setRevision(v => v + 1) }}>{children}</Contexto.Provider>;
}
export function useNotificaciones() {
  const estado = useContext(Contexto);
  if (!estado) { throw new Error('Falta NotificacionesProvider.'); }
  return estado;
}
