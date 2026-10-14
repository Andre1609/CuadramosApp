import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AsistenteProvider, useAsistente } from '../src/context/AsistenteContext';
import type { MensajeAsistente } from '../src/types/asistente';

test('conserva el historial al agregar mensajes y cambiar de paso', () => {
  let estado: ReturnType<typeof useAsistente> | undefined;
  const LeerEstado = () => {
    estado = useAsistente();
    return null;
  };

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <AsistenteProvider>
        <LeerEstado />
      </AsistenteProvider>,
    );
  });

  const primerIntercambio: MensajeAsistente[] = [
    { id: 'usuario-1', autor: 'usuario', texto: 'Conocer mis finanzas' },
    { id: 'bot-1', autor: 'bot', texto: 'Sobre tus finanzas, puedo mostrarte esto:' },
  ];
  ReactTestRenderer.act(() => {
    estado?.agregarMensajes(primerIntercambio);
    estado?.establecerPaso({ tipo: 'grupo', grupo: 'finanzas' });
  });

  expect(estado?.mensajes.map(mensaje => mensaje.id)).toEqual([
    'saludo-inicial',
    'usuario-1',
    'bot-1',
  ]);
  expect(estado?.paso).toEqual({ tipo: 'grupo', grupo: 'finanzas' });

  ReactTestRenderer.act(() => {
    estado?.agregarMensajes([
      { id: 'usuario-2', autor: 'usuario', texto: '¿Cómo va mi mes?' },
      { id: 'bot-2', autor: 'bot', texto: 'En octubre, tus números van así:' },
    ]);
    estado?.establecerPaso({ tipo: 'respuesta', grupo: 'finanzas', tema: 'resumen' });
  });

  expect(estado?.mensajes.map(mensaje => mensaje.id)).toEqual([
    'saludo-inicial',
    'usuario-1',
    'bot-1',
    'usuario-2',
    'bot-2',
  ]);
  expect(estado?.paso).toEqual({ tipo: 'respuesta', grupo: 'finanzas', tema: 'resumen' });
  ReactTestRenderer.act(() => renderer?.unmount());
});
