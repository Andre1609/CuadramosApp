import { TextInput } from './Texto';
import { StyleSheet, TextInputProps } from 'react-native';

const CampoTexto = (propiedades: TextInputProps) => {
  return (
    <TextInput
      placeholderTextColor="#888888"
      {...propiedades}
      style={[estilos.entrada, propiedades.style]}
    />
  );
};

const estilos = StyleSheet.create({
  entrada: {
    minHeight: 50,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
    width: '100%',
    marginBottom: 15,
  },
});

export default CampoTexto;