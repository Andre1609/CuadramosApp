import React from 'react';
import { Text, View } from 'react-native';
import { estilosIndicadorBalance as estilos } from '../styles/estilosIndicadorBalance';

export default function IndicadorBalance({ ingresos, egresos }: { ingresos: number; egresos: number }) {
  const vacio = ingresos === 0 && egresos === 0;
  const neto = ingresos - egresos;
  const deficit = neto < 0;
  const fraccionGastada = ingresos > 0 ? Math.min(1, egresos / ingresos) : 0;
  const porcentaje = ingresos > 0
    ? `${(egresos / ingresos * 100).toLocaleString('es-PE', { maximumFractionDigits: 2 })}%`
    : null;
  const titulo = vacio ? 'Sin movimientos' : porcentaje === null ? 'Gastos sin ingresos' : 'Gastaste el';
  return (
    <View style={estilos.contenedor} accessible accessibilityLabel={vacio ? 'Sin movimientos. Registra un ingreso o gasto para ver tu resumen.' : `${porcentaje === null ? titulo : `Gastaste el ${porcentaje} de tus ingresos`}. Según los movimientos registrados del mes seleccionado.`}>
      <View style={estilos.circulo}>
        {Array.from({ length: 120 }, (_, indice) => {
          const angulo = indice * 3;
          const radianes = angulo * Math.PI / 180;
          return <View key={indice} style={[estilos.segmento, {
            left: 110 + 96 * Math.sin(radianes) - 3.5,
            top: 110 - 96 * Math.cos(radianes) - 13,
            transform: [{ rotate: `${angulo}deg` }],
            backgroundColor: vacio ? '#CBD5E1' : deficit ? '#DC2626' : indice / 120 < fraccionGastada ? '#EA580C' : '#16A34A',
          }]} />;
        })}
        <View style={estilos.centro}>
          <Text style={estilos.etiqueta}>{titulo}</Text>
          {porcentaje !== null && <Text style={[estilos.porcentaje, deficit && estilos.deficit]} adjustsFontSizeToFit numberOfLines={1}>{porcentaje}</Text>}
          {porcentaje !== null && <Text style={estilos.etiqueta}>de tus ingresos</Text>}
        </View>
      </View>
      {vacio ? <Text style={estilos.nota}>Registra un ingreso o gasto para ver tu resumen.</Text> : (
        <View style={estilos.leyenda}>
          <View style={estilos.filaLeyenda}>
            <View style={[estilos.punto, deficit ? estilos.fondoRojo : estilos.fondoNaranja]} />
            <Text style={estilos.textoLeyenda}>{deficit ? 'Gastos superiores a ingresos' : 'Gastado'}</Text>
          </View>
          {!deficit && <View style={estilos.filaLeyenda}>
            <View style={[estilos.punto, estilos.fondoVerde]} />
            <Text style={estilos.textoLeyenda}>Restante</Text>
          </View>}
        </View>
      )}
      {!vacio && <Text style={estilos.nota}>{deficit ? 'Gastaste más de lo que entró. ' : ''}Según los movimientos registrados del mes seleccionado. No incluye dinero de meses anteriores.</Text>}
    </View>
  );
}
