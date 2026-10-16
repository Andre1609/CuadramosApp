import AjustesNotificaciones from '../components/AjustesNotificaciones';
import { ContenidoResumenSemanal } from '../components/AjustesNotificaciones';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { PestanasPrincipales } from '../types/navegacion';
import Modal from '../components/ModalSeguro';
import { SafeAreaView } from 'react-native-safe-area-context';
import AjustesTexto from '../components/AjustesTexto';
import AjusteTeclado from '../components/atoms/AjusteTeclado';
import { useLecturaAmplia } from '../context/TextoContext';
import { Text, TextInput } from '../components/atoms/Texto';
import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { exportarReporte } from '../services/exportarReporte';
import { etiquetaMes } from '../utils/fechas';
import { View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { estilosHistorial } from '../styles/estilosHistorial';
import AsistenteFlotante from '../components/AsistenteFlotante';
import { estilosRegistrar } from '../styles/estilosRegistrar';

import { useFinanzas } from '../context/FinanzasContext';
import { movimientoVisual } from '../utils/finanzas';
import EditarOperacion from '../components/EditarOperacion';


import SelectorMes from '../components/SelectorMes';
import { claveMes } from '../utils/fechas';
import { useAuth } from '../context/AuthContext';

const PantallaHistorial = ({ route }: BottomTabScreenProps<PestanasPrincipales, 'Historial'>) => {
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  useEffect(() => {
    if (route.params?.resumenSemanal) { scroll.current?.scrollTo({ y: 0, animated: false }); }
  }, [route.params?.resumenSemanal]);
  const lecturaAmplia = useLecturaAmplia();
  const { operaciones, cargando, error, recargar } = useFinanzas();
  const { nombre, iniciales, usuario, cerrarSesion } = useAuth();
  const [operacionId, setOperacionId] = useState<string | null>(null);
  const operacionSeleccionada = operaciones.find(op => op.id === operacionId);
  const [mes, setMes] = useState('');
  const [exportando, setExportando] = useState(false);
  const exportacionOcupada = useRef(false);
  const confirmarExportacion = () => {
    if (exportacionOcupada.current || cargando || error) { return; }
    const periodo = mes ? etiquetaMes(mes) : 'Todos los meses';
    const copia = [...operaciones];
    const mesReporte = mes;
    Alert.alert('Exportar reporte PDF',
      `Periodo: ${periodo}. Se incluirán todos los ingresos y egresos de este periodo, sin aplicar la búsqueda ni el filtro por tipo.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Generar PDF', onPress: async () => {
          if (exportacionOcupada.current) { return; }
          exportacionOcupada.current = true;
          setExportando(true);
          try { await exportarReporte(copia, mesReporte, nombre); }
          catch { Alert.alert('No se pudo exportar', 'Inténtalo nuevamente. Si acabas de actualizar la app, recompílala para habilitar la función de compartir PDF.'); }
          finally { exportacionOcupada.current = false; setExportando(false); }
        } },
      ]);
  };
  const todosLosMovimientos = operaciones.filter(op => !mes || claveMes(new Date(op.fecha)) === mes).map(movimientoVisual);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTab, setFiltroTab] = useState('todos');
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  // Lógica de filtrado visual
  const movimientosFiltrados = todosLosMovimientos.filter(mov => {
    if (!`${mov.titulo} ${mov.categoria}`.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())) { return false; }
    if (filtroTab === 'todos') return true;
    if (filtroTab === 'ingresos') return mov.tipo === 'Ingreso';
    if (filtroTab === 'egresos') return mov.tipo === 'Egreso';
    return true;
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={estilosHistorial.areaSegura}>
      <StatusBar barStyle="dark-content" />

      <AjusteTeclado>
      <ScrollView ref={scroll} contentContainerStyle={estilosHistorial.contenedorScroll}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>

        <View style={estilosHistorial.encabezadoSuperior}>
          <View style={estilosHistorial.migasPan}>
            <Text style={estilosHistorial.textoMigaInactivo}>Mi billetera  {'>'}  </Text>
            <Text style={estilosHistorial.textoMigaActivo}>Historial</Text>
          </View>
          <View style={estilosRegistrar.contenedorIconosCabecera}>
            <AjustesNotificaciones icono />

            <TouchableOpacity
              style={estilosRegistrar.botonPerfilCabecera}
              onPress={() => setModalUsuarioVisible(true)}
            >
              <Text style={estilosRegistrar.textoPerfilCabecera}>{iniciales}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!route.params?.resumenSemanal && <ContenidoResumenSemanal />}
        <View style={estilosHistorial.cabeceraPantalla}>
          <Text style={estilosHistorial.tituloPantalla}>Tu dinero tiene historia.</Text>
          <Text style={estilosHistorial.subtituloPantalla}>Cada ingreso y cada gasto, claros y en un solo lugar.</Text>
        </View>

        {filtroTab === 'todos' && <TouchableOpacity style={estilosHistorial.botonDescargar} onPress={confirmarExportacion} disabled={exportando || cargando || !!error} accessibilityRole="button">
          <Icon name="download-outline" size={20} color="#1A202C" />
          <Text style={estilosHistorial.textoBotonDescargar}>{exportando ? 'Generando reporte...' : 'Exportar reporte PDF'}</Text>
        </TouchableOpacity>}

        <View style={estilosHistorial.tarjetaPrincipal}>

          <View style={estilosHistorial.contenedorTabs}>
            <TouchableOpacity
              style={[estilosHistorial.tab, filtroTab === 'todos' && estilosHistorial.tabActivo]}
              onPress={() => setFiltroTab('todos')}
            >
              <Text style={filtroTab === 'todos' ? estilosHistorial.textoTabActivo : estilosHistorial.textoTab}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[estilosHistorial.tab, filtroTab === 'ingresos' && estilosHistorial.tabActivo]}
              onPress={() => setFiltroTab('ingresos')}
            >
              <Text style={filtroTab === 'ingresos' ? estilosHistorial.textoTabActivo : estilosHistorial.textoTab}>Ingresos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[estilosHistorial.tab, filtroTab === 'egresos' && estilosHistorial.tabActivo]}
              onPress={() => setFiltroTab('egresos')}
            >
              <Text style={filtroTab === 'egresos' ? estilosHistorial.textoTabActivo : estilosHistorial.textoTab}>Egresos</Text>
            </TouchableOpacity>
          </View>

          <View style={estilosHistorial.filaBuscador}>
            <View style={estilosHistorial.cajaBuscador}>
              <Icon name="magnify" size={20} color="#A0AEC0" />
              <TextInput
                style={estilosHistorial.inputBuscador}
                placeholder="Buscar movimiento"
                value={busqueda}
                onChangeText={setBusqueda}
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <SelectorMes valor={mes} cambiar={setMes} permitirTodos />
          </View>

          {!lecturaAmplia && <View style={estilosHistorial.encabezadoTabla}>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 2 }]}>Movimiento</Text>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 1, textAlign: 'center' }]}>Fecha</Text>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 1.2, textAlign: 'right' }]}>Monto</Text>
          </View>}

          {cargando && <Text>Cargando operaciones...</Text>}
          {error && <TouchableOpacity onPress={() => void recargar()}><Text>{error} Toca para reintentar.</Text></TouchableOpacity>}
          {!cargando && !error && !movimientosFiltrados.length && <Text>No hay movimientos para mostrar.</Text>}
          {movimientosFiltrados.map((mov) => (
            <TouchableOpacity key={mov.id} style={[estilosHistorial.filaMovimiento, lecturaAmplia && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}
              accessibilityRole="button" accessibilityLabel={`Editar ${mov.titulo}`}
              disabled={cargando || !!error} onPress={() => setOperacionId(mov.id)}>
              <View style={estilosHistorial.ladoIzquierdo}>
                <View style={[estilosHistorial.iconoContenedor, { backgroundColor: mov.colorFondo }]}>
                  <Icon name={mov.icono} size={20} color={mov.colorIcono} />
                </View>
                <View style={estilosHistorial.textosIzquierda}>
                  <Text style={estilosHistorial.tituloMovimiento}>{mov.titulo}</Text>
                  <Text style={estilosHistorial.categoriaMovimiento}>{mov.categoria}</Text>
                </View>
              </View>

              <View style={estilosHistorial.centroMovimiento}>
                <Text style={estilosHistorial.fechaTexto}>{mov.fechaDia}</Text>
                <Text style={estilosHistorial.fechaTexto}>{mov.fechaAnio}</Text>
              </View>

              <View style={estilosHistorial.ladoDerecho}>
                <Text style={[estilosHistorial.montoTexto, { color: mov.colorMonto }]}>{mov.monto}</Text>
                <Text style={estilosHistorial.tipoTexto}>{mov.tipo}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={estilosHistorial.pieTarjeta}>
            <Text style={estilosHistorial.textoPieFuerte}>{movimientosFiltrados.length} movimientos</Text>
            <Text style={estilosHistorial.textoPieSuave}>Todos los montos en Soles peruanos</Text>
          </View>

        </View>

      </ScrollView>
      </AjusteTeclado>

      <AsistenteFlotante estiloBoton={estilosHistorial.botonChatbotFlotante} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUsuarioVisible}
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        <TouchableOpacity style={estilosRegistrar.modalFondo} activeOpacity={1} onPress={() => setModalUsuarioVisible(false)}>
          <ScrollView style={{ maxHeight: '90%' }} contentContainerStyle={estilosRegistrar.modalContenedorUsuario} keyboardShouldPersistTaps="handled">

            <View style={estilosRegistrar.lineaArrastre} />

            <View style={estilosRegistrar.avatarGrande}>
              <Text style={estilosRegistrar.textoAvatarGrande}>{iniciales}</Text>
            </View>

            <Text style={estilosRegistrar.nombreUsuarioModal}>{nombre}</Text>

            <View style={estilosRegistrar.badgeVerificado}>
              <Icon name="check" size={14} color="#1E8E3E" />
              <Text style={estilosRegistrar.textoBadgeVerificado}>Cuenta verificada</Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Usuario</Text>
              <Text style={estilosRegistrar.valorDato}>{nombre}</Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Cliente desde</Text>
              <Text style={estilosRegistrar.valorDato}>{new Date(usuario?.created_at ?? Date.now()).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</Text>
            </View>

            <AjustesTexto />
            <AjustesNotificaciones />
            <TouchableOpacity style={estilosRegistrar.botonCerrarSesion} onPress={async () => {
                setModalUsuarioVisible(false);
                await cerrarSesion();}}>
              <Text style={estilosRegistrar.textoBotonCerrarSesion}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </ScrollView>
        </TouchableOpacity>
      </Modal>
      {operacionSeleccionada && <EditarOperacion key={operacionSeleccionada.id} operacion={operacionSeleccionada} cerrar={() => setOperacionId(null)} />}
    </SafeAreaView>
  );
};

export default PantallaHistorial;
