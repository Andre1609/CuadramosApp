import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from 'react-native';

export const tamanosTexto = { normal: 1, grande: 1.2, muyGrande: 1.4 };
export type TamanoTexto = keyof typeof tamanosTexto;
const clave = '@cuadramos/tamanoTexto';
const TextoContext = createContext({
  tamano: 'normal' as TamanoTexto,
  factor: 1,
  cargando: false,
  guardando: false,
  error: '',
  cambiarTamano: async (_tamano: TamanoTexto) => {},
});

export function TextoProvider({ children }: { children: React.ReactNode }) {
  const [tamano, setTamano] = useState<TamanoTexto>('normal');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const ocupado = useRef(false);
  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(clave).then(valor => {
      if (activo && valor && Object.prototype.hasOwnProperty.call(tamanosTexto, valor)) {
        setTamano(valor as TamanoTexto);
      }
    }).catch(() => {
      if (activo) { setError('No se pudo recuperar el tamaño guardado. Puedes elegirlo nuevamente.'); }
    }).finally(() => { if (activo) { setCargando(false); } });
    return () => { activo = false; };
  }, []);

  const cambiarTamano = async (nuevo: TamanoTexto) => {
    if (cargando || ocupado.current) { return; }
    ocupado.current = true;
    setGuardando(true);
    setError('');
    const anterior = tamano;
    setTamano(nuevo);
    try { await AsyncStorage.setItem(clave, nuevo); }
    catch {
      setTamano(anterior);
      setError('No se pudo guardar el tamaño. Inténtalo nuevamente.');
    } finally {
      ocupado.current = false;
      setGuardando(false);
    }
  };
  return <TextoContext.Provider value={{ tamano, factor: tamanosTexto[tamano], cargando, guardando, error, cambiarTamano }}>{children}</TextoContext.Provider>;
}

export function useTexto() { return useContext(TextoContext); }

export function useLecturaAmplia() {
  const { factor } = useTexto();
  const { fontScale, width } = useWindowDimensions();
  return factor * fontScale >= 1.2 || width < 360;
}
