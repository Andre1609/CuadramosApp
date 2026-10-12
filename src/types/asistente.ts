export type GrupoAsistente = 'finanzas' | 'movimientos' | 'balance';

export type TemaAsistente =
	| 'resumen'
	| 'gastosHormiga'
	| 'mayorCategoria'
	| 'registrar'
	| 'buscar'
	| 'editarEliminar'
	| 'balanceNeto'
	| 'saldoCuenta'
	| 'cambiarMes';

export type DestinoAsistente = 'Balance' | 'Registrar' | 'Historial';

export type Paso =
	| { tipo: 'inicio' }
	| { tipo: 'grupo'; grupo: GrupoAsistente }
	| { tipo: 'respuesta'; grupo: GrupoAsistente; tema: TemaAsistente };

export interface DatosResumenAsistente {
	ingresos: number;
	egresos: number;
	neto: number;
}

export interface MensajeAsistente {
	id: string;
	autor: 'bot' | 'usuario';
	texto: string;
	accion?: { texto: string; destino: DestinoAsistente };
	resumen?: DatosResumenAsistente;
}