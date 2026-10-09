import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { NuevaOperacion, Operacion, cuentas, categoriasPorTipo } from '../types/finanzas';
import { cargarOperaciones, guardarOperaciones } from '../services/almacenamiento';

interface Finanzas {
  operaciones: Operacion[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  registrar: (datos: NuevaOperacion) => Promise<void>;
  editar: (id: string, datos: NuevaOperacion) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
}
function validarFecha(fecha?: string) {
  if (fecha === undefined) { return; }
  const instante = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (!Number.isFinite(instante.getTime()) || instante.getFullYear() < 1900 || instante > hoy) {
    throw new Error('Selecciona una fecha válida que no sea posterior a hoy.');
  }
}
const ordenar = (lista: Operacion[]) => [...lista].sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
const Contexto = createContext<Finanzas | null>(null);

export function FinanzasProvider({ children }: { children: React.ReactNode }) {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const actuales = useRef<Operacion[]>([]);
  const ocupado = useRef(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function recargar() {
    setCargando(true);
    try {
      actuales.current = ordenar(await cargarOperaciones());
      setOperaciones(actuales.current);
      setError(null);
    } catch {
      setError('No se pudieron cargar tus operaciones. Reintenta para continuar.');
    } finally { setCargando(false); }
  }
  useEffect(() => { void recargar(); }, []);

  async function registrar(datos: NuevaOperacion) {
    validarFecha(datos.fecha);
    if (cargando || error) { throw new Error('Espera a que se carguen tus operaciones.'); }
    if (ocupado.current) { throw new Error('Se está guardando una operación.'); }
    if (!datos.concepto.trim() || !Number.isSafeInteger(datos.montoCentimos) || datos.montoCentimos <= 0 ||
      !cuentas.some(cuenta => cuenta.id === datos.cuentaId) ||
      !categoriasPorTipo[datos.tipo]?.includes(datos.categoria)) {
      throw new Error('Revisa los datos de la operación.');
    }
    ocupado.current = true;
    try {
      const nueva: Operacion = { ...datos, concepto: datos.concepto.trim(), fecha: datos.fecha ?? new Date().toISOString(), id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
      const siguientes = ordenar([nueva, ...actuales.current]);
      await guardarOperaciones(siguientes);
      actuales.current = ordenar(siguientes);
      setOperaciones(actuales.current);
    } finally { ocupado.current = false; }
  }
  async function modificar(id: string, datos?: NuevaOperacion) {
    validarFecha(datos?.fecha);
    if (cargando || error) { throw new Error('Espera a que se carguen tus operaciones.'); }
    if (ocupado.current) { throw new Error('Hay otra operación en proceso.'); }
    if (!actuales.current.some(op => op.id === id)) { throw new Error('La operación ya no existe.'); }
    if (datos && (!datos.concepto.trim() || !Number.isSafeInteger(datos.montoCentimos) ||
      datos.montoCentimos <= 0 || datos.montoCentimos > 99999999999 ||
      !cuentas.some(cuenta => cuenta.id === datos.cuentaId) ||
      !categoriasPorTipo[datos.tipo]?.includes(datos.categoria))) {
      throw new Error('Revisa los datos de la operación.');
    }
    ocupado.current = true;
    try {
      const siguientes = datos
        ? actuales.current.map(op => op.id === id ? { ...op, ...datos, concepto: datos.concepto.trim(), id: op.id, fecha: datos.fecha ?? op.fecha } : op)
        : actuales.current.filter(op => op.id !== id);
      await guardarOperaciones(siguientes);
      actuales.current = ordenar(siguientes);
      setOperaciones(actuales.current);
    } finally { ocupado.current = false; }
  }
  const editar = (id: string, datos: NuevaOperacion) => modificar(id, datos);
  const eliminar = (id: string) => modificar(id);
  return <Contexto.Provider value={{ operaciones, cargando, error, recargar, registrar, editar, eliminar }}>{children}</Contexto.Provider>;
}

export function useFinanzas() {
  const contexto = useContext(Contexto);
  if (!contexto) { throw new Error('Falta FinanzasProvider.'); }
  return contexto;
}
