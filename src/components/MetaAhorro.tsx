import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from './ModalSeguro';
import AjusteTeclado from './atoms/AjusteTeclado';
import { Text, TextInput } from './atoms/Texto';
import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto, montoACentimos } from '../utils/finanzas';

export default function MetaAhorro({ cerrar }: { cerrar: () => void }) {
  const { metaCentimos, guardarMeta, cargando, error: errorCarga, recargar } = useFinanzas();
  const [monto, setMonto] = useState(metaCentimos ? (metaCentimos / 100).toFixed(2) : '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const ocupado = useRef(false);
  const bloquear = guardando || cargando || !!errorCarga;
  const guardar = async () => {
    if (ocupado.current || bloquear) { return; }
    setError('');
    ocupado.current = true;
    setGuardando(true);
    try {
      await guardarMeta(montoACentimos(monto));
      cerrar();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar. Inténtalo nuevamente.');
    } finally {
      ocupado.current = false;
      setGuardando(false);
    }
  };
  return <Modal visible animationType="slide" onRequestClose={() => { if (!ocupado.current) { cerrar(); } }}>
    <SafeAreaView style={estilos.fondo}>
      <AjusteTeclado>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
          <TouchableOpacity accessibilityRole="button" disabled={guardando} onPress={cerrar} style={estilos.volver}>
            <Text style={estilos.enlace}>‹ Volver a Inicio</Text>
          </TouchableOpacity>
          <Text style={estilos.titulo} accessibilityRole="header">Mis metas</Text>
          <Text style={estilos.descripcion}>Define cuánto quieres ahorrar y actualiza tu objetivo cuando lo necesites.</Text>
          <View style={estilos.tarjeta}>
            <Text style={estilos.etiqueta}>Tu objetivo de ahorro</Text>
            <Text style={estilos.monto}>{cargando ? 'Cargando…' : errorCarga ? 'No disponible' : metaCentimos ? `S/ ${formatoMonto(metaCentimos)}` : 'Aún no tienes una meta'}</Text>
            <Text style={estilos.descripcion}>Este es el monto que deseas alcanzar. No es dinero ahorrado ni se suma a tu saldo.</Text>
          </View>
          {!!errorCarga && <View>
            <Text accessibilityRole="alert" style={estilos.error}>{errorCarga}</Text>
            <TouchableOpacity accessibilityRole="button" disabled={cargando} style={estilos.volver} onPress={() => void recargar()}>
              <Text style={estilos.enlace}>Reintentar carga</Text>
            </TouchableOpacity>
          </View>}
          <Text style={estilos.etiqueta}>{metaCentimos ? 'Nuevo objetivo (S/)' : '¿Cuánto quieres ahorrar? (S/)'}</Text>
          <TextInput style={estilos.input} accessibilityLabel="Monto objetivo de ahorro en soles" keyboardType="decimal-pad"
            placeholder="Ej. 1500.00" placeholderTextColor="#64748B" value={monto}
            onChangeText={valor => { setMonto(valor); setError(''); }} editable={!bloquear} />
          <Text style={estilos.descripcion}>Escribe un monto mayor que cero, con hasta dos decimales.</Text>
          {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={estilos.error}>{error}</Text>}
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: bloquear }} style={[estilos.boton, bloquear && estilos.deshabilitado]} disabled={bloquear} onPress={() => void guardar()}>
            <Text style={estilos.textoBoton}>{guardando ? 'Guardando…' : metaCentimos ? 'Actualizar meta' : 'Guardar meta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={estilos.volver} disabled={guardando} onPress={cerrar}>
            <Text style={estilos.enlace}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </AjusteTeclado>
    </SafeAreaView>
  </Modal>;
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#F8F9FA' },
  contenido: { padding: 24, paddingBottom: 32, gap: 16 },
  volver: { minHeight: 48, justifyContent: 'center', paddingVertical: 10 },
  enlace: { color: '#A8004C', fontWeight: '600' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1A202C' },
  descripcion: { color: '#475569' },
  tarjeta: { backgroundColor: '#FFF9E6', padding: 20, borderRadius: 16, gap: 12 },
  etiqueta: { color: '#1A202C', fontWeight: '600' },
  monto: { fontSize: 26, fontWeight: 'bold', color: '#1A202C' },
  input: { minHeight: 56, padding: 14, fontSize: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#94A3B8', borderRadius: 12, color: '#1A202C' },
  error: { color: '#B91C1C' },
  boton: { minHeight: 56, padding: 16, backgroundColor: '#C8005B', borderRadius: 12, alignItems: 'center' },
  deshabilitado: { opacity: 0.5 },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
});
