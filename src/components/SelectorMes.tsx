import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { etiquetaMes, inicioMes, meses } from '../utils/fechas';
import { estilosFechas as estilos } from '../styles/estilosFechas';

export default function SelectorMes({ valor, cambiar, permitirTodos = false }: {
  valor: string | null; cambiar: (mes: string) => void; permitirTodos?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const elegir = (mes: string) => { cambiar(mes); setVisible(false); };
  return <>
    <TouchableOpacity style={estilos.boton} accessibilityRole="button" accessibilityLabel="Seleccionar mes"
      onPress={() => { setAnio(valor ? inicioMes(valor).getFullYear() : new Date().getFullYear()); setVisible(true); }}>
      <Text style={estilos.texto}>{valor ? etiquetaMes(valor) : 'Todos los meses'} ▾</Text>
    </TouchableOpacity>
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={estilos.fondo}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.etiqueta}>Selecciona un mes</Text>
          <View style={estilos.fila}>
            <TouchableOpacity accessibilityLabel="Año anterior" accessibilityRole="button" style={estilos.boton} disabled={anio <= 1900} onPress={() => setAnio(anio - 1)}><Text style={estilos.texto}>‹</Text></TouchableOpacity>
            <Text style={estilos.texto}>{anio}</Text>
            <TouchableOpacity accessibilityLabel="Año siguiente" accessibilityRole="button" style={estilos.boton} disabled={anio >= new Date().getFullYear()} onPress={() => setAnio(anio + 1)}><Text style={estilos.texto}>›</Text></TouchableOpacity>
          </View>
          {permitirTodos && <TouchableOpacity style={estilos.boton} onPress={() => elegir('')}><Text style={estilos.texto}>Todos los meses</Text></TouchableOpacity>}
          {meses.map((mes, indice) => {
            const clave = `${anio}-${String(indice + 1).padStart(2, '0')}`;
            return <TouchableOpacity key={clave} accessibilityRole="button" accessibilityState={{ selected: valor === clave }}
              style={[estilos.boton, valor === clave && estilos.activo]} onPress={() => elegir(clave)}><Text style={estilos.texto}>{mes}</Text></TouchableOpacity>;
          })}
          <TouchableOpacity style={estilos.boton} onPress={() => setVisible(false)}><Text style={estilos.texto}>Cancelar</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
