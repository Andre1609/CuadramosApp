import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // <-- Importamos los vectores

import PantallaIngreso from './src/screens/PantallaIngreso.tsx';
import PantallaPrincipal from './src/screens/PantallaPrincipal.tsx';
import PantallaRegistrar from './src/screens/PantallaRegistrar.tsx';
import PantallaHistorial from './src/screens/PantallaHistorial.tsx';
import PantallaBalance from './src/screens/PantallaBalance.tsx';

import { estilosNavegacion } from './src/styles/estilosNavegacion';

import { FinanzasProvider } from './src/context/FinanzasContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

const App = () => {
  return (
    <FinanzasProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Ingreso"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Ingreso" component={PantallaIngreso} />
        <Stack.Screen name="Principal" component={MisTabs} />
      </Stack.Navigator>
    </NavigationContainer>
    </FinanzasProvider>
  );
};

export default App;