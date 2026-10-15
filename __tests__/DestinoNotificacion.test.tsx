import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { expect, jest, test, beforeEach } from '@jest/globals';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { consumirAviso } from '../src/services/notificaciones';
import { mensajesRecordatorio, TipoRecordatorio } from '../src/utils/notificaciones';
import DestinoNotificacion from '../src/components/DestinoNotificacion';
import Modal from '../src/components/ModalSeguro';
import { Text } from '../src/components/atoms/Texto';

jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ usuario: { id: 'ana' } }) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('../src/services/notificaciones', () => ({ consumirAviso: jest.fn(), alRecibirDestino: () => () => {} }));
jest.mock('../src/components/ModalSeguro', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
const navigate = jest.fn();
const navigation = { navigate };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNavigation).mockReturnValue(navigation as unknown as ReturnType<typeof useNavigation>);
});
test.each([
  ['semanal', 'Historial'], ['registro', 'Registrar'], ['gastos', 'Balance'],
] as Array<[TipoRecordatorio, string]>)('el aviso %s muestra su mensaje y deja abierta %s al cerrar', async (tipo, pantalla) => {
  jest.mocked(consumirAviso).mockResolvedValueOnce({ tipo, ...mensajesRecordatorio[tipo] });
  let vista: Renderer.ReactTestRenderer;
  await act(async () => { vista = Renderer.create(<DestinoNotificacion />); });
  expect(navigate).toHaveBeenCalledWith('ZonaPrivada', expect.objectContaining({ screen: pantalla }));
  expect(vista!.root.findByType(Modal).props.visible).toBe(true);
  expect(vista!.root.findAllByType(Text).some(t => t.props.children === mensajesRecordatorio[tipo].mensaje)).toBe(true);
  act(() => vista!.root.findByType(TouchableOpacity).props.onPress());
  expect(vista!.root.findByType(Modal).props.visible).toBe(false);
  expect(navigate).toHaveBeenCalledTimes(1);
  await act(async () => vista!.unmount());
});
