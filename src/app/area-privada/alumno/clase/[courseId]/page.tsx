import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoEmbed } from "@/components/alumno/VideoEmbed";
import { AlumnoShell } from "@/app/area-privada/alumno/Shell";
import { requireRole } from "@/lib/auth";
import { getStudentForUser } from "@/lib/queries/alumno";
import { getCursoDelAlumno, getDiarioDelCurso } from "@/lib/queries/diario";
import { formatSessionDay, formatTime, WEEKDAYS } from "@/lib/format";

export const metadata = { title: "Mi clase · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Diario de una clase del alumno: sesión a sesión, de la más reciente a la más
 * antigua, con lo que se dio, los vídeos y si fue o no.
 *
 * El alumno que no está matriculado en este curso recibe un 404, no un "no
 * tienes acceso": lo segundo ya confirma que el curso existe.
 */
export default async function ClaseDelAlumnoPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { user } = await requireRole("alumno");
  const student = await getStudentForUser(user.id);
  if (!student) notFound();

  const { courseId } = await params;
  const detalle = await getCursoDelAlumno(student.id, courseId);
  if (!detalle) notFound();

  const diario = await getDiarioDelCurso(student.id, courseId);
  const { course, teacherNames, modalidadNombre, nivelNombre } = detalle;

  // Una sesión sin resumen ni vídeos no aporta nada al alumno: el profe aún no
  // ha subido nada. Se cuentan para el aviso, pero no se pintan como tarjetas
  // vacías que parecen un error.
  const conContenido = diario.filter((s) => s.resumen || s.videos.length > 0);
  const asistidas = diario.filter((s) => s.asistio === true).length;
  const conLista = diario.filter((s) => s.asistio !== null).length;

  return (
    <AlumnoShell email={user.email}>
      <Link
        href="/area-privada/alumno"
        className="font-body text-sm font-semibold text-text-muted hover:text-accent"
      >
        ← Mi área
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="font-display text-[clamp(28px,4.5vw,44px)] text-text-strong">
          {course.name}
        </h1>
        {nivelNombre && <Badge>{nivelNombre}</Badge>}
      </div>

      <p className="mt-2 font-body text-sm text-text-muted">
        {WEEKDAYS[course.weekday]} · {formatTime(course.start_time)} ·{" "}
        {course.duration_min} min
        {teacherNames.length > 0 && <> · con {teacherNames.join(" y ")}</>}
        {modalidadNombre && <> · {modalidadNombre}</>}
      </p>

      {conLista > 0 && (
        <p className="mt-4 font-body text-sm text-text-body">
          Has venido a{" "}
          <strong className="font-bold text-accent">
            {asistidas} de {conLista}
          </strong>{" "}
          {conLista === 1 ? "clase" : "clases"}.
        </p>
      )}

      <h2 className="mt-10 font-display text-2xl text-text-strong">
        Lo que hemos dado
      </h2>

      {conContenido.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Todavía no hay nada colgado"
            description={
              diario.length === 0
                ? "Cuando empiecen las clases, aquí verás el resumen y los vídeos de cada una."
                : "Tu profe sube el resumen y el vídeo después de cada clase. En cuanto lo haga, aparece aquí."
            }
          />
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {conContenido.map((sesion) => (
            <li key={sesion.id}>
              <Card
                title={formatSessionDay(sesion.session_date)}
                action={
                  sesion.status === "cancelada" ? (
                    <Badge variant="danger">Cancelada</Badge>
                  ) : sesion.asistio === false ? (
                    <Badge variant="warning">No viniste</Badge>
                  ) : sesion.asistio === true ? (
                    <Badge variant="success">Viniste</Badge>
                  ) : null
                }
              >
                {sesion.resumen && (
                  <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-text-body">
                    {sesion.resumen}
                  </p>
                )}

                {sesion.videos.length > 0 && (
                  <div
                    className={`grid gap-3 ${sesion.resumen ? "mt-4" : ""} ${
                      sesion.videos.length > 1
                        ? "sm:grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]"
                        : ""
                    }`}
                  >
                    {sesion.videos.map((v) => (
                      <VideoEmbed key={v.id} url={v.url} titulo={v.titulo} />
                    ))}
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AlumnoShell>
  );
}
