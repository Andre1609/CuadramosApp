import Modal from './ModalSeguro';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './atoms/Texto';
import { TamanoTexto, useTexto } from '../context/TextoContext';

const opciones: { valor: TamanoTexto; nombre: string }[] = [
  { valor: 'normal', nombre: 'Normal' },
  { valor: 'grande', nombre: 'Grande' },
  { valor: 'muyGrande', nombre: 'Muy grande' },
];

export default function AjustesTexto() {
  const [visible, setVisible] = useState(false);
  const { tamano, cambiarTamano, cargando, guardando, error } = useTexto();
  return <>
    <TouchableOpacity accessibilityRole="button" style={estilos.boton} onPress={() => setVisible(true)}>
      <Text style={estilos.enlace}>Aa · Tamaño de texto</Text>
    </TouchableOpacity>
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={estilos.fondo}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={estilos.titulo} accessibilityRole="header">Tamaño de texto</Text>
          <Text>Elige el tamaño que te resulte más cómodo. Se guardará para todas las pantallas de este dispositivo.</Text>
          <Text>También se respeta el tamaño de letra configurado en tu teléfono.</Text>
          <View accessibilityRole="radiogroup" style={estilos.opciones}>
            {opciones.map(opcion => <TouchableOpacity key={opcion.valor}
              accessibilityRole="radio" accessibilityState={{ checked: tamano === opcion.valor, disabled: cargando || guardando }}
              disabled={cargando || guardando} onPress={() => void cambiarTamano(opcion.valor)}
              style={[estilos.opcion, tamano === opcion.valor && estilos.seleccionada]}>
              <Text style={estilos.enlace}>{tamano === opcion.valor ? '✓ ' : ''}{opcion.nombre}</Text>
            </TouchableOpacity>)}
          </View>
          <View style={estilos.vistaPrevia}>
            <Text style={estilos.enlace}>Vista previa</Text>
            <Text>Tu balance del mes</Text>
            <Text style={estilos.titulo}>S/ 1,250.00</Text>
            <Text>Aquí podrás leer tus ingresos, gastos y objetivos de ahorro.</Text>
          </View>
          {!!error && <Text accessibilityRole="alert">{error}</Text>}
          {(cargando || guardando) && <Text accessibilityLiveRegion="polite">{cargando ? 'Cargando preferencia…' : 'Guardando…'}</Text>}
          <TouchableOpacity accessibilityRole="button" style={estilos.boton} onPress={() => setVisible(false)}><Text style={estilos.enlace}>Listo, volver</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#FFFFFF' },
  contenido: { padding: 24, gap: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A202C' },
  enlace: { color: '#A8004C', fontWeight: '600' },
  boton: { minHeight: 48, paddingVertical: 14, alignItems: 'center' },
  opciones: { gap: 12 },
  opcion: { minHeight: 52, padding: 16, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  seleccionada: { borderColor: '#C8005B', borderWidth: 2, backgroundColor: '#FFF0F5' },
  vistaPrevia: { padding: 20, gap: 12, backgroundColor: '#F1F5F9', borderRadius: 12 },
});
