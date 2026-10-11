let pausas = 0;

export const sesionPausada = () => pausas > 0;

export async function sinCierreAutomatico<T>(tarea: () => Promise<T>): Promise<T> {
  pausas += 1;
  try {
    return await tarea();
  } finally {
    setTimeout(() => { pausas -= 1; }, 1000); 
  }
}