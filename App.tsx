import React from 'react';
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

import { ActivityIndicator, View } from 'react-native';
import PantallaCrearCuenta from './src/screens/PantallaCrearCuenta';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import type { PestanasPrincipales } from './src/types/navegacion';
import { FinanzasProvider } from './src/context/FinanzasContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator<PestanasPrincipales>();

const MisTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#C8005B', 
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: estilosNavegacion.barra,
        tabBarLabelStyle: estilosNavegacion.textoPestaña,
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

// Zona privada: las finanzas se cargan por usuario y se reinician si cambia la cuenta
const ZonaPrivada = () => {
  const { usuario } = useAuth();
  if (!usuario) { return null; }
  return (
    <FinanzasProvider key={usuario?.id}>
      <MisTabs />
    </FinanzasProvider>
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
          <Stack.Screen name="Principal" component={ZonaPrivada} />
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

const App = () => (
  <AuthProvider>
    <Navegador />
  </AuthProvider>
);

export default App;
