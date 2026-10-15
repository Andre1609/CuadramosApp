import React from 'react';
import { test, expect, jest, beforeEach } from '@jest/globals';
import Renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import MetaAhorro from '../src/components/MetaAhorro';
import { TextInput } from '../src/components/atoms/Texto';
import { useFinanzas } from '../src/context/FinanzasContext';

jest.mock('../src/context/FinanzasContext', () => ({ useFinanzas: jest.fn() }));
jest.mock('../src/components/ModalSeguro', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const guardarMeta = jest.fn<(monto: number) => Promise<void>>();
const cerrar = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  guardarMeta.mockResolvedValue(undefined);
  jest.mocked(useFinanzas).mockReturnValue({
    metaCentimos: 100000, guardarMeta, cargando: false, error: null, operaciones: [],
    recargar: async () => {}, registrar: async () => {}, editar: async () => {}, eliminar: async () => {},
  });
});

test('permite editar la meta, valida el monto y solo cierra después de guardar', async () => {
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(<MetaAhorro cerrar={cerrar} />); });
  const entrada = () => vista!.root.findByType(TextInput);
  const guardar = () => vista!.root.findAllByType(TouchableOpacity).find(b => b.props.accessibilityState !== undefined)!;
  expect(entrada().props.value).toBe('1000.00');
  await act(async () => entrada().props.onChangeText('0'));
  await act(async () => guardar().props.onPress());
  expect(guardarMeta).not.toHaveBeenCalled();
  expect(cerrar).not.toHaveBeenCalled();
  await act(async () => entrada().props.onChangeText('1500,50'));
  await act(async () => guardar().props.onPress());
  expect(guardarMeta).toHaveBeenCalledWith(150050);
  expect(cerrar).toHaveBeenCalledTimes(1);
  await act(async () => vista!.unmount());
});

test('conserva la edición cuando falla el guardado y permite reintentar', async () => {
  guardarMeta.mockRejectedValueOnce(new Error('No se pudo guardar'));
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(<MetaAhorro cerrar={cerrar} />); });
  const guardar = () => vista!.root.findAllByType(TouchableOpacity).find(b => b.props.accessibilityState !== undefined)!;
  await act(async () => guardar().props.onPress());
  expect(cerrar).not.toHaveBeenCalled();
  expect(vista!.root.findByType(TextInput).props.value).toBe('1000.00');
  expect(guardar().props.disabled).toBe(false);
  await act(async () => guardar().props.onPress());
  expect(cerrar).toHaveBeenCalledTimes(1);
  await act(async () => vista!.unmount());
});
