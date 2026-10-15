import React from 'react';
import { test, expect, jest, beforeEach } from '@jest/globals';
import Renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text as NativeText, TextInput as NativeTextInput, StyleSheet } from 'react-native';
import { TextoProvider, useTexto } from '../src/context/TextoContext';
import { Text, TextInput } from '../src/components/atoms/Texto';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });

async function montar() {
  let estado: ReturnType<typeof useTexto>;
  function Contenido() {
    estado = useTexto();
    return <><Text style={{ fontSize: 12, lineHeight: 16 }}>Balance</Text><TextInput style={{ fontSize: 14 }} /></>;
  }
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(<TextoProvider><Contenido /></TextoProvider>); });
  return { estado: () => estado!, vista: vista! };
}

test('aplica el tamaño a textos y campos y lo recupera al abrir nuevamente', async () => {
  const primera = await montar();
  expect(StyleSheet.flatten(primera.vista.root.findByType(NativeText).props.style).fontSize).toBe(16);
  await act(async () => { await primera.estado().cambiarTamano('muyGrande'); });
  expect(StyleSheet.flatten(primera.vista.root.findByType(NativeText).props.style).fontSize).toBeCloseTo(22.4);
  expect(StyleSheet.flatten(primera.vista.root.findByType(NativeTextInput).props.style).fontSize).toBeCloseTo(22.4);
  expect(primera.vista.root.findByType(NativeText).props.allowFontScaling).not.toBe(false);
  await act(async () => primera.vista.unmount());
  const segunda = await montar();
  expect(segunda.estado().tamano).toBe('muyGrande');
  await act(async () => segunda.vista.unmount());
});

test('ignora preferencias inválidas y permite recuperarse de un fallo al guardar', async () => {
  await AsyncStorage.setItem('@cuadramos/tamanoTexto', 'invalido');
  const pantalla = await montar();
  expect(pantalla.estado().tamano).toBe('normal');
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Sin espacio'));
  await act(async () => { await pantalla.estado().cambiarTamano('grande'); });
  expect(pantalla.estado().tamano).toBe('normal');
  expect(pantalla.estado().error).toContain('No se pudo guardar');
  await act(async () => { await pantalla.estado().cambiarTamano('grande'); });
  expect(pantalla.estado().tamano).toBe('grande');
  expect(pantalla.estado().error).toBe('');
  await act(async () => pantalla.vista.unmount());
});
