import React, { createContext, useContext, useState } from 'react';
import type { Paso, MensajeAsistente } from '../types/asistente';

interface EstadoAsistente {
  mensajes: MensajeAsistente[];
  paso: Paso;
  agregarMensajes: (nuevos: MensajeAsistente[]) => void;
  establecerPaso: (siguiente: Paso) => void;
}

const saludoInicial: MensajeAsistente = {
  id: 'saludo-inicial',
  autor: 'bot',
  texto: '¡Hola! Soy Cuadri. Elige un tema y te mostraré opciones para ayudarte con tu dinero.',
};

const ContextoAsistente = createContext<EstadoAsistente | null>(null);

export function AsistenteProvider({ children }: { children: React.ReactNode }) {
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([saludoInicial]);
  const [paso, setPaso] = useState<Paso>({ tipo: 'inicio' });

  const agregarMensajes = (nuevos: MensajeAsistente[]) => {
    setMensajes(actuales => [...actuales, ...nuevos]);
  };

  return (
    <ContextoAsistente.Provider
      value={{ mensajes, paso, agregarMensajes, establecerPaso: setPaso }}
    >
      {children}
    </ContextoAsistente.Provider>
  );
}

export function useAsistente() {
  const contexto = useContext(ContextoAsistente);
  if (!contexto) { throw new Error('Falta AsistenteProvider.'); }
  return contexto;
}