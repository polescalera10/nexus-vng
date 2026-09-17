import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getModalidadOptions } from "@/lib/queries/catalogo";
import { getTeachers } from "@/lib/queries/teachers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";

export const metadata = { title: "Profesores · NEXUS VNG" };

/** Lista del equipo docente (solo admin). */
export default async function ProfesoresPage() {
  await requireRole("admin");

  const [teachers, modalidades] = await Promise.all([
    getTeachers(),
    getModalidadOptions(),
  ]);
  const nombreBySlug = new Map(modalidades.map((m) => [m.slug, m.nombre]));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(30px,4.5vw,44px)] text-text-strong">
            Profesores
          </h1>
          <p className="mt-2 font-body text-base text-text-muted">
            Equipo docente, disciplinas y acceso al panel.
          </p>
        </div>
        <Button href="/area-privada/admin/profesores/nuevo">Nuevo profesor</Button>
      </div>

      <div className="mt-8">
        {teachers.length === 0 ? (
          <EmptyState
            title="Todavía no hay profesores"
            description="Da de alta al primer profesor para poder asignarle cursos."
            action={
              <Button href="/area-privada/admin/profesores/nuevo">Nuevo profesor</Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Nombre</Th>
                <Th>Disciplinas</Th>
                <Th>Teléfono</Th>
                <Th>Acceso</Th>
                <Th>Estado</Th>
              </Tr>
            </THead>
            <TBody>
              {teachers.map((t) => (
                <Tr key={t.id} className={t.active ? "" : "opacity-60"}>
                  <Td>
                    <Link
                      href={`/area-privada/admin/profesores/${t.id}`}
                      className="font-semibold text-text-strong hover:text-accent"
                    >
                      {t.full_name}
                    </Link>
                  </Td>
                  <Td>
                    {t.disciplines.length === 0 ? (
                      <span className="text-text-faint">—</span>
                    ) : (
                      <span className="flex flex-wrap gap-1.5">
                        {t.disciplines.map((slug) => (
                          <Badge key={slug}>{nombreBySlug.get(slug) ?? slug}</Badge>
                        ))}
                      </span>
                    )}
                  </Td>
                  <Td>{t.phone ?? <span className="text-text-faint">—</span>}</Td>
                  <Td>
                    {t.profile_id ? (
                      <Badge variant="success">Con acceso</Badge>
                    ) : (
                      <Badge>Sin acceso</Badge>
                    )}
                  </Td>
                  <Td>
                    {t.active ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <Badge variant="danger">De baja</Badge>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </>
  );
}
