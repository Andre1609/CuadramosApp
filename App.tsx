import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PantallaIngreso from './src/screens/PantallaIngreso.tsx';
import PantallaPrincipal from './src/screens/PantallaPrincipal.tsx';
import NuevaTransaccion from './src/screens/NuevaTransaccion.tsx';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Ingreso"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Ingreso" component={PantallaIngreso} />
        <Stack.Screen name="Principal" component={PantallaPrincipal} />
        <Stack.Screen name="NuevaTransaccion" component={NuevaTransaccion} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;