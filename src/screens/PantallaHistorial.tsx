import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, StatusBar, Modal } from 'react-native';import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { estilosHistorial } from '../styles/estilosHistorial';
import { estilosRegistrar } from '../styles/estilosRegistrar';

const todosLosMovimientos = [
  { id: 1, titulo: 'Mercado de la semana', categoria: 'Alimentación', fechaDia: '3 de oct', fechaAnio: '2026', monto: '- S/ 185.00', tipo: 'Egreso', icono: 'shopping-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
  { id: 2, titulo: 'Proyecto freelance', categoria: 'Trabajo', fechaDia: '3 de oct', fechaAnio: '2026', monto: '+ S/ 350.00', tipo: 'Ingreso', icono: 'arrow-bottom-left', colorFondo: '#E6F4EA', colorIcono: '#1E8E3E', colorMonto: '#1E8E3E' },
  { id: 3, titulo: 'Un cafecito y algo más', categoria: 'Comida y bebida', fechaDia: '2 de oct', fechaAnio: '2026', monto: '- S/ 18.50', tipo: 'Egreso', icono: 'coffee-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
  { id: 4, titulo: 'Arriendo de octubre', categoria: 'Hogar', fechaDia: '2 de oct', fechaAnio: '2026', monto: '- S/ 1,200.00', tipo: 'Egreso', icono: 'home-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
  { id: 5, titulo: 'Pago de nómina', categoria: 'Salario', fechaDia: '1 de oct', fechaAnio: '2026', monto: '+ S/ 4,200.00', tipo: 'Ingreso', icono: 'arrow-bottom-left', colorFondo: '#E6F4EA', colorIcono: '#1E8E3E', colorMonto: '#1E8E3E' },
  { id: 6, titulo: 'Suscripción de música', categoria: 'Entretenimiento', fechaDia: '1 de oct', fechaAnio: '2026', monto: '- S/ 32.90', tipo: 'Egreso', icono: 'music-note-outline', colorFondo: '#F0F0FF', colorIcono: '#5C5C99', colorMonto: '#C8005B' },
];

const PantallaHistorial = () => {
  const [filtroTab, setFiltroTab] = useState('todos');
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  // Lógica de filtrado visual
  const movimientosFiltrados = todosLosMovimientos.filter(mov => {
    if (filtroTab === 'todos') return true;
    if (filtroTab === 'ingresos') return mov.tipo === 'Ingreso';
    if (filtroTab === 'egresos') return mov.tipo === 'Egreso';
    return true;
  });

  return (
    <SafeAreaView style={estilosHistorial.areaSegura}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView contentContainerStyle={estilosHistorial.contenedorScroll}>
        
        <View style={estilosHistorial.encabezadoSuperior}>
          <View style={estilosHistorial.migasPan}>
            <Text style={estilosHistorial.textoMigaInactivo}>Mi billetera  {'>'}  </Text>
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
          <Text style={estilosHistorial.tituloPantalla}>Tu dinero tiene historia.</Text>
          <Text style={estilosHistorial.subtituloPantalla}>Cada ingreso y cada gasto, claros y en un solo lugar.</Text>
        </View>

        <TouchableOpacity style={estilosHistorial.botonDescargar}>
          <Icon name="download-outline" size={20} color="#1A202C" />
          <Text style={estilosHistorial.textoBotonDescargar}>Descargar PDF</Text>
        </TouchableOpacity>

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
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <TouchableOpacity style={estilosHistorial.cajaMes}>
              <Text style={estilosHistorial.textoMes}>Octubre 2026</Text>
              <Icon name="chevron-down" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>

          <View style={estilosHistorial.encabezadoTabla}>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 2 }]}>Movimiento</Text>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 1, textAlign: 'center' }]}>Fecha</Text>
            <Text style={[estilosHistorial.textoEncabezado, { flex: 1.2, textAlign: 'right' }]}>Monto</Text>
          </View>

          {movimientosFiltrados.map((mov) => (
            <View key={mov.id} style={estilosHistorial.filaMovimiento}>
              <View style={estilosHistorial.ladoIzquierdo}>
                <View style={[estilosHistorial.iconoContenedor, { backgroundColor: mov.colorFondo }]}>
                  <Icon name={mov.icono} size={20} color={mov.colorIcono} />
                </View>
                <View style={estilosHistorial.textosIzquierda}>
                  <Text style={estilosHistorial.tituloMovimiento} numberOfLines={1}>{mov.titulo}</Text>
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
            </View>
          ))}

          <View style={estilosHistorial.pieTarjeta}>
            <Text style={estilosHistorial.textoPieFuerte}>{movimientosFiltrados.length} movimientos</Text>
            <Text style={estilosHistorial.textoPieSuave}>Todos los montos en Soles peruanos</Text>
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
        <TouchableOpacity style={estilosRegistrar.modalFondo} activeOpacity={1} onPressOut={() => setModalUsuarioVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={estilosRegistrar.modalContenedorUsuario}>
            
            <View style={estilosRegistrar.lineaArrastre} />

            <View style={estilosRegistrar.avatarGrande}>
              <Text style={estilosRegistrar.textoAvatarGrande}>CF</Text>
            </View>

            <Text style={estilosRegistrar.nombreUsuarioModal}>Carlos Flores Reyes</Text>

            <View style={estilosRegistrar.badgeVerificado}>
              <Icon name="check" size={14} color="#1E8E3E" />
              <Text style={estilosRegistrar.textoBadgeVerificado}>Cuenta verificada</Text>
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

            <TouchableOpacity style={estilosRegistrar.botonCerrarSesion} onPress={() => setModalUsuarioVisible(false)}>
              <Text style={estilosRegistrar.textoBotonCerrarSesion}>Cerrar Sesión</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>    
    </SafeAreaView>
  );
};

export default PantallaHistorial;