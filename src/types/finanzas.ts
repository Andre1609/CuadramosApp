export type TipoOperacion = 'ingreso' | 'egreso';

export interface Operacion {
  id: string;
  tipo: TipoOperacion;
  montoCentimos: number;
  concepto: string;
  cuentaId: string;
  categoria: string;
  fecha: string;
}

export type NuevaOperacion = Omit<Operacion, 'id' | 'fecha'> & {
  fecha?: string;
};

export const cuentas = [
  {
    id: 'principal',
    nombre: 'Mi cuenta principal',
    icono: 'wallet-outline',
    colorFondo: '#FFF0F5',
    colorIcono: '#C8005B',
  },
  {
    id: 'metas',
    nombre: 'Mis metas',
    icono: 'target',
    colorFondo: '#FFF9E6',
    colorIcono: '#A67C00',
  },
  {
    id: 'diaria',
    nombre: 'Del día a día',
    icono: 'credit-card-outline',
    colorFondo: '#F0F0FF',
    colorIcono: '#5C5C99',
  },
];

export const categoriasPorTipo = {
  ingreso: ['Salario', 'Trabajo', 'Otros'],
  egreso: [
    'Alimentación',
    'Comida y bebida',
    'Hogar',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Otros',
  ],
};

export const cuentasFinancieras = cuentas.filter(
  cuenta => cuenta.id !== 'metas',
);
