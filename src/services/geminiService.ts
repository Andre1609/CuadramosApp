// src/services/geminiService.ts
import { GEMINI_API_KEY } from '../config/env';

const API_KEY = GEMINI_API_KEY;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`;

export interface MensajeChat {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const consultarAsistenteFinanciero = async (historialMensajes: MensajeChat[]) => {
  try {
    const systemPrompt = `Eres "Cuadri", el asistente financiero inteligente de CuadramosApp en Perú.
Cuentas disponibles:
- "Cuenta Principal" (o Saldo Principal)
- "Día a Día" (o Gastos Diarios)

REGLAS DE INTERACCIÓN:
1. Mantén la continuidad de la conversación leyendo todo el historial enviado.
2. Si el usuario menciona un gasto o ingreso, confirma si falta la cuenta ("Cuenta Principal" o "Día a Día") o la categoría.
3. Si ya tienes TODOS los datos necesarios para registrar (monto, tipo: ingreso/gasto, cuenta, categoría), responde obligatoriamente en formato JSON al final del texto con esta estructura exacta:
[[REGISTRO_ACTION:{"monto":50, "tipo":"ingreso", "cuenta":"Día a Día", "categoria":"Propina"}]]
4. Si el usuario pide actualizar, cambiar o fijar el monto de su meta de ahorro (ej. "Pon mi meta en 1500 soles", "Actualiza mi meta a 2000"), responde amablemente y devuelve esta etiqueta exacta al final:
[[META_ACTION:{"monto":1500}]]

Ejemplo de respuesta si se completó:
¡Perfecto! Ya registré tu propina de 50 soles en Día a Día.
[[REGISTRO_ACTION:{"monto":50, "tipo":"ingreso", "cuenta":"Día a Día", "categoria":"Propina"}]]`;

    // Incluimos las instrucciones del sistema y todo el historial de la conversación
    const contentsFormatted = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...historialMensajes
    ];
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: contentsFormatted }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Error de la API de Gemini:', data.error);
      return { texto: `Error: ${data.error.message}`, accion: null, metaAccion: null };
    }

    const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extraemos la acción JSON de registro si Gemini decidió ejecutar un movimiento
    const matchAccion = textoRespuesta.match(/\[\[REGISTRO_ACTION:(.*?)\]\]/);
    let accionObj = null;

    if (matchAccion && matchAccion[1]) {
      try {
        accionObj = JSON.parse(matchAccion[1]);
      } catch (e) {
        console.error('Error al parsear accion JSON', e);
      }
    }

    // Extraemos la acción JSON de meta si Gemini decidió actualizar la meta de ahorro
    const matchMeta = textoRespuesta.match(/\[\[META_ACTION:(.*?)\]\]/);
    let metaObj = null;

    if (matchMeta && matchMeta[1]) {
      try {
        metaObj = JSON.parse(matchMeta[1]);
      } catch (e) {
        console.error('Error al parsear meta JSON', e);
      }
    }

    // Limpiamos las etiquetas del mensaje que ve el usuario
    const textoLimpio = textoRespuesta
      .replace(/\[\[REGISTRO_ACTION:.*?\]\]/g, '')
      .replace(/\[\[META_ACTION:.*?\]\]/g, '')
      .trim();

    return {
      texto: textoLimpio || 'No pude procesar tu mensaje.',
      accion: accionObj,
      metaAccion: metaObj
    };
  } catch (error: any) {
    console.error('Error en la petición fetch:', error);
    return { texto: 'Error de conexión con el asistente.', accion: null, metaAccion: null };
  }
};