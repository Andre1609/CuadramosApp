import React, { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function AjusteTeclado({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {children}
    </KeyboardAvoidingView>
  );
}