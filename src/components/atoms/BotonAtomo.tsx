import { Text } from './Texto';
import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';

interface PropiedadesBoton extends TouchableOpacityProps {
  texto: string;
  variante?: 'amarillo' | 'magenta' | 'gris';
}

const BotonAtomo = ({ texto, variante = 'amarillo', style, ...restoPropiedades }: PropiedadesBoton) => {
  const estiloFondo = variante === 'magenta' ? estilos.botonMagenta
                    : variante === 'gris' ? estilos.botonGris
                    : estilos.botonAmarillo;

  const estiloTexto = variante === 'magenta' ? estilos.textoMagenta
                    : variante === 'gris' ? estilos.textoGris
                    : estilos.textoAmarillo;

  return (
    <TouchableOpacity
      style={[estilos.baseBoton, estiloFondo, style]}
      {...restoPropiedades}
    >
      <Text style={[estilos.baseTextoBoton, estiloTexto]}>{texto}</Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  baseBoton: {
    minHeight: 55,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    width: '100%',
    marginVertical: 10,
  },
  baseTextoBoton: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonAmarillo: {
    backgroundColor: '#FFB81C',
  },
  textoAmarillo: {
    color: '#C8005B',
  },
  botonMagenta: {
    backgroundColor: '#C8005B',
  },
  textoMagenta: {
    color: '#FFFFFF',
  },
  botonGris: {
    backgroundColor: '#CCCCCC',
  },
  textoGris: {
    color: '#FFFFFF',
  },
});

export default BotonAtomo;
