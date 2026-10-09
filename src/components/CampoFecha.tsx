import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { estilosFechas as estilos } from '../styles/estilosFechas';

export default function CampoFecha({ valor, cambiar, deshabilitado = false }: {
  valor: string; cambiar: (valor: string) => void; deshabilitado?: boolean;
}) {
  return <View style={estilos.grupo}>
    <Text style={estilos.etiqueta}>Fecha de la operación</Text>
    <TextInput style={estilos.input} accessibilityLabel="Fecha de la operación, día mes y año"
      placeholder="DD/MM/AAAA" placeholderTextColor="#718096" value={valor}
      onChangeText={cambiar} editable={!deshabilitado} maxLength={10} />
    <Text style={estilos.ayuda}>DD/MM/AAAA. Puedes registrar hoy o un día anterior.</Text>
  </View>;
}
