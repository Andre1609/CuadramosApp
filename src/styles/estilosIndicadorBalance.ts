import { StyleSheet } from 'react-native';

export const estilosIndicadorBalance = StyleSheet.create({
  contenedor: { alignItems: 'center', paddingVertical: 20 },
  circulo: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  segmento: { position: 'absolute', width: 7, height: 26 },
  centro: { width: 146, alignItems: 'center' },
  porcentaje: { fontSize: 26, fontWeight: 'bold', color: '#1A202C', textAlign: 'center', marginVertical: 8, alignSelf: 'stretch' },
  deficit: { color: '#DC2626' },
  etiqueta: { fontSize: 13, color: '#475569', textAlign: 'center' },
  leyenda: { marginTop: 16, gap: 8, maxWidth: '100%' },
  filaLeyenda: { flexDirection: 'row', alignItems: 'center' },
  punto: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  fondoNaranja: { backgroundColor: '#EA580C' },
  fondoVerde: { backgroundColor: '#16A34A' },
  fondoRojo: { backgroundColor: '#DC2626' },
  textoLeyenda: { fontSize: 15, color: '#1A202C', flexShrink: 1 },
  nota: { fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 6 },
});
