import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CampoTexto from '../components/atoms/CampoTexto.tsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PropiedadesPantalla {
  navigation: any;
}

const PantallaIngreso = ({ navigation }: PropiedadesPantalla) => {
  const [celular, setCelular] = useState('');

  const manejarIngreso = () => {
    if (celular.length < 9) {
      Alert.alert('Error', 'Por favor ingresa un número de celular válido de 9 dígitos.');
      return;
    }

    navigation.navigate('Principal');
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.contenedorPrincipal}>
        
        <View style={estilos.cabecera}>
          <Image 
            source={require('../assets/compartamos-banco.png')} 
            style={estilos.logo}
            resizeMode="contain"
          />
        </View>

        <View style={estilos.contenedorFormulario}>
          <Text style={estilos.titulo}>¡Bienvenido!</Text>
          <Text style={estilos.subtitulo}>Ingresa tu número de celular para comenzar a gestionar tus finanzas.</Text>

          <CampoTexto 
            placeholder="Ej. 987654321" 
            keyboardType="phone-pad"
            maxLength={9}
            value={celular}
            onChangeText={setCelular}
          />

          <TouchableOpacity style={estilos.botonAmarillo} onPress={manejarIngreso}>
            <Text style={estilos.textoBoton}>Ingresar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#C8005B', 
  },
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#F4F4F4', 
  },
  cabecera: {
    backgroundColor: '#C8005B', 
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5, 
  },
  logo: {
    width: 280,   
    height: 120,  
  },
  contenedorFormulario: {
    flex: 1,
    padding: 25,
    marginTop: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 24,
  },
  botonAmarillo: {
    backgroundColor: '#FFB81C', 
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  textoBoton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C8005B', 
  },
});

export default PantallaIngreso;