import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from '../utils/hash';

const CLAVE = '@cuadramos/cuentas/v1';

export interface Cuenta {
  id: string;        
  nombre: string;    
  salt: string;
  hash: string;
  creadoEn: string;
}

export const aIdUsuario = (usuario: string) =>
  usuario.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const aNombreVisible = (usuario: string) => {
  const t = usuario.trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

const nuevaSal = () =>
  Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 8)).join('');

function hashClave(clave: string, salt: string) {
  let h = sha256(`${salt}:${clave}`);
  for (let i = 0; i < 1000; i++) {
    h = sha256(`${h}${salt}${clave}`);
  }
  return h;
}

async function leerCuentas(): Promise<Cuenta[]> {
  const texto = await AsyncStorage.getItem(CLAVE);
  if (!texto) { return []; }
  try {
    const datos: unknown = JSON.parse(texto);
    return Array.isArray(datos) ? (datos as Cuenta[]) : [];
  } catch {
    return [];
  }
}

export async function registrarCuenta(usuario: string, clave: string): Promise<Cuenta> {
  const cuentas = await leerCuentas();
  const id = aIdUsuario(usuario);
  if (cuentas.some(c => c.id === id)) {
    throw new Error('Ese usuario ya está en uso. Prueba con otro.');
  }
  const salt = nuevaSal();
  const cuenta: Cuenta = {
    id,
    nombre: aNombreVisible(usuario),
    salt,
    hash: hashClave(clave, salt),
    creadoEn: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CLAVE, JSON.stringify([...cuentas, cuenta]));
  return cuenta;
}

export async function verificarCuenta(usuario: string, clave: string): Promise<Cuenta> {
  const cuentas = await leerCuentas();
  const cuenta = cuentas.find(c => c.id === aIdUsuario(usuario));
  if (!cuenta || cuenta.hash !== hashClave(clave, cuenta.salt)) {
    throw new Error('Usuario o contraseña incorrectos.');
  }
  return cuenta;
}