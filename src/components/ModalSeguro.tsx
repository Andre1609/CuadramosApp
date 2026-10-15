import React from 'react';
import { Modal as ModalNativo, ModalProps, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Cada ventana nativa necesita medir sus propios bordes seguros.
export default function ModalSeguro({ children, ...props }: ModalProps) {
  return <ModalNativo {...props}>
    <SafeAreaProvider>
      {props.transparent
        ? <SafeAreaView style={estilos.contenedor}>{children}</SafeAreaView>
        : children}
    </SafeAreaProvider>
  </ModalNativo>;
}

const estilos = StyleSheet.create({ contenedor: { flex: 1 } });
