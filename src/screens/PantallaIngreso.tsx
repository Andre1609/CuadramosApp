import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import CampoTexto from '../components/atoms/CampoTexto.tsx';
import { estilos } from '../styles/estilosIngreso';
import React from 'react';

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

export default PantallaIngreso;
