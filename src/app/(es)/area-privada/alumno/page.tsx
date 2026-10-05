import Link from "next/link";
import { BarraProgreso } from "@/components/alumno/BarraProgreso";
import { IconoPuntos } from "@/components/alumno/IconoPuntos";
import { Movimiento } from "@/components/alumno/Movimiento";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { registrarVisita } from "@/lib/actividad";
import { requireRole } from "@/lib/auth";
import { getStudentForUser } from "@/lib/queries/alumno";
import {
  getPointRule,
  getPointRules,
  getRewards,
  getStudentPoints,
  getStudentRedemptions,
} from "@/lib/queries/gamificacion";
import { camposPendientes, listaPendientes } from "@/lib/perfil-completo";
import { formatPoints, formatRelative } from "@/lib/format";
import {
  iconoDeMovimiento,
  progreso,
  proximoCanjeDisponible,
  siguienteMeta,
} from "@/lib/puntos";
import { Onboarding } from "./Onboarding";
// ⏸ Clases, diario y eventos: apagado desde el 05-10-2026 (ver el componente).
// import { ClasesYEventos } from "./_ocultas/ClasesYEventos";

export const metadata = { title: "Mi área · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Inicio del alumno, centrado en los puntos (05-10-2026).
 *
 * Responde a tres preguntas, en este orden: cuántos puntos tengo, cuánto me
 * falta para el siguiente premio y qué ha pasado últimamente. Todo lo demás
 * —catálogo, cómo ganar, normas— vive en Premios, a un toque.
 *
 * Las clases, el diario y los eventos que había antes no se han borrado: están
 * en `_ocultas/ClasesYEventos.tsx`, comentados abajo.
 *
 * Un usuario con rol `alumno` puede existir sin ficha en `students` (por
 * ejemplo si se registró por su cuenta): en ese caso se le explica qué falta
 * en vez de enseñarle un panel vacío que parece roto.
 */
export default async function AlumnoPage() {
  const { user } = await requireRole("alumno");
  // La visita se apunta en paralelo: no retrasa la página.
  const [student] = await Promise.all([
    getStudentForUser(user.id),
    registrarVisita("inicio"),
  ]);

  if (!student) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Ya casi
        </h1>
        <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
          Tu cuenta está creada, pero todavía no está enlazada a tu ficha de alumno.
          Escríbenos por WhatsApp o díselo a tu profe en la próxima clase y lo
          conectamos en un minuto.
        </p>
      </>
    );
  }

  const [puntos, premios, canjes, reglas, reglaPerfil] = await Promise.all([
    getStudentPoints(student.id, 5),
    // Todos, también los retirados: un canje antiguo necesita su icono.
    getRewards(),
    getStudentRedemptions(student.id),
    getPointRules(),
    getPointRule("perfil_completo"),
  ]);

  // Los puntos los concede el trigger de 0045d leyendo esta misma regla. Si
  // Pol la apaga desde el panel, aquí deja de prometerse nada.
  const pendientes = camposPendientes(student);
  const premioPerfil = reglaPerfil?.points ?? 0;
  const pidePerfil = pendientes.length > 0 && premioPerfil > 0;

  const balance = puntos.balance;
  const catalogo = premios.filter((r) => r.active);
  const meta = siguienteMeta(catalogo, balance);
  const ahora = new Date();
  const pedibles = catalogo.filter(
    (r) =>
      r.cost_points <= balance &&
      (r.stock === null || r.stock > 0) &&
      proximoCanjeDisponible(r, canjes, ahora) === null,
  ).length;

  const enCurso = canjes.filter((c) => c.status === "solicitado");

  const premioPorId = new Map(premios.map((r) => [r.id, r]));
  const iconosRegla = new Map(reglas.map((r) => [r.code, r.icon]));
  const iconosCanje = new Map(
    canjes.map((c) => [c.id, premioPorId.get(c.reward_id)?.icon ?? null]),
  );

  const nombre = student.full_name.split(" ")[0] ?? "";

  return (
    <>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Área privada
      </span>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Hola, {nombre}
        </h1>
        {student.payment_status === "pendiente" && (
          <Badge variant="warning">Cuota pendiente</Badge>
        )}
        {student.is_founding_member && <Badge variant="success">Socia fundadora</Badge>}
      </div>

      {/* La bienvenida sale una sola vez; el recordatorio de abajo es el que
          insiste mientras falten datos. */}
      {student.onboarding_seen_at === null && (
        <Onboarding nombre={nombre} pendientes={pendientes} puntosPremio={premioPerfil} />
      )}

      {/* ── Saldo y siguiente premio ───────────────────────────────────────── */}
      <section
        aria-labelledby="tus-puntos"
        className="mt-6 rounded-lg border border-accent/25 bg-bg-panel p-5 shadow-soft sm:p-7"
      >
        <h2
          id="tus-puntos"
          className="font-body text-xs font-bold uppercase tracking-[0.14em] text-text-muted"
        >
          Tus puntos
        </h2>
        <p className="mt-1 font-display text-[clamp(48px,12vw,72px)] leading-none text-gradient-nexus tabular-nums">
          {formatPoints(balance)}
        </p>

        {meta ? (
          <div className="mt-5">
            <p className="font-body text-[15px] text-text-body">
              Te faltan{" "}
              <strong className="font-bold text-text-strong">
                {formatPoints(meta.cost_points - balance)}
              </strong>{" "}
              para <strong className="font-bold text-text-strong">{meta.name}</strong>
            </p>
            <div className="mt-2.5">
              <BarraProgreso
                valor={progreso(balance, meta.cost_points)}
                etiqueta={`Progreso hacia ${meta.name}`}
              />
            </div>
          </div>
        ) : catalogo.length > 0 ? (
          <p className="mt-5 font-body text-[15px] text-text-body">
            Llegas a todos los premios del catálogo.
          </p>
        ) : null}

        {pedibles > 0 && (
          <p className="mt-4 flex items-center gap-2 font-body text-sm font-semibold text-neon-lime">
            <IconoPuntos name="regalo" size="sm" tono="lime" />
            {pedibles === 1
              ? "Ya puedes pedir 1 premio."
              : `Ya puedes pedir ${pedibles} premios.`}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button href="/area-privada/alumno/premios">Ver premios</Button>
          <Button href="/area-privada/alumno/premios?ver=ganar" variant="secondary">
            Cómo ganar puntos
          </Button>
        </div>
      </section>

      {/* ── Perfil incompleto: los puntos más fáciles ──────────────────────── */}
      {pidePerfil && (
        <Link
          href="/area-privada/alumno/perfil"
          className="mt-4 flex items-center gap-4 rounded-lg border border-text-strong/10 bg-bg-panel p-4 transition-colors hover:border-accent/40 hover:bg-bg-elevated"
        >
          <IconoPuntos name="perfil" />
          <span className="min-w-0 flex-1">
            <span className="block font-body text-[15px] font-bold text-text-strong">
              Completa tu perfil: +{formatPoints(premioPerfil)} puntos
            </span>
            <span className="block font-body text-sm text-text-muted">
              Te {pendientes.length === 1 ? "falta" : "faltan"} {listaPendientes(pendientes)}.
            </span>
          </span>
          <span aria-hidden="true" className="font-body text-lg text-accent">
            →
          </span>
        </Link>
      )}

      {/* ── Premios pedidos que aún no tiene ───────────────────────────────── */}
      {enCurso.length > 0 && (
        <section aria-labelledby="pedidos" className="mt-10">
          <h2 id="pedidos" className="font-display text-2xl text-text-strong">
            Tus premios pedidos
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {enCurso.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-warning/25 bg-warning/6 p-4"
              >
                <IconoPuntos name={premioPorId.get(c.reward_id)?.icon ?? "regalo"} />
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-[15px] font-bold text-text-strong">
                    {c.rewardName ?? "Premio retirado"}
                  </span>
                  <span className="block font-body text-sm text-text-muted">
                    Pedido {formatRelative(c.requested_at)}. Te escribimos para
                    dártelo.
                  </span>
                </span>
                <Badge variant="warning">En camino</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Últimos movimientos ────────────────────────────────────────────── */}
      <section aria-labelledby="movimientos" className="mt-10">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="movimientos" className="font-display text-2xl text-text-strong">
            Últimos movimientos
          </h2>
          {puntos.events.length > 0 && (
            <Link
              href="/area-privada/alumno/historial"
              className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-accent hover:underline"
            >
              Ver todo →
            </Link>
          )}
        </div>

        {puntos.events.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-text-strong/15 p-5">
            <p className="font-body text-[15px] font-bold text-text-strong">
              Todavía no tienes puntos
            </p>
            <p className="mt-1 font-body text-sm text-text-muted">
              Los primeros llegan rápido: ven a una masterclass, trae a un amigo o
              sube una story etiquetando a @nexusvng.
            </p>
            <Link
              href="/area-privada/alumno/premios?ver=ganar"
              className="mt-3 inline-flex min-h-11 items-center font-body text-sm font-semibold text-accent hover:underline"
            >
              Ver cómo ganar puntos →
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-2 divide-y divide-text-strong/6">
              {puntos.events.map((e) => (
                <Movimiento
                  key={e.id}
                  event={e}
                  icon={iconoDeMovimiento(e, iconosRegla, iconosCanje)}
                />
              ))}
            </ul>
            <Link
              href="/area-privada/alumno/historial"
              className="mt-2 flex min-h-11 items-center justify-center rounded-sm border border-text-strong/10 font-body text-sm font-semibold text-text-body hover:bg-bg-elevated"
            >
              Ver todo mi historial
            </Link>
          </>
        )}
      </section>

      {/* ⏸ Apagado desde el 05-10-2026 (decisión de Pol): próxima clase, tus
          clases con su diario y próximos eventos. Para volver a enseñarlo,
          descomentar esto y el import de arriba.
      <ClasesYEventos studentId={student.id} />
      */}
    </>
  );
}
