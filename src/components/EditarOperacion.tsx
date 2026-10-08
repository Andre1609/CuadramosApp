import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Operacion, TipoOperacion, categoriasPorTipo, cuentas } from '../types/finanzas';
import { useFinanzas } from '../context/FinanzasContext';
import { montoACentimos } from '../utils/finanzas';
import { estilosEditarOperacion as estilos } from '../styles/estilosEditarOperacion';

export default function EditarOperacion({ operacion, cerrar }: { operacion: Operacion; cerrar: () => void }) {
  const { editar, eliminar } = useFinanzas();
  const [tipo, setTipo] = useState<TipoOperacion>(operacion.tipo);
  const [monto, setMonto] = useState((operacion.montoCentimos / 100).toFixed(2));
  const [concepto, setConcepto] = useState(operacion.concepto);
  const [cuentaId, setCuentaId] = useState(operacion.cuentaId);
  const [categoria, setCategoria] = useState(operacion.categoria);
  const [guardando, setGuardando] = useState(false);
  const ocupado = useRef(false);

  async function ejecutar(borrar: boolean) {
    if (ocupado.current) { return; }
    ocupado.current = true;
    setGuardando(true);
    try {
      if (borrar) { await eliminar(operacion.id); }
      else { await editar(operacion.id, { tipo, montoCentimos: montoACentimos(monto), concepto, cuentaId, categoria }); }
      cerrar();
    } catch (error) {
      Alert.alert('No se pudo completar', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
    } finally { ocupado.current = false; setGuardando(false); }
  }

  const confirmarEliminacion = () => Alert.alert('Eliminar operación',
    `¿Eliminar "${operacion.concepto}"? Se actualizarán tus saldos. Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { ejecutar(true); } },
    ]);

  return (
    <Modal visible animationType="slide" onRequestClose={() => { if (!ocupado.current) { cerrar(); } }}>
      <SafeAreaView style={estilos.fondo}>
        <KeyboardAvoidingView style={estilos.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
            <Text style={estilos.titulo}>Editar operación</Text>
            <Text style={estilos.texto}>Registrada el {new Date(operacion.fecha).toLocaleDateString('es-PE')}</Text>
            <Text style={estilos.etiqueta}>Tipo</Text>
            <View style={estilos.opciones}>
              {(['ingreso', 'egreso'] as const).map(valor => (
                <TouchableOpacity key={valor} disabled={guardando} accessibilityRole="button" accessibilityState={{ selected: tipo === valor }}
                  style={[estilos.opcion, tipo === valor && estilos.seleccionada]}
                  onPress={() => { setTipo(valor); setCategoria('Otros'); }}>
                  <Text style={estilos.texto}>{valor === 'ingreso' ? 'Ingreso' : 'Egreso'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={estilos.etiqueta}>Monto (S/)</Text>
            <TextInput accessibilityLabel="Monto" style={estilos.input} keyboardType="decimal-pad" value={monto} onChangeText={setMonto} editable={!guardando} />
            <Text style={estilos.etiqueta}>Concepto</Text>
            <TextInput accessibilityLabel="Concepto" style={estilos.input} value={concepto} onChangeText={setConcepto} editable={!guardando} />
            <Text style={estilos.etiqueta}>Cuenta</Text>
            <View style={estilos.opciones}>
              {cuentas.map(cuenta => (
                <TouchableOpacity key={cuenta.id} disabled={guardando} accessibilityRole="button" accessibilityState={{ selected: cuentaId === cuenta.id }}
                  style={[estilos.opcion, cuentaId === cuenta.id && estilos.seleccionada]} onPress={() => setCuentaId(cuenta.id)}>
                  <Text style={estilos.texto}>{cuenta.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={estilos.etiqueta}>Categoría</Text>
            <View style={estilos.opciones}>
              {categoriasPorTipo[tipo].map(valor => (
                <TouchableOpacity key={valor} disabled={guardando} accessibilityRole="button" accessibilityState={{ selected: categoria === valor }}
                  style={[estilos.opcion, categoria === valor && estilos.seleccionada]} onPress={() => setCategoria(valor)}>
                  <Text style={estilos.texto}>{valor}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity accessibilityRole="button" style={estilos.boton} disabled={guardando} onPress={() => { ejecutar(false); }}>
              <Text style={estilos.textoBoton}>{guardando ? 'Procesando...' : 'Guardar cambios'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={estilos.secundario} disabled={guardando} onPress={confirmarEliminacion}>
              <Text style={estilos.eliminar}>Eliminar operación</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={estilos.secundario} disabled={guardando} onPress={cerrar}>
              <Text style={estilos.texto}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
