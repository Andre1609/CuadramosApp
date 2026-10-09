import { StyleSheet } from 'react-native';

export const estilosFechas = StyleSheet.create({
  grupo: { marginVertical: 12 },
  texto: { color: '#1A202C', fontSize: 16 },
  etiqueta: { color: '#1A202C', fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderColor: '#CBD5E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#1A202C',
  },
  ayuda: { color: '#4A5568', marginTop: 6 },
  boton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 10,
    alignItems: 'center',
  },
  fondo: { flex: 1, backgroundColor: '#FFFFFF' },
  contenido: { padding: 24, gap: 12 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activo: { backgroundColor: '#FFF0F5', borderColor: '#C8005B' },
});
