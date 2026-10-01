import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';

const PantallaPrincipal = () => {
  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.contenedorPrincipal}>
        
        <View style={estilos.cabecera}>
          <Image 
            source={require('../assets/compartamos-banco.png')} 
            style={estilos.logo}
            resizeMode="contain"
          />
          <Text style={estilos.saludo}>Hola, Carlos</Text>
        </View>
        
        <View style={estilos.contenedorBalance}>
          <Text style={estilos.etiquetaBalance}>Tu balance total</Text>
          <Text style={estilos.montoBalance}>S/ 1,500.00</Text>
          <Text style={estilos.textoActualizado}>Actualizado: hoy 14:19</Text>
        </View>
        
        <Text style={estilos.tituloSeccion}>Tus Cuentas</Text>
        
        <View style={estilos.contenedorCuentas}>
          <View style={estilos.itemCuenta}>
            <Text style={estilos.nombreCuenta}>Cuenta de Ahorros</Text>
            <Text style={estilos.saldoCuenta}>S/ 1,200.00</Text>
          </View>
          <View style={estilos.itemCuenta}>
            <Text style={estilos.nombreCuenta}>Tarjeta de Crédito</Text>
            <Text style={estilos.saldoCuenta}>S/ 300.00</Text>
          </View>
        </View>

        <TouchableOpacity style={estilos.botonCerrar}>
            <Text style={estilos.textoBoton}>Cerrar Sesión (Simulado)</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenedorPrincipal: {
    flex: 1,
    padding: 20,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  saludo: {
    fontSize: 16,
    color: '#333333',
  },
  contenedorBalance: {
    backgroundColor: '#C8005B', 
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
  },
  etiquetaBalance: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  montoBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFB81C', 
    marginVertical: 10,
  },
  textoActualizado: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  contenedorCuentas: {
    flex: 1,
  },
  itemCuenta: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  nombreCuenta: {
    fontSize: 16,
    color: '#666666',
  },
  saldoCuenta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C8005B', 
  },
  botonCerrar: {
    height: 45,
    backgroundColor: '#CCCCCC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PantallaPrincipal;