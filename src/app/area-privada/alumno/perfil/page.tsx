import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth";
import { signAvatarUrl } from "@/lib/avatars";
import { getStudentForUser } from "@/lib/queries/alumno";
import { getPointRule, hasPointEventForRule } from "@/lib/queries/gamificacion";
import { camposPendientes, listaPendientes } from "@/lib/perfil-completo";
import { AvatarUploader } from "./AvatarUploader";
import { PerfilForm } from "./PerfilForm";

export const metadata = { title: "Mi perfil · NEXUS VNG" };
export const dynamic = "force-dynamic";

/**
 * Perfil del alumno.
 *
 * Solo salen los campos que él decide. El estado de la cuota, las notas del
 * profe y la condición de socia fundadora se ven en el inicio pero no se
 * tocan aquí — y tampoco podrían: el guard de Postgres (0044b) los rechaza
 * aunque alguien construya el POST a mano.
 */
export default async function PerfilPage() {
  const { user } = await requireRole("alumno");
  const student = await getStudentForUser(user.id);

  if (!student) {
    return (
      <>
        <h1 className="font-display text-[clamp(30px,5vw,48px)] text-text-strong">
          Mi perfil
        </h1>
        <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
          Tu cuenta está creada, pero todavía no está enlazada a tu ficha de alumno.
          Escríbenos por WhatsApp o díselo a tu profe en la próxima clase.
        </p>
      </>
    );
  }

  const [avatarUrl, reglaPerfil, yaCobrado] = await Promise.all([
    signAvatarUrl(student.avatar_path),
    getPointRule("perfil_completo"),
    hasPointEventForRule(student.id, "perfil_completo"),
  ]);

  // El espejo en TS de `perfil_alumno_completo()` (0045c). Quien paga es el
  // trigger; esto solo cuenta lo que falta para pagarlo.
  const pendientes = camposPendientes(student);
  const premioPerfil = reglaPerfil?.points ?? 0;

  return (
    <>
      <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-accent">
        Tus datos
      </span>
      <h1 className="mt-2 font-display text-[clamp(30px,5vw,48px)] text-text-strong">
        Mi perfil
      </h1>

      {/* El aviso solo aparece mientras haya algo que hacer o algo que celebrar:
          una ficha completa antes de existir la regla no cobra nada y tampoco
          se le promete. */}
      {pendientes.length > 0 && premioPerfil > 0 && (
        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/8 p-5">
          <p className="font-body text-base font-bold text-text-strong">
            Suma {premioPerfil} puntos completando tu perfil
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Rellena {listaPendientes(pendientes)} y entran solos en tu saldo.
          </p>
        </div>
      )}

      {pendientes.length === 0 && yaCobrado && (
        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/8 p-5">
          <p className="font-body text-base font-bold text-text-strong">
            Perfil completo
          </p>
          <p className="mt-1 font-body text-sm text-text-muted">
            Los puntos por completarlo ya están en tu saldo.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        <Card title="Foto">
          <AvatarUploader
            studentId={student.id}
            fullName={student.full_name}
            avatarUrl={avatarUrl}
          />
        </Card>

        <Card title="Tus datos">
          <PerfilForm student={student} />
        </Card>
      </div>
    </>
  );
}
