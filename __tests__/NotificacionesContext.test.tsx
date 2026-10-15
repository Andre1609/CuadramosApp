import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { NotificacionesProvider, useNotificaciones } from '../src/context/NotificacionesContext';
import { useAuth } from '../src/context/AuthContext';
import { useFinanzas } from '../src/context/FinanzasContext';
import { cargarPreferenciasNotificaciones, guardarPreferenciasNotificaciones, pedirPermisoNotificaciones, sincronizarNotificaciones, cambiarCuentaNotificaciones } from '../src/services/notificaciones';
import { preferenciasIniciales } from '../src/utils/notificaciones';

jest.mock('../src/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../src/context/FinanzasContext', () => ({ useFinanzas: jest.fn() }));
jest.mock('../src/services/notificaciones', () => ({
  cargarPreferenciasNotificaciones: jest.fn(), guardarPreferenciasNotificaciones: jest.fn(async () => {}),
  pedirPermisoNotificaciones: jest.fn(async () => true), permisoNotificaciones: jest.fn(async () => true),
  sincronizarNotificaciones: jest.fn(async () => {}), cambiarCuentaNotificaciones: jest.fn(async () => {}),
}));

function sesion(id: string | null) {
  jest.mocked(useAuth).mockReturnValue({
    usuario: id ? { id, nombre: id, created_at: '' } : null,
    nombre: id || '', iniciales: '', cargando: false,
    iniciarSesion: async () => {}, crearCuenta: async () => {}, cerrarSesion: async () => {},
  });
}
let estado: ReturnType<typeof useNotificaciones>;
function Leer() { estado = useNotificaciones(); return null; }
const contenido = () => <NotificacionesProvider><Leer /></NotificacionesProvider>;
beforeEach(() => {
  jest.clearAllMocks();
  sesion('ana');
  jest.mocked(cargarPreferenciasNotificaciones).mockResolvedValue(preferenciasIniciales);
  jest.mocked(useFinanzas).mockReturnValue({
    operaciones: [], cargando: false, error: null, metaCentimos: 0,
    recargar: async () => {}, registrar: async () => {}, editar: async () => {}, eliminar: async () => {}, guardarMeta: async () => {},
  });
});

test('tolera una sesión vacía y no intenta leer ni guardar una cuenta inexistente', async () => {
  sesion(null);
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(contenido()); });
  expect(cargarPreferenciasNotificaciones).not.toHaveBeenCalled();
  expect(sincronizarNotificaciones).not.toHaveBeenCalled();
  await act(async () => { expect(await estado.guardar(preferenciasIniciales)).toBe(false); });
  expect(guardarPreferenciasNotificaciones).not.toHaveBeenCalled();
  await act(async () => vista!.unmount());
});

test('perder la sesión después de programar no rompe el render ni cancela recordatorios', async () => {
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(contenido()); });
  await act(async () => { await estado.guardar({ ...preferenciasIniciales, registro: true }); });
  expect(sincronizarNotificaciones).toHaveBeenCalledWith('ana', expect.objectContaining({ registro: true }), []);
  const sincronizaciones = jest.mocked(sincronizarNotificaciones).mock.calls.length;
  sesion(null);
  await act(async () => vista!.update(contenido()));
  expect(estado.cargando).toBe(true);
  expect(sincronizarNotificaciones).toHaveBeenCalledTimes(sincronizaciones);
  expect(cambiarCuentaNotificaciones).not.toHaveBeenCalled();
  await act(async () => vista!.unmount());
});

test('no guarda preferencias si la sesión desaparece mientras espera el permiso', async () => {
  let resolver!: (permiso: boolean) => void;
  jest.mocked(pedirPermisoNotificaciones).mockReturnValueOnce(new Promise<boolean>(resolve => { resolver = resolve; }));
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(contenido()); });
  let pendiente!: Promise<boolean>;
  act(() => { pendiente = estado.guardar({ ...preferenciasIniciales, registro: true }); });
  sesion(null);
  await act(async () => vista!.update(contenido()));
  await act(async () => { resolver(true); expect(await pendiente).toBe(false); });
  expect(guardarPreferenciasNotificaciones).not.toHaveBeenCalled();
  await act(async () => vista!.unmount());
});
