import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { estilos } from '../styles/estilosPrincipal';


const misCuentasData = [
  { id: 1, nombre: 'Mi cuenta principal', tipo: 'Cuenta de ahorros', saldo: '3,850.00', colorFondo: '#FFF0F5', colorIcono: '#C8005B', icono: 'wallet-outline', tieneMovimientos: true },
  { id: 2, nombre: 'Mis metas', tipo: 'Cuenta de ahorros', saldo: '1,200.00', colorFondo: '#FFF9E6', colorIcono: '#A67C00', icono: 'target', tieneMovimientos: false },
  { id: 3, nombre: 'Del día a día', tipo: 'Cuenta de ahorros', saldo: '650.00', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', icono: 'credit-card-outline', tieneMovimientos: true },
];

const ultimosMovimientosData = [
  { id: 1, titulo: 'Mercado de la semana', categoria: 'Alimentación', fechaDia: '6 de oct', fechaAnio: '2026', monto: '- S/ 185.00', tipo: 'Egreso', icono: 'shopping-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
  { id: 2, titulo: 'Proyecto freelance', categoria: 'Trabajo', fechaDia: '6 de oct', fechaAnio: '2026', monto: '+ S/ 350.00', tipo: 'Ingreso', icono: 'arrow-bottom-left', colorFondo: '#E6F4EA', colorIcono: '#1E8E3E', colorMonto: '#1E8E3E' },
  { id: 3, titulo: 'Un cafecito y algo más', categoria: 'Comida y bebida', fechaDia: '6 de oct', fechaAnio: '2026', monto: '- S/ 18.50', tipo: 'Egreso', icono: 'coffee-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
  { id: 4, titulo: 'Arriendo de octubre', categoria: 'Hogar', fechaDia: '5 de oct', fechaAnio: '2026', monto: '- S/ 1,200.00', tipo: 'Egreso', icono: 'home-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' }
];

const PantallaPrincipal = ({ navigation }: any) => {
  const [saldoOculto, setSaldoOculto] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [cuentaActiva, setCuentaActiva] = useState<any>(null);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  const abrirDetalleCuenta = (cuenta: any) => {
    setCuentaActiva(cuenta);
    setModalVisible(true);
  };

  const irARegistrar = () => {
    setModalVisible(false);
    navigation.navigate('Registrar');
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
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
            <Text style={estilos.montoTotal}>
              {saldoOculto ? '• • • • • • •' : '5,700.00'}
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

        <View style={estilos.tarjetaDorada}>
          <Icon name="creation" size={90} color="#F6D365" style={estilos.iconoEstrellaDecorativa} />
          <View style={estilos.filaEtiquetaDorada}>
            <Icon name="creation" size={16} color="#A67C00" />
            <Text style={estilos.textoEtiquetaDorada}>UN PASO A LA VEZ</Text>
          </View>
          <Text style={estilos.tituloDorado}>Tu tranquilidad también cuenta.</Text>
          <Text style={estilos.subtituloDorado}>Conocer tu dinero es el primer paso para hacer realidad tus planes.</Text>
          <TouchableOpacity style={estilos.botonDescubre} onPress={() => navigation.navigate('Balance')}>
            <Text style={estilos.textoBotonDescubre}>Descubre cómo vas</Text>
            <Icon name="arrow-right" size={18} color="#A67C00" />
          </TouchableOpacity>
        </View>

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

        <View style={estilos.tarjetaMovimientos}>
          
          <View style={estilos.cabeceraMovimientosSuperior}>
            <Text style={estilos.tituloMovimientos}>Últimos movimientos</Text>
            <TouchableOpacity 
              style={estilos.botonVerTodos}
              onPress={() => navigation.navigate('Historial')}
            >
              <Text style={estilos.textoVerTodos}>Ver todos</Text>
              <Icon name="arrow-right" size={16} color="#C8005B" />
            </TouchableOpacity>
          </View>
          <Text style={estilos.subtituloMovimientos}>Lo que entra y lo que sale, sin enredos.</Text>

          <View style={estilos.encabezadoTablaMov}>
            <Text style={[estilos.textoEncabezadoMov, { flex: 2 }]}>Movimiento</Text>
            <Text style={[estilos.textoEncabezadoMov, { flex: 1, textAlign: 'center' }]}>Fecha</Text>
            <Text style={[estilos.textoEncabezadoMov, { flex: 1.2, textAlign: 'right' }]}>Monto</Text>
          </View>

          {ultimosMovimientosData.map((mov) => (
            <View key={mov.id} style={estilos.filaMovimiento}>
              <View style={estilos.ladoIzquierdoMov}>
                <View style={[estilos.iconoMovContenedor, { backgroundColor: mov.colorFondo }]}>
                  <Icon name={mov.icono} size={20} color={mov.colorIcono} />
                </View>
                <View style={estilos.textosIzquierdaMov}>
                  <Text style={estilos.tituloMov} numberOfLines={1}>{mov.titulo}</Text>
                  <Text style={estilos.categoriaMov}>{mov.categoria}</Text>
                </View>
              </View>
              
              <View style={estilos.centroMov}>
                <Text style={estilos.fechaMov}>{mov.fechaDia}</Text>
                <Text style={estilos.fechaMov}>{mov.fechaAnio}</Text>
              </View>

              <View style={estilos.ladoDerechoMov}>
                <Text style={[estilos.montoMov, { color: mov.colorMonto }]}>{mov.monto}</Text>
                <Text style={estilos.tipoMov}>{mov.tipo}</Text>
              </View>
            </View>
          ))}

          <View style={estilos.pieMovimientos}>
            <View style={estilos.pieIzquierdaMov}>
              <View style={estilos.puntoVerde} />
              <Text style={estilos.textoPieVerde}>Tus movimientos están al día</Text>
            </View>
            <Text style={estilos.textoPieGris}>Así de simple.</Text>
          </View>

        </View>
          <View style={estilos.tarjetaBalance}>
          
          <View style={estilos.cabeceraBalance}>
            <Text style={estilos.tituloBalance}>Tu balance del mes</Text>
            <View style={estilos.selectorMes}>
              <Text style={estilos.textoMes}>Octubre</Text>
            </View>
          </View>

          <View style={estilos.contenedorGrafico}>
            <View style={estilos.anilloGrafico}>
              <Text style={estilos.emojiGrafico}>🤩</Text>
              <Text style={estilos.textoEstadoGrafico}>Saludable</Text>
            </View>
          </View>

          <View style={estilos.contenedorLeyendas}>
            <View style={estilos.filaLeyenda}>
              <View style={estilos.itemLeyenda}>
                <View style={[estilos.puntoLeyenda, { backgroundColor: '#C8005B' }]} />
                <Text style={estilos.textoLeyenda}>Ingresos</Text>
              </View>
              <Text style={estilos.montoLeyenda}>S/ 4,550.00</Text>
            </View>

            <View style={estilos.filaLeyenda}>
              <View style={estilos.itemLeyenda}>
                <View style={[estilos.puntoLeyenda, { backgroundColor: '#FFB81C' }]} />
                <Text style={estilos.textoLeyenda}>Egresos</Text>
              </View>
              <Text style={estilos.montoLeyenda}>S/ 1,436.40</Text>
            </View>
          </View>

          <View style={estilos.alertaVerde}>
            <View style={estilos.puntoVerde} />
            <Text style={estilos.textoAlertaVerde}>¡Vas muy bien!</Text>
          </View>

          <TouchableOpacity 
            style={estilos.botonSaludFinanciera}
            onPress={() => navigation.navigate('Balance')}
          >
            <Text style={estilos.textoBotonSalud}>Ver mi salud financiera</Text>
            <Icon name="arrow-right" size={16} color="#C8005B" />
          </TouchableOpacity>

        </View>

        <View style={estilos.tarjetaFrase}>
          <Icon name="heart-outline" size={20} color="#9F7AEA" />
          <Text style={estilos.textoFrase}>No se trata de tener más. Se trata de vivir mejor con lo que tienes.</Text>
          <Icon name="creation" size={20} color="#9F7AEA" />
        </View>

        <View style={estilos.piePantalla}>
          <View style={[estilos.puntoLeyenda, { backgroundColor: '#A0AEC0', width: 4, height: 4, marginRight: 0 }]} />
          <Text style={estilos.textoPieDemo}>Cada sol cuenta. Vas por excelente camino, Carlos. 🚀</Text>
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
              <Text style={estilos.modalSaldoGrande}>S/ {cuentaActiva.saldo}</Text>

              <View style={estilos.modalEncabezadoTabla}>
                <Text style={[estilos.modalTextoTabla, { flex: 2 }]}>Movimiento</Text>
                <Text style={[estilos.modalTextoTabla, { flex: 1, textAlign: 'center' }]}>Fecha</Text>
                <Text style={[estilos.modalTextoTabla, { flex: 1, textAlign: 'right' }]}>Monto</Text>
              </View>

              {!cuentaActiva.tieneMovimientos ? (
                <View style={estilos.estadoVacioContenedor}>
                  <Icon name="history" size={40} color="#CBD5E0" />
                  <Text style={estilos.textoVacioTitulo}>Por aquí aún no hay movimientos</Text>
                  <Text style={estilos.textoVacioSubtitulo}>Registra tu primera operación y empieza a cuadrar.</Text>
                </View>
              ) : (
                <View style={estilos.estadoVacioContenedor}>
                   <Text style={estilos.textoVacioSubtitulo}>Lista de movimientos lista para conectar...</Text>
                </View>
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