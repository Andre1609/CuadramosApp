import { SafeAreaView } from 'react-native-safe-area-context';
import AjustesTexto from '../components/AjustesTexto';
import { Text } from '../components/atoms/Texto';
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CampoTexto from '../components/atoms/CampoTexto';
import CampoClave from '../components/atoms/CampoClave';
import BotonAtomo from '../components/atoms/BotonAtomo';
import { useAuth } from '../context/AuthContext';
import { soloLetras } from '../utils/validaciones';
import { estilos } from '../styles/estilosIngreso';

const PantallaIngreso = ({ navigation }: any) => {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);

  const manejarIngreso = async () => {
    if (!usuario.trim() || !clave) {
      Alert.alert('Revisa tus datos', 'Ingresa tu usuario y contraseña.');
      return;
    }
    setEnviando(true);
    try {
      await iniciarSesion(usuario, clave); 
    } catch (e) {
      Alert.alert('No pudimos ingresar', e instanceof Error ? e.message : 'Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F4F4F4' }}
          keyboardShouldPersistTaps="handled">
          <View style={estilos.cabecera}>
            <Image
              source={require('../assets/compartamos-banco.png')}
              style={estilos.logo}
              resizeMode="contain"
            />
          </View>

          <View style={estilos.contenedorFormulario}>
            <Text style={estilos.titulo}>¡Bienvenido!</Text>
            <Text style={estilos.subtitulo}>
              Ingresa con tu usuario y contraseña para gestionar tus finanzas.
            </Text>

            <CampoTexto
              placeholder="Usuario"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
              value={usuario}
              onChangeText={t => setUsuario(soloLetras(t))}
            />
            <CampoClave placeholder="Contraseña" value={clave} onChangeText={setClave} />

            <BotonAtomo
              texto={enviando ? 'Ingresando...' : 'Ingresar'}
              variante={enviando ? 'gris' : 'amarillo'}
              disabled={enviando}
              onPress={manejarIngreso}
            />

            <View style={estilos.filaEnlace}>
              <Text style={estilos.textoEnlaceGris}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CrearCuenta')}>
                <Text style={estilos.textoEnlace}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        <AjustesTexto />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PantallaIngreso;