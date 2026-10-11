import { Operacion } from '../types/finanzas';
import { generarReportePdf } from './generarReportePdf';
import { sinCierreAutomatico } from './seguridadSesion';

export async function exportarReporte(operaciones: Operacion[], mes: string) {
  const archivo = await generarReportePdf(operaciones, mes);
  const { default: Share } = await import('react-native-share');
    await sinCierreAutomatico(() =>
    Share.open({
      url: `data:application/pdf;base64,${archivo.base64}`,
      type: 'application/pdf', filename: archivo.nombre,
      title: 'Guardar o compartir reporte', useInternalStorage: true, failOnCancel: false,
    }),
  );
}
