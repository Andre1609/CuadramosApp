import React, { forwardRef } from 'react';
import { Text as NativeText, TextInput as NativeTextInput, StyleSheet } from 'react-native';
import type { TextProps, TextInputProps, TextStyle, StyleProp } from 'react-native';
import { useTexto } from '../../context/TextoContext';

function escalar(style: StyleProp<TextStyle>, factor: number): TextStyle {
  const original = StyleSheet.flatten(style) || {};
  const base = original.fontSize ?? 16;
  const fontSize = Math.max(16, base) * factor;
  return {
    fontSize,
    ...(original.lineHeight ? { lineHeight: Math.max(fontSize * 1.3, original.lineHeight * fontSize / base) } : {}),
  };
}

export const Text = forwardRef<React.ComponentRef<typeof NativeText>, TextProps>(function Texto({ style, ...props }, ref) {
  const { factor } = useTexto();
  return <NativeText ref={ref} {...props} style={[{ flexShrink: 1 }, style, escalar(style, factor)]} />;
});

export const TextInput = forwardRef<React.ComponentRef<typeof NativeTextInput>, TextInputProps>(function EntradaTexto({ style, ...props }, ref) {
  const { factor } = useTexto();
  return <NativeTextInput ref={ref} {...props} style={[style, escalar(style, factor)]} />;
});
