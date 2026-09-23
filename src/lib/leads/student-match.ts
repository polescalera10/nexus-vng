/**
 * ¿Este lead es alguien que YA está en la escuela?
 *
 * La mayoría de quien se apunta a una masterclass es alumno de la casa. Sin
 * esta comprobación, "Convertir a alumno" le creaba una SEGUNDA ficha: dos
 * fichas con el mismo teléfono, dos cuotas y un alumno que aparece dos veces
 * en las listas.
 *
 * La regla de identidad es la misma que usa `lead_identity_key` en Postgres
 * para contar las plazas fundadoras (migración 0037), y por el mismo motivo:
 *
 *   · Solo el teléfono NO vale. En esta base hay parejas que comparten móvil Y
 *     email (Fran/Maria Jose, Jonatan/Elisabeth). Son personas distintas y solo
 *     las separa el nombre; casar por teléfono las fundiría en una.
 *   · Solo el nombre tampoco: dos "Maria Garcia" pueden ser dos personas.
 *
 * Así que hace falta uno de los dos contactos Y que los nombres cuadren. No
 * iguales: en la base real la misma persona está como "Noelia Barroso guijo"
 * en el lead y "Noelia Barroso" en su ficha, o como "Manuel Martin" y
 * "Manuel". Cuadran cuando el más corto es el principio del otro palabra a
 * palabra, que es justo lo que NO pasa con una pareja que comparte móvil
 * ("Fran" y "Maria Jose").
 *
 * Nada se enlaza solo: la pantalla enseña de quién es la ficha y hace falta un
 * clic. Un falso positivo cuesta pulsar otro botón, nunca una ficha perdida.
 */

export type StudentLike = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
};

export type LeadLike = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
};

/** Minúsculas, sin acentos y sin espacios de más. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Últimos 9 dígitos, que es lo que ocupa un móvil español. La misma persona
 * aparece como `676830228`, `676 830 228` o `+34676830228` según por dónde
 * entrara; sin recortar el prefijo, el mismo número no casaría consigo mismo.
 */
function phoneKey(value: string | null): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 6 ? digits.slice(-9) : null;
}

function emailKey(value: string | null): string | null {
  const v = (value ?? "").trim().toLowerCase();
  return v.length > 0 ? v : null;
}

/**
 * ¿Son la misma persona? El nombre más corto tiene que ser el principio del
 * otro, palabra a palabra: "noelia barroso" cuadra con "noelia barroso guijo",
 * y "maria jose" no cuadra con "fran".
 */
export function nombresCompatibles(a: string, b: string): boolean {
  const uno = normalizeName(a).split(" ").filter(Boolean);
  const otro = normalizeName(b).split(" ").filter(Boolean);
  if (uno.length === 0 || otro.length === 0) return false;

  const [corto, largo] = uno.length <= otro.length ? [uno, otro] : [otro, uno];
  return corto.every((palabra, i) => palabra === largo[i]);
}

/**
 * Para cada lead, el alumno que ya existe con esa identidad (o nada).
 * Si dos alumnos empatan, no se devuelve ninguno: elegir al azar es peor que
 * dejar que lo mire una persona.
 */
export function matchLeadsToStudents(
  leads: LeadLike[],
  students: StudentLike[],
): Map<string, StudentLike> {
  const porTelefono = new Map<string, StudentLike[]>();
  const porEmail = new Map<string, StudentLike[]>();

  const index = (map: Map<string, StudentLike[]>, key: string, student: StudentLike) => {
    const bucket = map.get(key) ?? [];
    bucket.push(student);
    map.set(key, bucket);
  };

  for (const student of students) {
    if (!normalizeName(student.full_name)) continue;
    const tel = phoneKey(student.phone);
    const mail = emailKey(student.email);
    if (tel) index(porTelefono, tel, student);
    if (mail) index(porEmail, mail, student);
  }

  const salida = new Map<string, StudentLike>();

  for (const lead of leads) {
    if (!normalizeName(lead.nombre ?? "")) continue;

    const tel = phoneKey(lead.telefono);
    const mail = emailKey(lead.email);
    const candidatos = [
      ...(tel ? (porTelefono.get(tel) ?? []) : []),
      ...(mail ? (porEmail.get(mail) ?? []) : []),
    ].filter((s) => nombresCompatibles(s.full_name, lead.nombre ?? ""));

    // Un solo alumno posible (por id: el mismo puede casar por las dos vías).
    const unicos = [...new Map(candidatos.map((s) => [s.id, s])).values()];
    if (unicos.length === 1 && unicos[0]) salida.set(lead.id, unicos[0]);
  }

  return salida;
}
