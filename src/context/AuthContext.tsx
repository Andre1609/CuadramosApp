import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { sesionPausada } from '../services/seguridadSesion';
import { registrarCuenta, verificarCuenta, Cuenta } from '../services/cuentas';
import { cambiarCuentaNotificaciones } from '../services/notificaciones';

interface Usuario {
  id: string;
  nombre: string;
  created_at: string;
}

interface Auth {
  usuario: Usuario | null;
  nombre: string;
  iniciales: string;
  cargando: boolean;
  iniciarSesion: (usuario: string, clave: string) => Promise<void>;
  crearCuenta: (usuario: string, clave: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const aUsuario = (c: Cuenta): Usuario => ({
  id: c.id,
  nombre: c.nombre,
  created_at: c.creadoEn,
});

const Contexto = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const cerrarSesion = useCallback(async () => {
    setUsuario(null);
    await cambiarCuentaNotificaciones(null);
  }, []);

  useEffect(() => {
    let pausaEn: number | null = null;
    const sub = AppState.addEventListener('change', estado => {
      if (estado === 'background') {
        if (usuario && !sesionPausada()) { pausaEn = Date.now(); }
        return;
      }

      if (estado === 'active' && pausaEn !== null) {
        const tiempoFuera = Date.now() - pausaEn;
        pausaEn = null;
        if (tiempoFuera >= 60_000) {
          cerrarSesion().catch(() => setUsuario(null));
        }
      }
    });
    return () => sub.remove();
  }, [cerrarSesion, usuario]);

  const valor = useMemo<Auth>(() => {
    const nombre = usuario?.nombre ?? '';
    return {
      usuario,
      nombre,
      iniciales: nombre.slice(0, 2).toUpperCase(),
      cargando: false,
      iniciarSesion: async (u, clave) => {
        const cuenta = await verificarCuenta(u, clave);
        await cambiarCuentaNotificaciones(cuenta.id);
        setUsuario(aUsuario(cuenta));
      },
      crearCuenta: async (u, clave) => {
        const cuenta = await registrarCuenta(u, clave);
        await cambiarCuentaNotificaciones(cuenta.id);
        setUsuario(aUsuario(cuenta));
      },
      cerrarSesion,
    };
  }, [usuario, cerrarSesion]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const contexto = useContext(Contexto);
  if (!contexto) { throw new Error('Falta AuthProvider.'); }
  return contexto;
}
