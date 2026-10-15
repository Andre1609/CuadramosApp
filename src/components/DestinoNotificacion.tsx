import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { alRecibirDestino, consumirAviso } from '../services/notificaciones';
import { AvisoAbierto } from '../utils/notificaciones';
import { PestanasPrincipales } from '../types/navegacion';
import Modal from './ModalSeguro';
import { Text } from './atoms/Texto';

export default function DestinoNotificacion() {
  const { usuario } = useAuth();
  const cuenta = usuario?.id;
  const navigation = useNavigation<NavigationProp<{ ZonaPrivada: NavigatorScreenParams<PestanasPrincipales> }>>();
  const [aviso, setAviso] = useState<AvisoAbierto | null>(null);
  useEffect(() => {
    if (!cuenta) { return; }
    let activo = true;
    let leyendo = false;
    const abrir = async () => {
      if (leyendo) { return; }
      leyendo = true;
      try {
        const destino = await consumirAviso(cuenta);
        if (!activo || !destino) { return; }
        if (destino.tipo === 'semanal') { navigation.navigate('ZonaPrivada', { screen: 'Historial', params: { resumenSemanal: Date.now() } }); }
        if (destino.tipo === 'registro') { navigation.navigate('ZonaPrivada', { screen: 'Registrar' }); }
        if (destino.tipo === 'gastos') { navigation.navigate('ZonaPrivada', { screen: 'Balance', params: { mesActual: Date.now() } }); }
        setAviso(destino);
      } finally { leyendo = false; }
    };
    const revisar = () => { abrir().catch(() => undefined); };
    revisar();
    const quitar = alRecibirDestino(revisar);
    return () => { activo = false; quitar(); };
  }, [cuenta, navigation]);
  return <Modal transparent visible={!!cuenta && !!aviso} animationType="fade" onRequestClose={() => setAviso(null)}>
    <View style={estilos.fondo}><ScrollView style={estilos.tarjeta} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo} accessibilityRole="header">{aviso?.titulo}</Text>
      <Text>{aviso?.mensaje}</Text>
      <TouchableOpacity accessibilityRole="button" style={estilos.boton} onPress={() => setAviso(null)}><Text style={estilos.textoBoton}>Entendido, cerrar</Text></TouchableOpacity>
    </ScrollView></View>
  </Modal>;
}
const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  tarjeta: { flexGrow: 0, maxHeight: '80%', borderRadius: 20, backgroundColor: '#FFFFFF', width: '100%', maxWidth: 460, alignSelf: 'center' },
  contenido: { padding: 24, gap: 20 }, titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A202C' },
  boton: { minHeight: 48, padding: 16, alignItems: 'center', backgroundColor: '#C8005B', borderRadius: 12 },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
});
