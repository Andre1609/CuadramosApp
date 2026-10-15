import Modal from './ModalSeguro';
import { Text, TextInput } from './atoms/Texto';
// src/components/AsistenteFlotante.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFinanzas } from '../context/FinanzasContext';
import { useAsistente } from '../context/AsistenteContext';
import { gruposAsistente, introGrupo, preguntasAsistente } from '../data/contenidoAsistente';
import type { DestinoAsistente } from '../types/asistente';
import type { PestanasPrincipales } from '../types/navegacion';
import { categoriaConMasGastos, formatoMonto, resumenMes } from '../utils/finanzas';
import { estilosAsistente } from '../styles/estilosAsistente';

interface Props {
  estiloBoton: StyleProp<ViewStyle>;
}

export default function AsistenteFlotante({ estiloBoton }: Props) {
  const navigation = useNavigation<NavigationProp<PestanasPrincipales>>();
  const { operaciones, cargando, error, registrar, guardarMeta } = useFinanzas();
  const { mensajes, paso, agregarMensajes, establecerPaso, cargandoIA, enviarMensajeUsuario } = useAsistente();
  
  const [visible, setVisible] = useState(false);
  const [textoInput, setTextoInput] = useState('');
  
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const resumen = resumenMes(operaciones);
  
  // CORRECCIÓN CRUCIAL: Añadido || [] para evitar que colapse si el grupo no existe
  const preguntas = (paso.tipo === 'inicio' ? [] : preguntasAsistente[paso.grupo]) || [];
  
  const opciones = paso.tipo === 'inicio'
    ? gruposAsistente
    : paso.tipo === 'grupo'
    ? preguntas
    : preguntas.filter(pregunta => pregunta.tema !== paso.tema);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [mensajes, cargandoIA]);

  const cerrar = () => {
    setVisible(false);
  };

  const irADestino = (destino: DestinoAsistente) => {
    cerrar();
    navigation.navigate(destino);
  };

  const idMensaje = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const enviarConsultaIA = async () => {
    if (!textoInput.trim() || cargandoIA) return;

    const mensajeUsuario = textoInput.trim();
    setTextoInput('');

    try {
      const resultado = await enviarMensajeUsuario(mensajeUsuario);
      
      // 1. Si Gemini retornó la instrucción de registro de operación
      if (resultado && resultado.accion && registrar) {
        try {
          const { monto, tipo, cuenta, categoria } = resultado.accion;
          const categoriasValidasIngreso = ['Salario', 'Trabajo', 'Otros'];
          const categoriaFinal = categoriasValidasIngreso.includes(categoria) ? categoria : 'Otros';

          await registrar({
            montoCentimos: Math.round(Number(monto) * 100),
            tipo: tipo === 'ingreso' ? 'ingreso' : 'egreso',
            cuentaId: cuenta === 'Cuenta Principal' ? 'principal' : 'diaria',
            categoria: categoriaFinal,
            concepto: `${categoria} (Registrado por Cuadri)`,
            fecha: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Error al registrar movimiento con Cuadri:', err);
        }
      }

      // 2. Si Gemini retornó la instrucción de actualización de meta
      if (resultado?.metaAccion?.monto && guardarMeta) {
        try {
          const montoNum = Number(resultado.metaAccion.monto);
          if (!isNaN(montoNum)) {
            await guardarMeta(Math.round(montoNum * 100));
          }
        } catch (err) {
          console.error('Error al actualizar la meta con Cuadri:', err);
        }
      }
    } catch (errGeneral) {
      console.error('Error procesando la consulta del asistente:', errGeneral);
    }
  };

  const elegirGrupo = (grupo: (typeof gruposAsistente)[number]) => {
    agregarMensajes([
      { id: idMensaje(), autor: 'usuario', texto: grupo.texto },
      { id: idMensaje(), autor: 'bot', texto: introGrupo[grupo.grupo] },
    ]);
    establecerPaso({ tipo: 'grupo', grupo: grupo.grupo });
  };

  const respuestaSeleccionada = (tema: string) => {
    if (tema === 'resumen') {
      if (cargando) { return { texto: 'Estoy cargando tus movimientos. Prueba de nuevo en un momento.' }; }
      if (error) { return { texto: 'No pude leer tus movimientos ahora. Inténtalo de nuevo en un momento.' }; }
      if (resumen.estado === 'Sin movimientos') {
        return { texto: 'Todavía no tienes movimientos registrados este mes. Cuando anotes alguno, aquí verás cómo va tu mes.' };
      }
      const mesActual = new Date().toLocaleDateString('es-PE', { month: 'long' }).toLocaleLowerCase('es-PE');
      return {
        texto: `En ${mesActual}, tus números van así:`,
        resumen: {
          ingresos: resumen.ingresos,
          egresos: resumen.egresos,
          neto: resumen.neto,
        },
      };
    }
    if (tema === 'gastosHormiga') {
      if (cargando) { return { texto: 'Estoy cargando tus movimientos. Prueba de nuevo en un momento.' }; }
      if (error) { return { texto: 'No pude leer tus movimientos ahora. Inténtalo de nuevo en un momento.' }; }
      return { texto: resumen.cantidadHormiga
        ? `Este mes tienes ${resumen.cantidadHormiga} gastos menores a S/ 20, que suman S/ ${formatoMonto(resumen.gastosHormiga)}.`
        : 'Este mes no tienes gastos menores a S/ 20 registrados.' };
    }
    if (tema === 'mayorCategoria') {
      if (cargando) { return { texto: 'Estoy cargando tus movimientos. Prueba de nuevo en un momento.' }; }
      if (error) { return { texto: 'No pude leer tus movimientos ahora. Inténtalo de nuevo en un momento.' }; }
      const mayorGasto = categoriaConMasGastos(operaciones);
      return { texto: mayorGasto
        ? `Este mes gastaste más en ${mayorGasto.categoria}: S/ ${formatoMonto(mayorGasto.montoCentimos)}.`
        : 'Todavía no tienes gastos registrados este mes.' };
    }
    return { texto: '' };
  };

  const elegirPregunta = (pregunta: (typeof preguntasAsistente)[keyof typeof preguntasAsistente][number]) => {
    if (paso.tipo === 'inicio') { return; }
    const respuesta = pregunta.respuesta
      ? { texto: pregunta.respuesta }
      : respuestaSeleccionada(pregunta.tema);
    agregarMensajes([
      { id: idMensaje(), autor: 'usuario', texto: pregunta.texto },
      {
        id: idMensaje(),
        autor: 'bot',
        texto: respuesta.texto,
        resumen: respuesta.resumen,
        accion: { texto: pregunta.textoAccion, destino: pregunta.destino },
      },
    ]);
    establecerPaso({ tipo: 'respuesta', grupo: paso.grupo, tema: pregunta.tema });
  };

  const cambiarDeTema = () => {
    agregarMensajes([{ id: idMensaje(), autor: 'bot', texto: '¿Qué otro tema revisamos?' }]);
    establecerPaso({ tipo: 'inicio' });
  };

  const abrir = () => {
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Abrir Cuadri"
        style={estiloBoton}
        onPress={abrir}
      >
        <Icon name="robot-outline" size={28} color="#C8005B" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={cerrar}
      >
       <View style={estilosAsistente.fondo}>
        <View
          style={[
            estilosAsistente.desenfoque,
            { backgroundColor: 'rgba(0, 0, 0, 0.4)' }
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar asistente"
          style={estilosAsistente.fondoTocable}
          onPress={cerrar}
        />
          <View style={estilosAsistente.panel}>
            <View style={estilosAsistente.cabecera}>
              <View style={estilosAsistente.iconoCabecera}>
                <Icon name="robot-outline" size={24} color="#C8005B" />
              </View>
              <View style={estilosAsistente.textosCabecera}>
                <Text style={estilosAsistente.titulo}>Cuadri, tu asistente</Text>
                <View style={estilosAsistente.estadoCabecera}>
                  <View style={estilosAsistente.indicadorEstado} />
                  <Text style={estilosAsistente.subtitulo}>Aquí para ayudarte</Text>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cerrar asistente"
                style={estilosAsistente.botonCerrar}
                onPress={cerrar}
              >
                <Icon name="close" size={23} color="#6B5C67" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={estilosAsistente.contenido}
              contentContainerStyle={estilosAsistente.contenidoInterior}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {mensajes.map(mensaje => (
                mensaje.autor === 'usuario' ? (
                  <View key={mensaje.id} style={estilosAsistente.filaUsuario}>
                    <View style={estilosAsistente.mensajeUsuario}>
                      <Text style={estilosAsistente.textoMensajeUsuario}>{mensaje.texto}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={mensaje.id} style={estilosAsistente.filaMensajeBot}>
                    <View style={estilosAsistente.avatarMensaje}>
                      <Icon name="robot-outline" size={18} color="#C8005B" />
                    </View>
                    <View style={estilosAsistente.mensajeAsistente}>
                      {!!mensaje.texto && <Text style={estilosAsistente.textoMensajeAsistente}>{mensaje.texto}</Text>}
                      {mensaje.resumen && (
                        <View style={estilosAsistente.tarjetaResumen}>
                          <View style={estilosAsistente.filaResumen}>
                            <Text style={estilosAsistente.etiquetaResumen}>Ingresos</Text>
                            <Text style={estilosAsistente.ingresoResumen}>S/ {formatoMonto(mensaje.resumen.ingresos)}</Text>
                          </View>
                          <View style={estilosAsistente.filaResumen}>
                            <Text style={estilosAsistente.etiquetaResumen}>Gastos</Text>
                            <Text style={estilosAsistente.gastoResumen}>S/ {formatoMonto(mensaje.resumen.egresos)}</Text>
                          </View>
                          <View style={[estilosAsistente.filaResumen, estilosAsistente.filaNeto]}>
                            <Text style={estilosAsistente.etiquetaNeto}>Neto</Text>
                            <Text style={estilosAsistente.montoNeto}>S/ {formatoMonto(mensaje.resumen.neto)}</Text>
                          </View>
                        </View>
                      )}
                      {mensaje.accion && (
                        <TouchableOpacity
                          accessibilityRole="button"
                          style={estilosAsistente.botonAccion}
                          onPress={() => irADestino(mensaje.accion!.destino)}
                        >
                          <Text style={estilosAsistente.textoBotonAccion}>{mensaje.accion.texto}</Text>
                          <Icon name="arrow-right" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )
              ))}

              {cargandoIA && (
                <View style={estilosAsistente.filaMensajeBot}>
                  <View style={estilosAsistente.avatarMensaje}>
                    <Icon name="robot-outline" size={18} color="#C8005B" />
                  </View>
                  <View style={estilosAsistente.mensajeAsistente}>
                    <ActivityIndicator size="small" color="#C8005B" />
                  </View>
                </View>
              )}
            </ScrollView>

            <ScrollView style={estilosAsistente.pie} keyboardShouldPersistTaps="handled">
              <Text style={estilosAsistente.tituloPie}>Elige una opción</Text>
              <View style={estilosAsistente.opciones}>
                {opciones.map(opcion => 'grupo' in opcion ? (
                  <TouchableOpacity
                    key={opcion.grupo}
                    accessibilityRole="button"
                    style={estilosAsistente.opcion}
                    onPress={() => elegirGrupo(opcion)}
                  >
                    <Icon name={opcion.icono} size={20} color="#C8005B" />
                    <Text style={estilosAsistente.textoOpcion}>{opcion.texto}</Text>
                    <Icon name="chevron-right" size={20} color="#8E164E" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={opcion.tema}
                    accessibilityRole="button"
                    style={estilosAsistente.opcion}
                    onPress={() => elegirPregunta(opcion)}
                  >
                    <Icon name={opcion.icono} size={20} color="#C8005B" />
                    <Text style={estilosAsistente.textoOpcion}>{opcion.texto}</Text>
                    <Icon name="chevron-right" size={20} color="#8E164E" />
                  </TouchableOpacity>
                ))}
              </View>

              {paso.tipo !== 'inicio' && (
                <TouchableOpacity
                  accessibilityRole="button"
                  style={estilosAsistente.linkCambiarTema}
                  onPress={cambiarDeTema}
                >
                  <Text style={estilosAsistente.textoCambiarTema}>Cambiar de tema</Text>
                </TouchableOpacity>
              )}

              {/* Caja de texto para hablar con Gemini */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 8 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#F3F3F3', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, color: '#333', fontSize: 14 }}
                  placeholder="Pregunta o registra algo..."
                  placeholderTextColor="#999"
                  value={textoInput}
                  onChangeText={setTextoInput}
                  onSubmitEditing={enviarConsultaIA}
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize="none"
                  blurOnSubmit={false}
                />
                <TouchableOpacity 
                  onPress={enviarConsultaIA} 
                  disabled={cargandoIA}
                  style={{ backgroundColor: '#C8005B', borderRadius: 20, width: 38, height: 38, justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}
                >
                  <Icon name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
