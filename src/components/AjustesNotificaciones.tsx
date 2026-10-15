import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from './ModalSeguro';
import { Text, TextInput } from './atoms/Texto';
import { useNotificaciones } from '../context/NotificacionesContext';
import { abrirAjustesNotificaciones } from '../services/notificaciones';
import { horaValida, resumenSemanal } from '../utils/notificaciones';
import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto } from '../utils/finanzas';

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export function ContenidoResumenSemanal() {
  const { operaciones, cargando, error } = useFinanzas();
  if (cargando) { return <Text>Cargando resumen…</Text>; }
  if (error) { return <Text accessibilityRole="alert">{error}</Text>; }
  const r = resumenSemanal(operaciones);
  return <View style={estilos.tarjeta}>
    <Text style={estilos.subtitulo}>Últimos 7 días</Text>
    <Text>{r.inicio.toLocaleDateString('es-PE')} al {r.fin.toLocaleDateString('es-PE')}</Text>
    <Text>Ingresos: S/ {formatoMonto(r.ingresos)}</Text>
    <Text>Gastos: S/ {formatoMonto(r.gastos)}</Text>
    <Text>Balance: S/ {formatoMonto(r.neto)}</Text>
    <Text>{r.cantidad ? `${r.cantidad} movimientos registrados.` : 'Todavía no hay movimientos en este periodo.'}</Text>
  </View>;
}
export default function AjustesNotificaciones({ icono = false }: { icono?: boolean }) {
  const [visible, setVisible] = useState(false);
  const estado = useNotificaciones();
  const [borrador, setBorrador] = useState(estado.preferencias);
  const [errorLocal, setErrorLocal] = useState('');
  useEffect(() => { setBorrador(estado.preferencias); }, [estado.preferencias]);
  const abrir = () => { setBorrador(estado.preferencias); setErrorLocal(''); estado.actualizar(); setVisible(true); };
  const opciones = [
    { clave: 'registro' as const, titulo: 'Recordar mis movimientos', detalle: 'Un aviso diario si no hay ingresos o gastos registrados con fecha de hoy.' },
    { clave: 'gastos' as const, titulo: 'Avisos de gastos', detalle: 'Al alcanzar el 80% y al superar tus ingresos registrados del mes. Una vez por umbral al mes, al actualizar tus movimientos.' },
    { clave: 'semanal' as const, titulo: 'Resumen semanal', detalle: 'Un recordatorio semanal para consultar tus ingresos, gastos y balance de los últimos 7 días.' },
    { clave: 'ocultarDetalles' as const, titulo: 'Mensajes discretos', detalle: 'Indica qué debes revisar, sin mostrar porcentajes ni detalles de tus gastos. Los montos solo se consultan dentro de la app.' },
  ];
  return <>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Configurar notificaciones" style={estilos.abrir} onPress={abrir}>
      {icono ? <Icon name="bell-outline" size={24} color="#C8005B" /> : <Text style={estilos.enlace}>Notificaciones</Text>}
    </TouchableOpacity>
    <Modal visible={visible} animationType="slide" onRequestClose={() => { if (!estado.guardando) { setVisible(false); } }}>
      <SafeAreaView style={estilos.fondo}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text style={estilos.titulo} accessibilityRole="header">Notificaciones</Text>
          <Text>Elige qué recordatorios quieres recibir en este teléfono.</Text>
          <Text>{estado.permitido ? 'Permiso del teléfono: activado.' : 'Permiso del teléfono: pendiente o desactivado. Se solicitará al guardar.'}</Text>
          {opciones.map(opcion => <View key={opcion.clave} style={estilos.tarjeta}>
            <View style={estilos.fila}>
              <Text style={estilos.subtitulo}>{opcion.titulo}</Text>
              <Switch accessibilityLabel={opcion.titulo} value={borrador[opcion.clave]} disabled={estado.cargando || estado.guardando}
                onValueChange={valor => setBorrador(p => ({ ...p, [opcion.clave]: valor }))} />
            </View>
            <Text>{opcion.detalle}</Text>
          </View>)}
          <Text style={estilos.subtitulo}>Hora de los recordatorios</Text>
          <TextInput accessibilityLabel="Hora de los recordatorios, formato de 24 horas" style={estilos.input} value={borrador.hora}
            placeholder="20:00" maxLength={5} editable={!estado.guardando} onChangeText={hora => setBorrador(p => ({ ...p, hora }))} />
          <Text>Formato de 24 horas, por ejemplo 20:00. El resumen semanal llega cinco minutos después si ambos avisos están activos. El teléfono puede retrasarlos para ahorrar batería.</Text>
          <Text style={estilos.subtitulo}>Día del resumen semanal</Text>
          <View style={estilos.dias}>
            {dias.map((dia, indice) => <TouchableOpacity key={dia} accessibilityRole="radio" accessibilityState={{ checked: borrador.diaSemana === indice }}
              disabled={estado.guardando} style={[estilos.dia, borrador.diaSemana === indice && estilos.seleccionado]} onPress={() => setBorrador(p => ({ ...p, diaSemana: indice }))}>
              <Text>{borrador.diaSemana === indice ? '✓ ' : ''}{dia}</Text>
            </TouchableOpacity>)}
          </View>
          <Text>Los recordatorios se programan para las próximas cuatro semanas y se renuevan cada vez que usas la app. Al pulsar «Cerrar sesión» se cancelan hasta que vuelvas a ingresar.</Text>
          {!!(errorLocal || estado.error) && <Text style={estilos.error} accessibilityRole="alert">{errorLocal || estado.error}</Text>}
          {!!estado.mensaje && <Text accessibilityLiveRegion="polite">{estado.mensaje}</Text>}
          <TouchableOpacity accessibilityRole="button" style={estilos.guardar} disabled={estado.cargando || estado.guardando} onPress={async () => {
            if (!horaValida(borrador.hora)) { setErrorLocal('Escribe una hora válida, por ejemplo 20:00.'); return; }
            setErrorLocal(''); await estado.guardar(borrador);
          }}><Text style={estilos.blanco}>{estado.guardando ? 'Guardando…' : 'Guardar preferencias'}</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={estilos.abrir} onPress={() => { abrirAjustesNotificaciones().catch(() => setErrorLocal('No se pudieron abrir los ajustes del teléfono.')); }}><Text style={estilos.enlace}>Abrir ajustes del teléfono</Text></TouchableOpacity>
          <ContenidoResumenSemanal />
          <TouchableOpacity accessibilityRole="button" style={estilos.abrir} disabled={estado.guardando} onPress={() => setVisible(false)}><Text style={estilos.enlace}>Volver</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#FFFFFF' },
  contenido: { padding: 24, gap: 18 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1A202C' },
  subtitulo: { fontSize: 18, fontWeight: '600', color: '#1A202C' },
  tarjeta: { padding: 16, gap: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  abrir: { minHeight: 48, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  enlace: { color: '#A8004C', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#94A3B8', padding: 14, borderRadius: 12, minHeight: 52, color: '#1A202C' },
  dias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dia: { padding: 12, minHeight: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10 },
  seleccionado: { borderColor: '#C8005B', backgroundColor: '#FFF0F5' },
  guardar: { padding: 16, minHeight: 52, borderRadius: 12, backgroundColor: '#C8005B', alignItems: 'center' },
  blanco: { color: '#FFFFFF', fontWeight: 'bold' },
  error: { color: '#B91C1C' },
});
