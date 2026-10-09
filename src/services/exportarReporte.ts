import { Operacion } from '../types/finanzas';
import { generarReportePdf } from './generarReportePdf';

export async function exportarReporte(operaciones: Operacion[], mes: string) {
  const archivo = await generarReportePdf(operaciones, mes);
  // Carga diferida: una instalación anterior puede abrir la app y mostrar
  // el error de exportación hasta que se recompile con el módulo nativo.
  const { default: Share } = await import('react-native-share');
  await Share.open({
    url: `data:application/pdf;base64,${archivo.base64}`,
    type: 'application/pdf', filename: archivo.nombre,
    title: 'Guardar o compartir reporte', useInternalStorage: true, failOnCancel: false,
  });
}
