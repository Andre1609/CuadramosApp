import { StyleSheet } from 'react-native';

export const estilosEditarOperacion = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#F8F9FA' },
  contenido: { padding: 24, paddingBottom: 40 },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 12,
  },
  etiqueta: {
    color: '#1A202C',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  texto: { color: '#4A5568' },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: '#1A202C',
  },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 10,
    padding: 12,
  },
  seleccionada: { borderColor: '#C8005B', backgroundColor: '#FFF0F5' },
  boton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#C8005B',
    alignItems: 'center',
    marginTop: 24,
  },
  textoBoton: { color: '#FFFFFF', fontWeight: 'bold' },
  secundario: { padding: 16, alignItems: 'center' },
  eliminar: { color: '#B91C1C', fontWeight: 'bold' },
});
