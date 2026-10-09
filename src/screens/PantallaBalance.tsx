import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { estilosBalance } from '../styles/estilosBalance';

import { useFinanzas } from '../context/FinanzasContext';
import { formatoMonto, resumenMes } from '../utils/finanzas';

import SelectorMes from '../components/SelectorMes';
import IndicadorBalance from '../components/IndicadorBalance';
import { claveMes, inicioMes } from '../utils/fechas';

const PantallaBalance = () => {
  const { operaciones, cargando, error, recargar } = useFinanzas();
  const [mes, setMes] = useState(() => claveMes());
  const resumen = resumenMes(operaciones, inicioMes(mes));
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  return (
    <SafeAreaView style={estilosBalance.areaSegura}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={estilosBalance.contenedorScroll} showsVerticalScrollIndicator={false}>

        <View style={estilosBalance.encabezadoSuperior}>
          <View style={estilosBalance.migasPan}>
            <Text style={estilosBalance.textoMigaInactivo}>Mi billetera  {'>'}  </Text>
            <Text style={estilosBalance.textoMigaActivo}>Balance</Text>
          </View>

          <View style={estilosBalance.contenedorIconosCabecera}>
            <TouchableOpacity>
              <Icon name="bell-outline" size={24} color="#C8005B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={estilosBalance.botonPerfilCabecera}
              onPress={() => setModalUsuarioVisible(true)}
            >
              <Text style={estilosBalance.textoPerfilCabecera}>CF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={estilosBalance.cabeceraPantalla}>
          <Text style={estilosBalance.tituloPantalla}>Así se sienten tus finanzas.</Text>
          <Text style={estilosBalance.subtituloPantalla}>Más allá de los números, está tu tranquilidad.</Text>
        </View>

        {cargando && <Text>Cargando operaciones...</Text>}
        {error && <TouchableOpacity onPress={() => void recargar()}><Text>{error} Toca para reintentar.</Text></TouchableOpacity>}
        <View style={estilosBalance.tarjetaBalance}>

          <View style={estilosBalance.cabeceraSelector}>
            <Text style={estilosBalance.tituloTarjeta}>Resumen del mes</Text>
            <SelectorMes valor={mes} cambiar={setMes} />
          </View>

          <IndicadorBalance ingresos={resumen.ingresos} egresos={resumen.egresos} />

          <View style={estilosBalance.filaTarjetasPequeñas}>
            <View style={[estilosBalance.tarjetaPequeña, { marginRight: 8 }]}>
              <View style={estilosBalance.iconoPequeñoEntrada}>
                <Icon name="arrow-bottom-left" size={16} color="#1E8E3E" />
              </View>
              <Text style={estilosBalance.etiquetaPequeña}>Lo que entró</Text>
              <Text style={estilosBalance.montoPequeño}>S/ {formatoMonto(resumen.ingresos)}</Text>
              <Text style={estilosBalance.subtextoPequeño}>Total de ingresos del mes</Text>
            </View>

            <View style={[estilosBalance.tarjetaPequeña, { marginLeft: 8 }]}>
              <View style={estilosBalance.iconoPequeñoSalida}>
                <Icon name="arrow-top-right" size={16} color="#C8005B" />
              </View>
              <Text style={estilosBalance.etiquetaPequeña}>Lo que salió</Text>
              <Text style={estilosBalance.montoPequeño}>S/ {formatoMonto(resumen.egresos)}</Text>
              <Text style={estilosBalance.subtextoPequeño}>{resumen.porcentaje}</Text>
            </View>
          </View>

          <View style={estilosBalance.tarjetaBalanceNeto}>
            <Text style={estilosBalance.etiquetaBalanceNeto}>Tu balance neto</Text>
            <View style={estilosBalance.filaMontoNeto}>
              <Icon name="rhombus" size={16} color="#FFB81C" />
              <Text style={estilosBalance.montoNeto}>S/ {formatoMonto(resumen.neto)}</Text>
            </View>
            <Text style={estilosBalance.subtextoPequeño}>Ingresos menos egresos</Text>
          </View>

        </View>

        <Text style={estilosBalance.tituloPensado}>Pensado para ti</Text>
        <Text style={estilosBalance.subtituloPensado}>Ideas para cuadrar mejor tu dinero</Text>

        <View style={estilosBalance.tarjetaSugerencia}>
          <View style={estilosBalance.filaSugerenciaCabecera}>
            <Text style={estilosBalance.iconoSugerencia}>🐷</Text>
            <Text style={estilosBalance.tituloSugerencia}>Ahorro sugerido</Text>
          </View>
          <Text style={estilosBalance.montoSugerencia}>S/ {formatoMonto(resumen.ahorro)}</Text>
          <Text style={estilosBalance.textoSugerencia}>Si apartas el 20% de tu balance neto de este periodo.</Text>
        </View>

        <View style={estilosBalance.tarjetaSugerencia}>
          <View style={estilosBalance.filaSugerenciaCabecera}>
            <Text style={estilosBalance.iconoSugerencia}>🐜</Text>
            <Text style={estilosBalance.tituloSugerencia}>Gastos hormiga</Text>
          </View>
          <Text style={estilosBalance.montoSugerencia}>S/ {formatoMonto(resumen.gastosHormiga)}</Text>
          <Text style={estilosBalance.textoSugerencia}>{resumen.cantidadHormiga} compras pequeñas (menos de S/ 20) que se suman sin que lo notes.</Text>
        </View>
        <Text style={estilosBalance.textoNota}>
          Consulta tus movimientos para conocer cómo va tu mes.
        </Text>

      </ScrollView>

      <TouchableOpacity style={estilosBalance.botonChatbotFlotante}>
        <Icon name="robot-outline" size={28} color="#C8005B" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUsuarioVisible}
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        <TouchableOpacity
          style={estilosBalance.modalFondo}
          activeOpacity={1}
          onPressOut={() => setModalUsuarioVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={estilosBalance.modalContenedorUsuario}>

            <View style={estilosBalance.lineaArrastre} />

            <View style={estilosBalance.avatarGrande}>
              <Text style={estilosBalance.textoAvatarGrande}>CF</Text>
            </View>

            <Text style={estilosBalance.nombreUsuarioModal}>Carlos Flores Reyes</Text>

            <View style={estilosBalance.badgeVerificado}>
              <Icon name="check" size={14} color="#1E8E3E" />
              <Text style={estilosBalance.textoBadgeVerificado}>Cuenta verificada</Text>
            </View>

            <View style={estilosBalance.filaDatoUsuario}>
              <Text style={estilosBalance.etiquetaDato}>Nombres</Text>
              <Text style={estilosBalance.valorDato}>Carlos</Text>
            </View>

            <View style={estilosBalance.filaDatoUsuario}>
              <Text style={estilosBalance.etiquetaDato}>Apellidos</Text>
              <Text style={estilosBalance.valorDato}>Flores Reyes</Text>
            </View>

            <View style={estilosBalance.filaDatoUsuario}>
              <Text style={estilosBalance.etiquetaDato}>Celular</Text>
              <Text style={estilosBalance.valorDato}>936 364 474</Text>
            </View>

            <View style={estilosBalance.filaDatoUsuario}>
              <Text style={estilosBalance.etiquetaDato}>Cliente desde</Text>
              <Text style={estilosBalance.valorDato}>Octubre 2026</Text>
            </View>

            <TouchableOpacity
              style={estilosBalance.botonCerrarSesion}
              onPress={() => setModalUsuarioVisible(false)}
            >
              <Text style={estilosBalance.textoBotonCerrarSesion}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default PantallaBalance;
