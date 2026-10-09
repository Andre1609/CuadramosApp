import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { estilos } from '../styles/estilosPrincipal';


import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto, movimientoVisual } from '../utils/finanzas';
import { cuentas } from '../types/finanzas';

const PantallaPrincipal = ({ navigation }: any) => {
  const { operaciones, cargando, error, recargar } = useFinanzas();
  const misCuentasData = cuentas.map(cuenta => {
    const movimientos = operaciones.filter(op => op.cuentaId === cuenta.id);
    const centimos = movimientos.reduce((total, op) => total + (op.tipo === 'ingreso' ? op.montoCentimos : -op.montoCentimos), 0);
    return { ...cuenta, tipo: 'Cuenta local', saldo: formatoMonto(centimos), centimos, tieneMovimientos: movimientos.length > 0 };
  });
  const total = misCuentasData.reduce((suma, cuenta) => suma + cuenta.centimos, 0);
  const [saldoOculto, setSaldoOculto] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [cuentaActiva, setCuentaActiva] = useState<any>(null);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  const abrirDetalleCuenta = (cuenta: any) => {
    setCuentaActiva(cuenta);
    setModalVisible(true);
  };

  const irARegistrar = () => {
    if (!cuentaActiva) { return; }
    setModalVisible(false);
    navigation.navigate('Registrar', { cuentaId: cuentaActiva.id });
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={estilos.contenedorScroll}>

        <View style={estilos.encabezadoSuperior}>
          <View style={estilos.migasPan}>
            <Text style={estilos.textoMigaInactivo}>Mi billetera  {'>'}  </Text>
            <Text style={estilos.textoMigaActivo}>Inicio</Text>
          </View>
          <View style={estilos.contenedorIconosCabecera}>
            <TouchableOpacity>
              <Icon name="bell-outline" size={24} color="#C8005B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botonPerfilCabecera}
              onPress={() => setModalUsuarioVisible(true)}
            >
              <Text style={estilos.textoPerfilCabecera}>CF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={estilos.cabecera}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={estilos.saludo}>Hola, Carlos </Text>
            <Icon name="hand-wave" size={28} color="#FFB81C" />
          </View>
          <Text style={estilos.subtitulo}>Qué bueno verte. Vamos a poner tus finanzas en orden.</Text>
        </View>

        <View style={estilos.tarjetaMagenta}>
          <View style={estilos.filaSuperiorTarjeta}>
            <View style={estilos.contenedorEtiqueta}>
              <Icon name="wallet-outline" size={20} color="#FFFFFF" style={estilos.iconoCartera} />
              <Text style={estilos.textoEtiqueta}>Tu saldo total</Text>
            </View>
            <TouchableOpacity onPress={() => setSaldoOculto(!saldoOculto)} style={estilos.botonOjo}>
              <Icon name={saldoOculto ? "eye-off-outline" : "eye-outline"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={estilos.contenedorMonto}>
            <Text style={estilos.simboloMoneda}>S/</Text>
            <Text
              style={[estilos.montoTotal, saldoOculto && estilos.montoOculto]}
              numberOfLines={1}
              adjustsFontSizeToFit
              accessibilityLabel={saldoOculto ? 'Saldo oculto' : undefined}
            >
              {saldoOculto ? '••••••' : formatoMonto(total)}
            </Text>
            <Text style={estilos.textoMoneda}>PEN</Text>
          </View>

          <Text style={estilos.textoInformativo}>Todo tu dinero, en un solo lugar.</Text>

          <View style={estilos.filaBotones}>
            <TouchableOpacity style={estilos.botonSecundario}>
              <Text style={estilos.textoBotonSecundario}>📈 Vas por buen camino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botonPrimario}
              onPress={() => navigation.navigate('Registrar')}
            >
              <Text style={estilos.textoBotonPrimario}>+ Registrar operación</Text>
            </TouchableOpacity>
          </View>
        </View>

        {cargando && <Text>Cargando cuentas...</Text>}
        {error && <TouchableOpacity onPress={() => void recargar()}><Text>{error} Toca para reintentar.</Text></TouchableOpacity>}
        {!cargando && !error && !operaciones.length && <Text>Registra tu primera operación para comenzar.</Text>}

        <View style={estilos.seccionCuentas}>
          <View style={estilos.encabezadoSeccion}>
            <Text style={estilos.tituloSeccion}>Mis cuentas</Text>
            <View style={estilos.badgeCuentas}>
              <Text style={estilos.textoBadge}>3</Text>
            </View>
          </View>
          <Text style={estilos.subtituloSeccion}>Un lugar para cada parte de tu vida.</Text>

          {misCuentasData.map((cuenta) => (
            <TouchableOpacity
              key={cuenta.id}
              style={estilos.tarjetaCuenta}
              onPress={() => abrirDetalleCuenta(cuenta)}
            >
              <View style={estilos.ladoIzquierdoCuenta}>
                <View style={[estilos.iconoCuentaContenedor, { backgroundColor: cuenta.colorFondo }]}>
                  <Icon name={cuenta.icono} size={24} color={cuenta.colorIcono} />
                </View>
                <View>
                  <Text style={estilos.tituloCuenta}>{cuenta.nombre}</Text>
                  <Text style={estilos.subtituloCuenta}>{cuenta.tipo}</Text>
                </View>
              </View>

              <View style={estilos.ladoDerechoCuenta}>
                <Text style={estilos.saldoCuenta}>
                  {saldoOculto ? '• • •' : `S/ ${cuenta.saldo}`}
                </Text>
                <Text style={estilos.monedaCuenta}>PEN</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <TouchableOpacity style={estilos.botonChatbotFlotante}>
        <Icon name="robot-outline" size={28} color="#C8005B" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView
          style={estilos.modalFondo}
          blurType="dark"
          blurAmount={3}
          reducedTransparencyFallbackColor="white"
        >
          {cuentaActiva && (
            <View style={estilos.modalContenedor}>

              <View style={estilos.modalCabecera}>
                <Text style={estilos.textoModalEtiqueta}>DETALLE DE TU CUENTA</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={estilos.botonCerrarModal}>
                  <Icon name="close" size={24} color="#1A202C" />
                </TouchableOpacity>
              </View>

              <Text style={estilos.modalTituloCuenta}>{cuentaActiva.nombre}</Text>
              <Text style={estilos.modalSaldoGrande}>S/ {misCuentasData.find(cuenta => cuenta.id === cuentaActiva.id)?.saldo}</Text>

              <View style={estilos.modalEncabezadoTabla}>
                <Text style={[estilos.modalTextoTabla, estilos.columnaMovimientoCuenta]}>Movimiento</Text>
                <Text style={[estilos.modalTextoTabla, estilos.columnaFechaCuenta, estilos.fechaMovimientoCuenta]}>Fecha</Text>
                <Text style={[estilos.modalTextoTabla, estilos.columnaMontoCuenta, estilos.montoMovimientoCuenta]}>Monto</Text>
              </View>

              {!operaciones.some(op => op.cuentaId === cuentaActiva.id) ? (
                <View style={estilos.estadoVacioContenedor}>
                  <Icon name="history" size={40} color="#CBD5E0" />
                  <Text style={estilos.textoVacioTitulo}>Por aquí aún no hay movimientos</Text>
                  <Text style={estilos.textoVacioSubtitulo}>Registra tu primera operación y empieza a cuadrar.</Text>
                </View>
              ) : (
                <ScrollView style={estilos.listaMovimientosCuenta}>
                  {operaciones.filter(op => op.cuentaId === cuentaActiva.id).map(movimientoVisual).map(mov => (
                    <View key={mov.id} style={estilos.filaMovimientoCuenta}>
                      <View style={estilos.columnaMovimientoCuenta}>
                        <Text style={estilos.tituloMovimientoCuenta}>{mov.titulo}</Text>
                        <Text style={estilos.detalleMovimientoCuenta}>{mov.categoria}</Text>
                      </View>
                      <View style={estilos.columnaFechaCuenta}>
                        <Text style={[estilos.detalleMovimientoCuenta, estilos.fechaMovimientoCuenta]}>{mov.fechaDia}</Text>
                        <Text style={[estilos.detalleMovimientoCuenta, estilos.fechaMovimientoCuenta]}>{mov.fechaAnio}</Text>
                      </View>
                      <View style={estilos.columnaMontoCuenta}>
                        <Text style={[estilos.montoMovimientoCuenta, { color: mov.colorMonto }]} numberOfLines={1} adjustsFontSizeToFit>{mov.monto}</Text>
                        <Text style={[estilos.detalleMovimientoCuenta, estilos.montoMovimientoCuenta]}>{mov.tipo}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={estilos.contenedorBotonFijo}>
                <TouchableOpacity style={estilos.botonPrimarioGrande} onPress={irARegistrar}>
                  <Text style={estilos.textoBotonPrimarioGrande}>Registrar una operación</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </BlurView>
      </Modal>
          <Modal
        animationType="slide"
        transparent={true}
        visible={modalUsuarioVisible}
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        <TouchableOpacity style={estilos.modalFondoPerfil} activeOpacity={1} onPressOut={() => setModalUsuarioVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={estilos.modalContenedorUsuario}>

            <View style={estilos.lineaArrastre} />

            <View style={estilos.avatarGrande}>
              <Text style={estilos.textoAvatarGrande}>CF</Text>
            </View>

            <Text style={estilos.nombreUsuarioModal}>Carlos Flores Reyes</Text>

            <View style={estilos.badgeVerificado}>
              <Icon name="check" size={14} color="#1E8E3E" />
              <Text style={estilos.textoBadgeVerificado}>Cuenta verificada</Text>
            </View>

            <View style={estilos.filaDatoUsuario}>
              <Text style={estilos.etiquetaDato}>Nombres</Text>
              <Text style={estilos.valorDato}>Carlos</Text>
            </View>

            <View style={estilos.filaDatoUsuario}>
              <Text style={estilos.etiquetaDato}>Apellidos</Text>
              <Text style={estilos.valorDato}>Flores Reyes</Text>
            </View>

            <View style={estilos.filaDatoUsuario}>
              <Text style={estilos.etiquetaDato}>Celular</Text>
              <Text style={estilos.valorDato}>936 364 474</Text>
            </View>

            <View style={estilos.filaDatoUsuario}>
              <Text style={estilos.etiquetaDato}>Cliente desde</Text>
              <Text style={estilos.valorDato}>Octubre 2026</Text>
            </View>

            <TouchableOpacity style={estilos.botonCerrarSesion} onPress={() => setModalUsuarioVisible(false)}>
              <Text style={estilos.textoBotonCerrarSesion}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PantallaPrincipal;
