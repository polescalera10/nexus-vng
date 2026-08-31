/**
 * Coste de la escuela: lo que se paga y lo que cuesta abrir.
 *
 * Nada de esto vive en la base de datos. Son acuerdos con cada profesor y un
 * contrato de alquiler, no filas de una tabla, y meterlos en Postgres exigiría
 * un módulo de nóminas que hoy no existe. Viven aquí, en un único sitio, para
 * que cambiar una tarifa sea cambiar una línea.
 *
 * **Las tarifas van por id de profesor, nunca por nombre.** Este repositorio es
 * público: una tabla de "nombre → sueldo por hora" publicaría la retribución de
 * personas identificadas, y el historial de git no se borra. Con el UUID, el
 * repo dice cuánto cuesta una hora pero no de quién, y el nombre solo aparece
 * al cruzarlo con `teachers` desde el panel, que ya exige sesión de admin.
 * Si añades a alguien, coge su id de la tabla `teachers`.
 *
 * Confirmado por Pol el 31-08-2026.
 */

/** Tarifa por hora, por id de `teachers`. `0` = no cobra (el titular). */
export const TARIFA_HORA: Record<string, number> = {
  "2b0b3d96-eecf-4104-baec-73747ffc5b3d": 35,
  "2125591e-1255-4cb9-a644-51dbffaf1989": 20,
  "6e58bafd-abd5-414f-87c2-f29808f47de8": 20,
  "f4252056-1d0c-4cf7-9c25-57f73a412f62": 25,
  "97cd939c-a25e-4801-abd6-98e0639d1a9d": 0,
};

/**
 * Tarifas de pareja: hay quien cobra menos por hora en las clases que da
 * acompañado que en las que da solo.
 *
 * Van por **id de curso, no por nombre de clase**: hay dos "Bachata 1" en el
 * horario (lunes 18:30 y miércoles 21:30) y casar por nombre elegiría una al
 * azar.
 */
export const TARIFA_HORA_PAREJA: Record<string, { importe: number; cursos: string[] }> = {
  "2b0b3d96-eecf-4104-baec-73747ffc5b3d": {
    importe: 30,
    cursos: [
      "2cb671cb-6a79-46ae-b2bd-93cf32f6abeb", // Salsa 1 · Miércoles 20:30
      "7ea623f1-95f2-4f7c-a2a0-b578e67193c6", // Bachata 1 · Miércoles 21:30
      "6cdf8d32-6df0-42d2-9235-ebcf6b0d4a42", // Salsa 2 · Viernes 20:30
    ],
  },
};

/** Supuestos por defecto del panel. La página los deja tocar por URL. */
export const SUPUESTOS_BASE = {
  /** Alquiler de la sala en el Gimnasio Aranha, al mes. */
  alquiler: 700,
  /** Semanas de clase que se cuentan por mes. 4 fijas: cálculo conservador. */
  semanas: 4,
  /** Cualquier otro gasto mensual (gestoría, seguros…). */
  otros: 0,
} as const;

/**
 * Tarifa aplicable a un profesor en un curso concreto.
 *
 * `null` = ese profesor no tiene tarifa definida aquí. Se devuelve `null` en
 * vez de 0 a propósito: un 0 silencioso escondería gasto real, así que el panel
 * lo enseña como aviso.
 */
export function tarifaDe(profesorId: string, cursoId: string): number | null {
  const pareja = TARIFA_HORA_PAREJA[profesorId];
  if (pareja && pareja.cursos.includes(cursoId)) return pareja.importe;
  const base = TARIFA_HORA[profesorId];
  return base === undefined ? null : base;
}
