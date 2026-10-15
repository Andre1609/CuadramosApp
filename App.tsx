import React, { useEffect } from 'react';
import notifee, { EventType } from '@notifee/react-native';
import { recordarDestino } from './src/services/notificaciones';
import { NotificacionesProvider } from './src/context/NotificacionesContext';
import DestinoNotificacion from './src/components/DestinoNotificacion';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PantallaIngreso from './src/screens/PantallaIngreso';
import PantallaPrincipal from './src/screens/PantallaPrincipal';
import PantallaRegistrar from './src/screens/PantallaRegistrar';
import PantallaHistorial from './src/screens/PantallaHistorial';
import PantallaBalance from './src/screens/PantallaBalance';

import { estilosNavegacion } from './src/styles/estilosNavegacion';

import { FinanzasProvider } from './src/context/FinanzasContext';
import { AsistenteProvider } from './src/context/AsistenteContext';
import { ActivityIndicator, View } from 'react-native';
import PantallaCrearCuenta from './src/screens/PantallaCrearCuenta';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import type { PestanasPrincipales } from './src/types/navegacion';
import { TextoProvider, useTexto } from './src/context/TextoContext';
import { useWindowDimensions } from 'react-native';
import { Text } from './src/components/atoms/Texto';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator<PestanasPrincipales>();

const MisTabs = () => {
  const { factor } = useTexto();
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#C8005B', 
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: [estilosNavegacion.barra, { height: 48 + 40 * factor * fontScale + insets.bottom, paddingBottom: 10 + insets.bottom }],
        tabBarLabel: ({ children, color }) => <Text style={{ color, fontWeight: 'bold', textAlign: 'center' }}>{children}</Text>,
        tabBarLabelStyle: [estilosNavegacion.textoPestaña, { fontSize: 14 * factor }],
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={PantallaPrincipal} 
        options={{ tabBarIcon: ({ color, size }) => <Icon name="view-grid-outline" size={size} color={color} /> }} 
      />
      <Tab.Screen 
        name="Registrar" 
        component={PantallaRegistrar} 
        options={{ tabBarIcon: ({ color, size }) => <Icon name="plus" size={size + 6} color={color} /> }} 
      />
      <Tab.Screen 
        name="Historial" 
        component={PantallaHistorial} 
        options={{ tabBarIcon: ({ color, size }) => <Icon name="history" size={size} color={color} /> }} 
      />
      <Tab.Screen 
        name="Balance" 
        component={PantallaBalance} 
        options={{ tabBarIcon: ({ color, size }) => <Icon name="chart-pie" size={size} color={color} /> }} 
      />
    </Tab.Navigator>
  );
};

const ZonaPrivada = () => {
  const { usuario } = useAuth();
  if (!usuario) { return null; }
  return (
    <AsistenteProvider>
      <FinanzasProvider key={usuario?.id ?? 'invitado'}>
        <NotificacionesProvider>
          <MisTabs />
          <DestinoNotificacion />
        </NotificacionesProvider>
      </FinanzasProvider>
    </AsistenteProvider>
  );
};

const Navegador = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#C8005B' }}>
        <ActivityIndicator size="large" color="#FFB81C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <Stack.Screen name="ZonaPrivada" component={ZonaPrivada} />
        ) : (
          <>
            <Stack.Screen name="Ingreso" component={PantallaIngreso} />
            <Stack.Screen name="CrearCuenta" component={PantallaCrearCuenta} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    notifee.getInitialNotification().then(inicial => {
      if (inicial) { return recordarDestino(inicial.notification); }
    }).catch(() => undefined);
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) { recordarDestino(detail.notification).catch(() => undefined); }
    });
  }, []);
  return (
    <SafeAreaProvider><TextoProvider><AuthProvider>
      <Navegador />
    </AuthProvider></TextoProvider></SafeAreaProvider>
  );
}
