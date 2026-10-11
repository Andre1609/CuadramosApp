import React, { useState } from 'react';
import { View, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CampoTexto from './CampoTexto';

const CampoClave = (propiedades: TextInputProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ width: '100%' }}>
      <CampoTexto
        {...propiedades}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ paddingRight: 48 }}
      />
      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        style={{ position: 'absolute', right: 14, top: 13 }}>
        <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={24} color="#888888" />
      </TouchableOpacity>
    </View>
  );
};

export default CampoClave;