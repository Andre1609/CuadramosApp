import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { sesionPausada } from '../services/seguridadSesion';
import { registrarCuenta, verificarCuenta, Cuenta } from '../services/cuentas';

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
const TIEMPO_INICIO = 5 * 60 * 1000; // 5 minutos

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // La sesión vive solo en memoria: si la app se cierra, se pierde
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const salioEn = useRef<number | null>(null);

  const cerrarSesion = useCallback(async () => {
    setUsuario(null);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', estado => {
      if (estado === 'background') {
        salioEn.current = sesionPausada() ? null : Date.now();
      } else if (estado === 'active') {
        const t = salioEn.current;
        salioEn.current = null;
        if (t !== null && Date.now() - t > TIEMPO_INICIO) {
          setUsuario(null);
        }
      }
    });

    return () => sub.remove();
  }, []);

  const valor = useMemo<Auth>(() => {
    const nombre = usuario?.nombre ?? '';
    return {
      usuario,
      nombre,
      iniciales: nombre.slice(0, 2).toUpperCase(),
      cargando: false,
      iniciarSesion: async (u, clave) => {
        setUsuario(aUsuario(await verificarCuenta(u, clave)));
      },
      crearCuenta: async (u, clave) => {
        setUsuario(aUsuario(await registrarCuenta(u, clave)));
      },
      cerrarSesion,
    };
  }, [usuario, cerrarSesion]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('Falta AuthProvider.');
  }
  return contexto;
}