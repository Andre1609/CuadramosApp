// src/context/AsistenteContext.tsx

import React, { createContext, useContext, useState } from 'react';
import type { Paso, MensajeAsistente } from '../types/asistente';
import { consultarAsistenteFinanciero, MensajeChat } from '../services/geminiService';

interface EstadoAsistente {
  mensajes: MensajeAsistente[];
  paso: Paso;
  cargandoIA: boolean;
  agregarMensajes: (nuevos: MensajeAsistente[]) => void;
  establecerPaso: (siguiente: Paso) => void;
  enviarMensajeUsuario: (texto: string) => Promise<{ accion: any | null; metaAccion: any | null }>;
}

const saludoInicial: MensajeAsistente = {
  id: 'saludo-inicial',
  autor: 'bot',
  texto: '¡Hola! Soy Cuadri. Elige un tema de ayuda o escríbeme directamente cualquier duda sobre tus finanzas.',
};

const ContextoAsistente = createContext<EstadoAsistente | null>(null);

export function AsistenteProvider({ children }: { children: React.ReactNode }) {
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([saludoInicial]);
  const [paso, setPaso] = useState<Paso>({ tipo: 'inicio' });
  const [cargandoIA, setCargandoIA] = useState<boolean>(false);

  const agregarMensajes = (nuevos: MensajeAsistente[]) => {
    setMensajes(actuales => [...actuales, ...nuevos]);
  };

  const enviarMensajeUsuario = async (texto: string) => {
    if (!texto.trim() || cargandoIA) return { accion: null, metaAccion: null };

    const mensajeUserObj: MensajeAsistente = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      autor: 'usuario',
      texto,
    };

    setMensajes(actuales => [...actuales, mensajeUserObj]);
    setCargandoIA(true);

    try {
      const historialParaGemini: MensajeChat[] = [...mensajes, mensajeUserObj].map(m => ({
        role: m.autor === 'usuario' ? 'user' : 'model',
        parts: [{ text: m.texto || '' }]
      }));

      const respuestaIA = await consultarAsistenteFinanciero(historialParaGemini);

      const mensajeBotObj: MensajeAsistente = {
        id: `${Date.now() + 1}-${Math.random().toString(36).slice(2)}`,
        autor: 'bot',
        texto: respuestaIA.texto,
      };

      setMensajes(actuales => [...actuales, mensajeBotObj]);

      return { 
        accion: respuestaIA.accion, 
        metaAccion: respuestaIA.metaAccion 
      };
    } catch (err) {
      console.error('Error al consultar la IA:', err);
      const mensajeError: MensajeAsistente = {
        id: `${Date.now() + 1}`,
        autor: 'bot',
        texto: 'Tuve un problema de conexión. Inténtalo de nuevo.',
      };
      setMensajes(actuales => [...actuales, mensajeError]);
      return { accion: null, metaAccion: null };
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <ContextoAsistente.Provider
      value={{ 
        mensajes, 
        paso, 
        cargandoIA,
        agregarMensajes, 
        establecerPaso: setPaso,
        enviarMensajeUsuario
      }}
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