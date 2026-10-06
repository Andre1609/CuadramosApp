import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, StatusBar, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { estilosRegistrar } from '../styles/estilosRegistrar.ts';

const cuentas = [
  'Mi cuenta principal · S/ 3,850.00',
  'Mis metas · S/ 1,200.00',
  'Del día a día · S/ 650.00'
];

const categorias = [
  'Salario',
  'Trabajo',
  'Otros'
];

const PantallaRegistrar = () => {
  const [tipoOperacion, setTipoOperacion] = useState('egreso');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(cuentas[0]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categorias[2]);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
  const [modalMetaVisible, setModalMetaVisible] = useState(true); 
  const [metaMes, setMetaMes] = useState('');

  const toggleDropdown = (tipo: string) => {
    if (dropdownAbierto === tipo) {
      setDropdownAbierto(null);
    } else {
      setDropdownAbierto(tipo);
    }
  };

  const seleccionarCuenta = (cuenta: string) => {
    setCuentaSeleccionada(cuenta);
    setDropdownAbierto(null);
  };

  const seleccionarCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setDropdownAbierto(null);
  };

  return (
    <SafeAreaView style={estilosRegistrar.areaSegura}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={[estilosRegistrar.contenedorScroll, { flex: 1 }]}>
        <View style={estilosRegistrar.encabezadoSuperior}>
          <View style={estilosRegistrar.migasPan}>
            <Text style={estilosRegistrar.textoMigaInactivo}>Mi billetera  {'>'}  </Text>
            <Text style={estilosRegistrar.textoMigaActivo}>Registrar</Text>
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

        <View style={estilosRegistrar.cabeceraPantalla}>
          <Text style={estilosRegistrar.tituloPantalla}>Cada movimiento cuenta.</Text>
          <Text style={estilosRegistrar.subtituloPantalla}>Registra tus operaciones y mantén todo en orden.</Text>
        </View>

        <View style={estilosRegistrar.tarjetaBlanca}>
          <Text style={estilosRegistrar.etiquetaSuperior}>NUEVA OPERACIÓN</Text>
          <Text style={estilosRegistrar.tituloPrincipal}>¿Qué vamos a registrar?</Text>

          <View style={estilosRegistrar.contenedorTabs}>
            <TouchableOpacity 
              style={[
                estilosRegistrar.tabBoton, 
                estilosRegistrar.tabIngreso, 
                tipoOperacion === 'ingreso' ? estilosRegistrar.tabIngresoActivo : estilosRegistrar.tabInactivo
              ]}
              onPress={() => setTipoOperacion('ingreso')}
            >
              <Icon 
                name="arrow-bottom-left" 
                size={20} 
                color={tipoOperacion === 'ingreso' ? '#1E8E3E' : '#A0AEC0'} 
              />
              <Text style={tipoOperacion === 'ingreso' ? estilosRegistrar.textoTabIngresoActivo : estilosRegistrar.textoTabInactivo}>
                Ingreso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                estilosRegistrar.tabBoton, 
                estilosRegistrar.tabEgreso, 
                tipoOperacion === 'egreso' ? estilosRegistrar.tabEgresoActivo : estilosRegistrar.tabInactivo
              ]}
              onPress={() => setTipoOperacion('egreso')}
            >
              <Icon 
                name="arrow-top-right" 
                size={20} 
                color={tipoOperacion === 'egreso' ? '#C8005B' : '#A0AEC0'} 
              />
              <Text style={tipoOperacion === 'egreso' ? estilosRegistrar.textoTabEgresoActivo : estilosRegistrar.textoTabInactivo}>
                Egreso
              </Text>
            </TouchableOpacity>
          </View>

          <View style={estilosRegistrar.grupoInput}>
            <Text style={estilosRegistrar.labelInput}>Monto</Text>
            <View style={estilosRegistrar.cajaInput}>
              <Text style={estilosRegistrar.simboloMoneda}>S/</Text>
              <TextInput 
                style={estilosRegistrar.inputPrincipal}
                placeholder="0"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
              />
              <Text style={estilosRegistrar.textoMoneda}>PEN</Text>
            </View>
          </View>

          <View style={dropdownAbierto === 'cuentas' ? estilosRegistrar.grupoInputZIndexAlto : estilosRegistrar.grupoInput}>
            <Text style={estilosRegistrar.labelInput}>Desde tu cuenta</Text>
            <TouchableOpacity 
              style={[estilosRegistrar.cajaInput, dropdownAbierto === 'cuentas' && estilosRegistrar.cajaInputActiva]}
              onPress={() => toggleDropdown('cuentas')}
            >
              <Text style={estilosRegistrar.inputTexto}>{cuentaSeleccionada}</Text>
              <Icon name={dropdownAbierto === 'cuentas' ? "chevron-up" : "chevron-down"} size={20} color="#1A202C" />
            </TouchableOpacity>

            {dropdownAbierto === 'cuentas' && (
              <View style={estilosRegistrar.dropdownContenedor}>
                {cuentas.map((cuenta, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[estilosRegistrar.dropdownItem, cuentaSeleccionada === cuenta && estilosRegistrar.dropdownItemActivo]}
                    onPress={() => seleccionarCuenta(cuenta)}
                  >
                    <Text style={cuentaSeleccionada === cuenta ? estilosRegistrar.dropdownItemTextoActivo : estilosRegistrar.dropdownItemTexto}>
                      {cuenta}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={estilosRegistrar.grupoInput}>
            <Text style={estilosRegistrar.labelInput}>Concepto</Text>
            <View style={estilosRegistrar.cajaInput}>
              <TextInput 
                style={estilosRegistrar.inputTexto}
                placeholder="Ej. Mercado de la semana"
                placeholderTextColor="#A0AEC0"
                value={concepto}
                onChangeText={setConcepto}
              />
            </View>
          </View>

          <View style={dropdownAbierto === 'categorias' ? estilosRegistrar.grupoInputZIndexAlto : estilosRegistrar.grupoInput}>
            <Text style={estilosRegistrar.labelInput}>Categoría</Text>
            <TouchableOpacity 
              style={[estilosRegistrar.cajaInput, dropdownAbierto === 'categorias' && estilosRegistrar.cajaInputActiva]}
              onPress={() => toggleDropdown('categorias')}
            >
              <Text style={estilosRegistrar.inputTexto}>{categoriaSeleccionada}</Text>
              <Icon name={dropdownAbierto === 'categorias' ? "chevron-up" : "chevron-down"} size={20} color="#1A202C" />
            </TouchableOpacity>

            {dropdownAbierto === 'categorias' && (
              <View style={estilosRegistrar.dropdownContenedor}>
                {categorias.map((categoria, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[estilosRegistrar.dropdownItem, categoriaSeleccionada === categoria && estilosRegistrar.dropdownItemActivo]}
                    onPress={() => seleccionarCategoria(categoria)}
                  >
                    <Text style={categoriaSeleccionada === categoria ? estilosRegistrar.dropdownItemTextoActivo : estilosRegistrar.dropdownItemTexto}>
                      {categoria}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={estilosRegistrar.botonGuardar}>
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text style={estilosRegistrar.textoBotonGuardar}>Guardar operación</Text>
          </TouchableOpacity>

        </View>
      </View>

      <TouchableOpacity style={estilosRegistrar.botonChatbotFlotante}>
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalMetaVisible}
        onRequestClose={() => setModalMetaVisible(false)}
      >
        <View style={estilosRegistrar.modalFondoCentro}>
          <View style={estilosRegistrar.tarjetaMeta}>
            
            <Text style={estilosRegistrar.tituloMeta}>¿Cuál será tu meta?</Text>
            <Text style={estilosRegistrar.subtituloMeta}>Define tu objetivo de ahorro para este mes y conéctalo con tu balance.</Text>
            
            <View style={estilosRegistrar.inputMetaContainer}>
              <Text style={estilosRegistrar.textoMonedaMeta}>S/</Text>
              <TextInput 
                style={estilosRegistrar.inputMeta}
                placeholder="0.00"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                autoFocus={true} 
                value={metaMes}
                onChangeText={setMetaMes}
              />
            </View>

            <TouchableOpacity 
              style={estilosRegistrar.botonGuardarMeta}
              onPress={() => setModalMetaVisible(false)}
            >
              <Text style={estilosRegistrar.textoBotonMeta}>Guardar meta</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default PantallaRegistrar;