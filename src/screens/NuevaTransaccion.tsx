import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import CampoTexto from '../components/atoms/CampoTexto.tsx';
import BotonAtomo from '../components/atoms/BotonAtomo.tsx';

interface PropiedadesPantalla {
  navigation: any;
}

const NuevaTransaccion = ({ navigation }: PropiedadesPantalla) => {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState<'ingreso' | 'gasto' | null>(null);

  const guardarTransaccion = () => {
    if (!descripcion || !monto || !tipo) {
      Alert.alert('Error', 'Por favor completa todos los campos y selecciona el tipo.');
      return;
    }

    if (isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }

    Alert.alert(
      'Éxito',
      'Registro exitoso (Simulado para MVP).\n\nVolviendo al inicio.',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.contenedorSuperior}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botonVolver}>
              <Text style={estilos.textoVolver}>← Volver</Text>
          </TouchableOpacity>
          <Text style={estilos.tituloPantalla}>Nuevo Registro</Text>
      </View>

      <ScrollView style={estilos.contenedorPrincipal} contentContainerStyle={estilos.contenidoScroll}>
        <Text style={estilos.subtitulo}>Ingresa los detalles financieros.</Text>

        <Text style={estilos.etiqueta}>¿Qué registramos?</Text>
        <View style={estilos.contenedorTipo}>
          <TouchableOpacity 
            style={[estilos.opcionTipo, tipo === 'ingreso' && estilos.opcionSeleccionadaIngreso]} 
            onPress={() => setTipo('ingreso')}
          >
            <Text style={[estilos.textoTipo, tipo === 'ingreso' && estilos.textoSeleccionadoIngreso]}>💰 Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[estilos.opcionTipo, tipo === 'gasto' && estilos.opcionSeleccionadaGasto]} 
            onPress={() => setTipo('gasto')}
          >
            <Text style={[estilos.textoTipo, tipo === 'gasto' && estilos.textoSeleccionadoGasto]}>💸 Gasto</Text>
          </TouchableOpacity>
        </View>

        <Text style={estilos.etiqueta}>Descripción</Text>
        <CampoTexto 
          placeholder="Ej. Pago de Salario o Compra de mercadería" 
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={estilos.etiqueta}>Monto (S/)</Text>
        <CampoTexto 
          placeholder="Ej. 1500.00" 
          keyboardType="numeric" 
          value={monto}
          onChangeText={setMonto}
        />

        <BotonAtomo 
          texto="Guardar Registro" 
          onPress={guardarTransaccion}
          style={estilos.botonGuardar}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#F4F4F4', 
  },
  contenedorSuperior: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderColor: '#EEEEEE',
  },
  botonVolver: {
      padding: 5,
      marginRight: 15,
  },
  textoVolver: {
      color: '#C8005B', 
      fontSize: 16,
      fontWeight: 'bold',
  },
  tituloPantalla: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333333',
  },
  contenedorPrincipal: {
    flex: 1,
    padding: 20,
  },
  contenidoScroll: {
      paddingBottom: 40,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  etiqueta: {
      fontSize: 16,
      color: '#333333',
      fontWeight: 'bold',
      marginBottom: 8,
  },
  contenedorTipo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
  },
  opcionTipo: {
      flex: 0.48,
      height: 50,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#CCCCCC',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  textoTipo: {
      fontSize: 16,
      color: '#666666',
  },
  opcionSeleccionadaIngreso: {
      borderColor: '#28a745', 
      backgroundColor: '#e8f5e9',
      borderWidth: 2,
  },
  textoSeleccionadoIngreso: {
      color: '#155724',
      fontWeight: 'bold',
  },
  opcionSeleccionadaGasto: {
      borderColor: '#dc3545', 
      backgroundColor: '#f8d7da',
      borderWidth: 2,
  },
  textoSeleccionadoGasto: {
      color: '#721c24',
      fontWeight: 'bold',
  },
  botonGuardar: {
      marginTop: 30,
  },
});

export default NuevaTransaccion;