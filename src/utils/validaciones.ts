const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const SOLO_LETRAS = new RegExp(`^[${LETRAS}]+$`);
const NO_LETRAS = new RegExp(`[^${LETRAS}]`, 'g');

export const soloLetras = (texto: string) => texto.replace(NO_LETRAS, '');

export function validarUsuario(texto: string): string | null {
  const usuario = texto.trim();
  if (!usuario) { return 'Ingresa tu usuario.'; }
  if (!SOLO_LETRAS.test(usuario)) {
    return 'Usa solo letras: sin espacios, números, puntos ni símbolos.';
  }
  if (usuario.length < 3) { return 'Mínimo 3 letras.'; }
  if (usuario.length > 20) { return 'Máximo 20 letras.'; }
  if (/(.)\1{2,}/i.test(usuario)) { return 'Ese usuario no parece un nombre válido.'; }
  return null;
}

export function validarClave(texto: string): string | null {
  if (texto.length < 8) { return 'Mínimo 8 caracteres.'; }
  if (!/[A-Za-z]/.test(texto) || !/\d/.test(texto)) {
    return 'Debe tener al menos una letra y un número.';
  }
  return null;
}