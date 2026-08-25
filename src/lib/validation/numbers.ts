import { z } from "zod";

/**
 * Número opcional que llega de un `<input type="number">`.
 *
 * `z.coerce.number().optional().or(z.literal(""))` NO vale: `z.coerce` aplica
 * `Number("")`, que da **0**, así que la rama `z.literal("")` no llega a
 * evaluarse nunca. En la práctica eso convertía "sin stock definido" en "0
 * unidades" (premio agotado nada más crearlo) y "sin precio" en "gratis".
 *
 * Aquí el vacío se transforma en `undefined` ANTES de coaccionar, que es la
 * única forma de distinguir "no lo he puesto" de "he puesto cero".
 */
export function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    schema.optional(),
  );
}
