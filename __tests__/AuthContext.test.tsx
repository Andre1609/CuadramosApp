import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState, AppStateStatus } from 'react-native';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { verificarCuenta } from '../src/services/cuentas';
import { cambiarCuentaNotificaciones } from '../src/services/notificaciones';

jest.mock('../src/services/cuentas', () => ({
  registrarCuenta: jest.fn(),
  verificarCuenta: jest.fn(async () => ({
    id: 'ana', nombre: 'Ana', creadoEn: '', salt: '', hash: '',
  })),
}));
jest.mock('../src/services/notificaciones', () => ({
  cambiarCuentaNotificaciones: jest.fn(async () => {}),
}));

let estadoAuth: ReturnType<typeof useAuth>;
let cambiarEstado: ((estado: AppStateStatus) => void) | undefined;

function LeerEstado() {
  estadoAuth = useAuth();
  return null;
}

beforeEach(() => {
  jest.restoreAllMocks();
  cambiarEstado = undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_evento, listener) => {
    cambiarEstado = listener;
    return { remove: jest.fn() };
  });
  jest.mocked(verificarCuenta).mockResolvedValue({
    id: 'ana', nombre: 'Ana', creadoEn: '', salt: '', hash: '',
  });
  jest.mocked(cambiarCuentaNotificaciones).mockResolvedValue(undefined);
});

async function iniciarSesion() {
  let vista!: Renderer.ReactTestRenderer;
  await act(async () => {
    vista = Renderer.create(<AuthProvider><LeerEstado /></AuthProvider>);
  });
  await act(async () => { await estadoAuth.iniciarSesion('ana', 'clave'); });
  return vista;
}

test('conserva la sesión al volver antes de cumplir un minuto', async () => {
  const ahora = jest.spyOn(Date, 'now').mockReturnValue(10_000);
  const vista = await iniciarSesion();

  await act(async () => { cambiarEstado?.('background'); });
  ahora.mockReturnValue(69_999);
  await act(async () => { cambiarEstado?.('active'); });

  expect(estadoAuth.usuario?.id).toBe('ana');
  await act(async () => vista.unmount());
});

test('cierra la sesión al volver cuando ya cumplió un minuto', async () => {
  const ahora = jest.spyOn(Date, 'now').mockReturnValue(10_000);
  const vista = await iniciarSesion();

  await act(async () => { cambiarEstado?.('background'); });
  ahora.mockReturnValue(70_000);
  await act(async () => { cambiarEstado?.('active'); });

  expect(estadoAuth.usuario).toBeNull();
  expect(cambiarCuentaNotificaciones).toHaveBeenLastCalledWith(null);
  await act(async () => vista.unmount());
});