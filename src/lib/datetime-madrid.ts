/**
 * Conversión entre la hora local de la escuela y los `timestamptz` de la BD.
 *
 * El panel escribe fechas con `<input type="datetime-local">`, que no lleva
 * zona horaria: es "las 21:00" a secas. En Vercel el servidor corre en UTC, así
 * que guardarlo tal cual convertiría un evento de las 21:00 en uno de las 23:00
 * para el visitante durante el horario de verano. El desfase se calcula sobre
 * la fecha concreta, no como constante, para que el cambio de hora de octubre
 * no descuadre nada.
 */

const TZ = "Europe/Madrid";

/** "2026-09-12T21:00" (hora de Madrid) → ISO en UTC. */
export function madridToIso(local: string): string {
  const asUtc = new Date(`${local}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return new Date().toISOString();

  const enMadrid = new Date(asUtc.toLocaleString("en-US", { timeZone: TZ }));
  const enUtc = new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMs = enMadrid.getTime() - enUtc.getTime();

  return new Date(asUtc.getTime() - offsetMs).toISOString();
}

/** ISO de BD → valor de un `<input type="datetime-local">` en hora de Madrid. */
export function isoToMadridLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(d)
    .replace(" ", "T");
}
