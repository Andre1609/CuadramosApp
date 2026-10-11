import React, { useState } from 'react';
import { Alert, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto, montoACentimos } from '../utils/finanzas';
import { estilosEditarOperacion as estilos } from '../styles/estilosEditarOperacion';

export default function MetaAhorro({ cerrar }: { cerrar: () => void }) {
  const { metaCentimos, guardarMeta } = useFinanzas();
  const [monto, setMonto] = useState(metaCentimos ? (metaCentimos / 100).toFixed(2) : '');
  const [guardando, setGuardando] = useState(false);
  const guardar = async () => {
    if (guardando) { return; }
    setGuardando(true);
    try { await guardarMeta(montoACentimos(monto)); cerrar(); }
    catch (error) { Alert.alert('No se pudo guardar la meta', error instanceof Error ? error.message : 'Inténtalo nuevamente.'); }
    finally { setGuardando(false); }
  };
  return <Modal visible animationType="slide" onRequestClose={() => { if (!guardando) { cerrar(); } }}>
    <SafeAreaView style={estilos.fondo}><View style={estilos.contenido}>
      <Text style={estilos.titulo}>Mi objetivo de ahorro</Text>
      <Text style={estilos.texto}>Es el monto que quieres alcanzar. No representa dinero disponible ni se suma a tus ingresos.</Text>
      <Text style={estilos.etiqueta}>Objetivo actual: S/ {formatoMonto(metaCentimos)}</Text>
      <Text style={estilos.etiqueta}>¿Cuánto quieres alcanzar? (S/)</Text>
      <TextInput style={estilos.input} accessibilityLabel="Monto objetivo de ahorro" keyboardType="decimal-pad" value={monto} onChangeText={setMonto} editable={!guardando} />
      <TouchableOpacity style={estilos.boton} disabled={guardando} onPress={guardar}><Text style={estilos.textoBoton}>{guardando ? 'Guardando...' : 'Guardar objetivo'}</Text></TouchableOpacity>
      <TouchableOpacity style={estilos.secundario} disabled={guardando} onPress={cerrar}><Text style={estilos.texto}>Cancelar</Text></TouchableOpacity>
    </View></SafeAreaView>
  </Modal>;
}
