import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
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
    height: 150,
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
