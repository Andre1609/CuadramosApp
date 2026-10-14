import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { exportarReporte } from '../services/exportarReporte';
import { etiquetaMes } from '../utils/fechas';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { estilosHistorial } from '../styles/estilosHistorial';
import { estilosRegistrar } from '../styles/estilosRegistrar';

import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto, movimientoVisual } from '../utils/finanzas';
import {
  agruparOperaciones,
  normalizarTexto,
  type ModoAgrupacion,
} from '../utils/agruparOperaciones';
import EditarOperacion from '../components/EditarOperacion';

import SelectorMes from '../components/SelectorMes';
import { claveMes } from '../utils/fechas';

const PantallaHistorial = () => {
  const { operaciones, cargando, error, recargar } = useFinanzas();
  const [operacionId, setOperacionId] = useState<string | null>(null);
  const operacionSeleccionada = operaciones.find(op => op.id === operacionId);
  const [mes, setMes] = useState('');
  const [exportando, setExportando] = useState(false);
  const exportacionOcupada = useRef(false);
  const confirmarExportacion = () => {
    if (exportacionOcupada.current || cargando || error) {
      return;
    }
    const periodo = mes ? etiquetaMes(mes) : 'Todos los meses';
    const copia = [...operaciones];
    const mesReporte = mes;
    Alert.alert(
      'Exportar reporte PDF',
      `Periodo: ${periodo}. Se incluirán todos los ingresos y egresos de este periodo, sin aplicar la búsqueda ni el filtro por tipo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar PDF',
          onPress: async () => {
            if (exportacionOcupada.current) {
              return;
            }
            exportacionOcupada.current = true;
            setExportando(true);
            try {
              await exportarReporte(copia, mesReporte);
            } catch {
              Alert.alert(
                'No se pudo exportar',
                'Inténtalo nuevamente. Si acabas de actualizar la app, recompílala para habilitar la función de compartir PDF.',
              );
            } finally {
              exportacionOcupada.current = false;
              setExportando(false);
            }
          },
        },
      ],
    );
  };
  const [busqueda, setBusqueda] = useState('');
  const [filtroTab, setFiltroTab] = useState('todos');
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  const [modoVista, setModoVista] = useState<'individual' | ModoAgrupacion>(
    'individual',
  );

  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);

  // Aplicar filtros sobre las operaciones originales.
  const operacionesFiltradas = operaciones.filter(op => {
    if (mes && claveMes(new Date(op.fecha)) !== mes) {
      return false;
    }
    if (filtroTab === 'ingresos' && op.tipo !== 'ingreso') {
      return false;
    }
    if (filtroTab === 'egresos' && op.tipo !== 'egreso') {
      return false;
    }
    const texto = normalizarTexto(`${op.concepto} ${op.categoria}`);
    return texto.includes(normalizarTexto(busqueda));
  });
  const movimientosFiltrados = operacionesFiltradas.map(movimientoVisual);
  const grupos =
    modoVista === 'individual'
      ? []
      : agruparOperaciones(operacionesFiltradas, modoVista);
  return (
    <SafeAreaView style={estilosHistorial.areaSegura}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={estilosHistorial.contenedorScroll}>
        <View style={estilosHistorial.encabezadoSuperior}>
          <View style={estilosHistorial.migasPan}>
            <Text style={estilosHistorial.textoMigaInactivo}>
              Mi billetera {'>'}{' '}
            </Text>
            <Text style={estilosHistorial.textoMigaActivo}>Historial</Text>
          </View>
          <View style={estilosRegistrar.contenedorIconosCabecera}>
            <TouchableOpacity>
              <Icon name="bell-outline" size={24} color="#C8005B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={estilosRegistrar.botonPerfilCabecera}
              onPress={() => setModalUsuarioVisible(true)}
            >
              <Text style={estilosRegistrar.textoPerfilCabecera}>CF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={estilosHistorial.cabeceraPantalla}>
          <Text style={estilosHistorial.tituloPantalla}>
            Tu dinero tiene historia.
          </Text>
          <Text style={estilosHistorial.subtituloPantalla}>
            Cada ingreso y cada gasto, claros y en un solo lugar.
          </Text>
        </View>

        {filtroTab === 'todos' && (
          <TouchableOpacity
            style={estilosHistorial.botonDescargar}
            onPress={confirmarExportacion}
            disabled={exportando || cargando || !!error}
            accessibilityRole="button"
          >
            <Icon name="download-outline" size={20} color="#1A202C" />
            <Text style={estilosHistorial.textoBotonDescargar}>
              {exportando ? 'Generando reporte...' : 'Exportar reporte PDF'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={estilosHistorial.tarjetaPrincipal}>
          <View style={estilosHistorial.contenedorTabs}>
            <TouchableOpacity
              style={[
                estilosHistorial.tab,
                filtroTab === 'todos' && estilosHistorial.tabActivo,
              ]}
              onPress={() => setFiltroTab('todos')}
            >
              <Text
                style={
                  filtroTab === 'todos'
                    ? estilosHistorial.textoTabActivo
                    : estilosHistorial.textoTab
                }
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                estilosHistorial.tab,
                filtroTab === 'ingresos' && estilosHistorial.tabActivo,
              ]}
              onPress={() => setFiltroTab('ingresos')}
            >
              <Text
                style={
                  filtroTab === 'ingresos'
                    ? estilosHistorial.textoTabActivo
                    : estilosHistorial.textoTab
                }
              >
                Ingresos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                estilosHistorial.tab,
                filtroTab === 'egresos' && estilosHistorial.tabActivo,
              ]}
              onPress={() => setFiltroTab('egresos')}
            >
              <Text
                style={
                  filtroTab === 'egresos'
                    ? estilosHistorial.textoTabActivo
                    : estilosHistorial.textoTab
                }
              >
                Egresos
              </Text>
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
          <View style={estilosHistorial.contenedorModoVista}>
            {(
              [
                ['individual', 'Individual'],
                ['concepto', 'Por concepto'],
                ['categoria', 'Por categoría'],
              ] as const
            ).map(([valor, texto]) => (
              <TouchableOpacity
                key={valor}
                accessibilityRole="button"
                accessibilityState={{
                  selected: modoVista === valor,
                }}
                style={[
                  estilosHistorial.botonModoVista,
                  modoVista === valor && estilosHistorial.botonModoVistaActivo,
                ]}
                onPress={() => {
                  setModoVista(valor);
                  setGrupoAbierto(null);
                }}
              >
                <Text
                  style={
                    modoVista === valor
                      ? estilosHistorial.textoModoVistaActivo
                      : estilosHistorial.textoModoVista
                  }
                >
                  {texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={estilosHistorial.encabezadoTabla}>
            {modoVista === 'individual' ? (
              <>
                <Text style={[estilosHistorial.textoEncabezado, { flex: 2 }]}>
                  Movimiento
                </Text>

                <Text
                  style={[
                    estilosHistorial.textoEncabezado,
                    { flex: 1, textAlign: 'center' },
                  ]}
                >
                  Fecha
                </Text>

                <Text
                  style={[
                    estilosHistorial.textoEncabezado,
                    { flex: 1.2, textAlign: 'right' },
                  ]}
                >
                  Monto
                </Text>
              </>
            ) : (
              <>
                <Text style={estilosHistorial.textoEncabezado}>
                  {modoVista === 'concepto' ? 'Concepto' : 'Categoría'}
                </Text>

                <Text style={estilosHistorial.textoEncabezado}>Total</Text>
              </>
            )}
          </View>

          {cargando && <Text>Cargando operaciones...</Text>}
          {error && (
            <TouchableOpacity onPress={() => void recargar()}>
              <Text>{error} Toca para reintentar.</Text>
            </TouchableOpacity>
          )}
          {!cargando && !error && !movimientosFiltrados.length && (
            <Text>No hay movimientos para mostrar.</Text>
          )}
          {modoVista === 'individual'
            ? movimientosFiltrados.map(mov => (
                <TouchableOpacity
                  key={mov.id}
                  style={estilosHistorial.filaMovimiento}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${mov.titulo}`}
                  disabled={cargando || !!error}
                  onPress={() => setOperacionId(mov.id)}
                >
                  <View style={estilosHistorial.ladoIzquierdo}>
                    <View
                      style={[
                        estilosHistorial.iconoContenedor,
                        { backgroundColor: mov.colorFondo },
                      ]}
                    >
                      <Icon name={mov.icono} size={20} color={mov.colorIcono} />
                    </View>
                    <View style={estilosHistorial.textosIzquierda}>
                      <Text
                        style={estilosHistorial.tituloMovimiento}
                        numberOfLines={1}
                      >
                        {mov.titulo}
                      </Text>
                      <Text style={estilosHistorial.categoriaMovimiento}>
                        {mov.categoria}
                      </Text>
                    </View>
                  </View>

                  <View style={estilosHistorial.centroMovimiento}>
                    <Text style={estilosHistorial.fechaTexto}>
                      {mov.fechaDia}
                    </Text>
                    <Text style={estilosHistorial.fechaTexto}>
                      {mov.fechaAnio}
                    </Text>
                  </View>

                  <View style={estilosHistorial.ladoDerecho}>
                    <Text
                      style={[
                        estilosHistorial.montoTexto,
                        { color: mov.colorMonto },
                      ]}
                    >
                      {mov.monto}
                    </Text>
                    <Text style={estilosHistorial.tipoTexto}>{mov.tipo}</Text>
                  </View>
                </TouchableOpacity>
              ))
            : grupos.map(grupo => {
                const ingreso = grupo.tipo === 'ingreso';
                const color = ingreso ? '#1E8E3E' : '#C8005B';
                const abierto = grupoAbierto === grupo.clave;

                return (
                  <View
                    key={grupo.clave}
                    style={estilosHistorial.grupoContenedor}
                  >
                    <TouchableOpacity
                      style={estilosHistorial.grupoCabecera}
                      onPress={() =>
                        setGrupoAbierto(abierto ? null : grupo.clave)
                      }
                    >
                      <View style={estilosHistorial.grupoTexto}>
                        <Text
                          style={estilosHistorial.grupoTitulo}
                          numberOfLines={1}
                        >
                          {grupo.titulo}
                        </Text>

                        <Text style={estilosHistorial.grupoSubtitulo}>
                          {grupo.movimientos.length}{' '}
                          {grupo.movimientos.length === 1
                            ? 'movimiento'
                            : 'movimientos'}
                          {' · '}
                          {grupo.categoria}
                        </Text>
                      </View>

                      <View style={estilosHistorial.grupoDerecha}>
                        <Text style={[estilosHistorial.grupoTotal, { color }]}>
                          {ingreso ? '+' : '-'} S/{' '}
                          {formatoMonto(grupo.totalCentimos)}
                        </Text>

                        <Icon
                          name={abierto ? 'chevron-up' : 'chevron-down'}
                          size={19}
                          color="#718096"
                        />
                      </View>
                    </TouchableOpacity>
                    {abierto &&
                      grupo.movimientos.map(op => {
                        const mov = movimientoVisual(op);
                        return (
                          <TouchableOpacity
                            key={op.id}
                            style={estilosHistorial.grupoDetalle}
                            onPress={() => setOperacionId(op.id)}
                          >
                            <View style={estilosHistorial.grupoDetalleTexto}>
                              <Text
                                style={estilosHistorial.grupoDetalleTitulo}
                                numberOfLines={1}
                              >
                                {mov.titulo}
                              </Text>
                              <Text style={estilosHistorial.grupoDetalleFecha}>
                                {mov.fechaDia} {mov.fechaAnio}
                              </Text>
                            </View>
                            <Text
                              style={[
                                estilosHistorial.grupoDetalleMonto,
                                { color: mov.colorMonto },
                              ]}
                            >
                              {mov.monto}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                );
              })}
          <View style={estilosHistorial.pieTarjeta}>
            <Text style={estilosHistorial.textoPieFuerte}>
              {movimientosFiltrados.length} movimientos
              {modoVista !== 'individual' ? ` · ${grupos.length} grupos` : ''}
            </Text>
            <Text style={estilosHistorial.textoPieSuave}>
              Todos los montos en Soles peruanos
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={estilosHistorial.botonChatbotFlotante}>
        <Icon name="robot-outline" size={28} color="#C8005B" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUsuarioVisible}
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        <TouchableOpacity
          style={estilosRegistrar.modalFondo}
          activeOpacity={1}
          onPressOut={() => setModalUsuarioVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={estilosRegistrar.modalContenedorUsuario}
          >
            <View style={estilosRegistrar.lineaArrastre} />

            <View style={estilosRegistrar.avatarGrande}>
              <Text style={estilosRegistrar.textoAvatarGrande}>CF</Text>
            </View>

            <Text style={estilosRegistrar.nombreUsuarioModal}>
              Carlos Flores Reyes
            </Text>

            <View style={estilosRegistrar.badgeVerificado}>
              <Icon name="check" size={14} color="#1E8E3E" />
              <Text style={estilosRegistrar.textoBadgeVerificado}>
                Cuenta verificada
              </Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Nombres</Text>
              <Text style={estilosRegistrar.valorDato}>Carlos</Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Apellidos</Text>
              <Text style={estilosRegistrar.valorDato}>Flores Reyes</Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Celular</Text>
              <Text style={estilosRegistrar.valorDato}>936 364 474</Text>
            </View>

            <View style={estilosRegistrar.filaDatoUsuario}>
              <Text style={estilosRegistrar.etiquetaDato}>Cliente desde</Text>
              <Text style={estilosRegistrar.valorDato}>Octubre 2026</Text>
            </View>

            <TouchableOpacity
              style={estilosRegistrar.botonCerrarSesion}
              onPress={() => setModalUsuarioVisible(false)}
            >
              <Text style={estilosRegistrar.textoBotonCerrarSesion}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {operacionSeleccionada && (
        <EditarOperacion
          key={operacionSeleccionada.id}
          operacion={operacionSeleccionada}
          cerrar={() => setOperacionId(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default PantallaHistorial;
