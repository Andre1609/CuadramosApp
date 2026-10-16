import { SafeAreaView } from 'react-native-safe-area-context';
import AjustesTexto from '../components/AjustesTexto';
import AjusteTeclado from '../components/atoms/AjusteTeclado';
import { Text } from '../components/atoms/Texto';
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import CampoTexto from '../components/atoms/CampoTexto';
import CampoClave from '../components/atoms/CampoClave';
import BotonAtomo from '../components/atoms/BotonAtomo';
import { useAuth } from '../context/AuthContext';
import { soloLetras, validarUsuario, validarClave } from '../utils/validaciones';
import { estilos } from '../styles/estilosIngreso';

type Errores = { usuario?: string; clave?: string; confirmar?: string };

const PantallaCrearCuenta = ({ navigation }: any) => {
  const { crearCuenta } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);

  const manejarRegistro = async () => {
    const nuevos: Errores = {
      usuario: validarUsuario(usuario) ?? undefined,
      clave: validarClave(clave) ?? undefined,
      confirmar: clave !== confirmar ? 'Las contraseñas no coinciden.' : undefined,
    };
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) { return; }

    setEnviando(true);
    try {
      await crearCuenta(usuario, clave);
    } catch (e) {
      Alert.alert('No pudimos crear tu cuenta', e instanceof Error ? e.message : 'Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <AjusteTeclado>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F4F4F4' }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets>
          <View style={estilos.cabecera}>
            <Image
              source={require('../assets/compartamos-banco.png')}
              style={estilos.logo}
              resizeMode="contain"
            />
          </View>

          <View style={estilos.contenedorFormulario}>
            <Text style={estilos.titulo}>Crea tu cuenta</Text>
            <Text style={estilos.subtitulo}>
              Elige tu nombre de usuario. Aparecerá en tu perfil.
            </Text>

            <CampoTexto
              placeholder="Usuario"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
              value={usuario}
              onChangeText={t => setUsuario(soloLetras(t))}
            />
            {errores.usuario && <Text style={estilos.textoError}>{errores.usuario}</Text>}

            <CampoClave placeholder="Contraseña" value={clave} onChangeText={setClave} />
            {errores.clave && <Text style={estilos.textoError}>{errores.clave}</Text>}

            <CampoClave
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChangeText={setConfirmar}
            />
            {errores.confirmar && <Text style={estilos.textoError}>{errores.confirmar}</Text>}

            <BotonAtomo
              texto={enviando ? 'Creando cuenta...' : 'Crear cuenta'}
              variante={enviando ? 'gris' : 'amarillo'}
              disabled={enviando}
              onPress={manejarRegistro}
            />

            <View style={estilos.filaEnlace}>
              <Text style={estilos.textoEnlaceGris}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Ingreso')}>
                <Text style={estilos.textoEnlace}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        <AjustesTexto />
        </ScrollView>
      </AjusteTeclado>
    </SafeAreaView>
  );
};

export default PantallaCrearCuenta;