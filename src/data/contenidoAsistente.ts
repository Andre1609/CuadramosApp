import type { DestinoAsistente, GrupoAsistente, TemaAsistente } from '../types/asistente';

export const gruposAsistente: {
  grupo: GrupoAsistente;
  texto: string;
  icono: string;
}[] = [
  { grupo: 'finanzas', texto: 'Conocer mis finanzas', icono: 'chart-box-outline' },
  { grupo: 'movimientos', texto: 'Registrar o buscar movimientos', icono: 'swap-horizontal' },
  { grupo: 'balance', texto: 'Entender mi balance', icono: 'help-circle-outline' },
];

export const introGrupo: Record<GrupoAsistente, string> = {
  finanzas: 'Sobre tus finanzas, puedo mostrarte esto:',
  movimientos: 'Con tus movimientos, puedo ayudarte con:',
  balance: 'Para entender tu balance, elige una duda:',
};

export interface PreguntaAsistente {
  tema: TemaAsistente;
  texto: string;
  icono: string;
  respuesta?: string;
  destino: DestinoAsistente;
  textoAccion: string;
}

export const preguntasAsistente: Record<GrupoAsistente, PreguntaAsistente[]> = {
  finanzas: [
    {
      tema: 'resumen',
      texto: '¿Cómo va mi mes?',
      icono: 'calendar-month-outline',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
    {
      tema: 'gastosHormiga',
      texto: '¿Cuánto llevo en gastos pequeños?',
      icono: 'cash-minus',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
    {
      tema: 'mayorCategoria',
      texto: '¿En qué categoría gasté más?',
      icono: 'format-list-bulleted',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
  ],
  movimientos: [
    {
      tema: 'registrar',
      texto: '¿Cómo registro un ingreso o gasto?',
      icono: 'plus-circle-outline',
      respuesta: 'Toca Registrar, elige ingreso o gasto y completa el monto, concepto, cuenta y categoría. Después pulsa Guardar operación.',
      destino: 'Registrar',
      textoAccion: 'Ir a Registrar',
    },
    {
      tema: 'buscar',
      texto: '¿Dónde busco un movimiento?',
      icono: 'magnify',
      respuesta: 'En Historial puedes buscar por concepto o categoría. También puedes filtrar por tipo y periodo.',
      destino: 'Historial',
      textoAccion: 'Ir a Historial',
    },
    {
      tema: 'editarEliminar',
      texto: '¿Puedo editar o eliminar un movimiento?',
      icono: 'square-edit-outline',
      respuesta: 'Sí. En Historial, toca el movimiento que quieres cambiar. Desde ahí puedes editarlo o eliminarlo.',
      destino: 'Historial',
      textoAccion: 'Ir a Historial',
    },
  ],
  balance: [
    {
      tema: 'balanceNeto',
      texto: '¿Qué es el balance neto?',
      icono: 'scale-balance',
      respuesta: 'Es el resultado de restar tus gastos a tus ingresos durante el periodo seleccionado.',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
    {
      tema: 'saldoCuenta',
      texto: '¿Por qué mi saldo es distinto al balance?',
      icono: 'help-circle-outline',
      respuesta: 'El saldo de una cuenta suma sus movimientos de todos los periodos. Balance muestra ingresos y gastos de un solo mes.',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
    {
      tema: 'cambiarMes',
      texto: '¿Cómo consulto otro mes?',
      icono: 'calendar-search',
      respuesta: 'En Balance, toca el periodo que aparece en la parte superior y elige el mes que quieres revisar.',
      destino: 'Balance',
      textoAccion: 'Ir a Balance',
    },
  ],
};