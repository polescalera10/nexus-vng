"use server";

import { revalidatePath } from "next/cache";
import { getSessionRole, isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  pointEventSchema,
  pointRuleSchema,
  rewardSchema,
} from "@/lib/validation/gamificacion";

/**
 * Server Actions de gamificación.
 *
 * Reparto de responsabilidades a propósito:
 *   · Aquí se validan permisos y forma de los datos (Zod).
 *   · Las reglas de negocio duras — saldo suficiente, stock, descuento del
 *     canje, aviso al cruzar un hito — viven en triggers de Postgres
 *     (migración 0027). Así se cumplen también si alguien escribe por REST con
 *     la anon key, que es exactamente el agujero que tenía el control de aforo
 *     de matrícula.
 */

export type GamificacionFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export type GamificacionResult = { ok: boolean; message?: string };

const ADMIN_PATHS = [
  "/area-privada/admin/gamificacion",
  "/area-privada/admin/gamificacion/premios",
  "/area-privada/admin/gamificacion/reglas",
];

function revalidateGamificacion(studentId?: string) {
  for (const path of ADMIN_PATHS) revalidatePath(path);
  revalidatePath("/area-privada/alumno");
  if (studentId) revalidatePath(`/area-privada/admin/alumnos/${studentId}`);
}

/* ── Puntos ──────────────────────────────────────────────────────────────── */

/**
 * Apunte manual en el libro mayor. Los puntos pueden ser negativos: corregir
 * un error es otro apunte, nunca editar el anterior (así el histórico cuadra).
 */
export async function addPointEvent(
  _prev: GamificacionFormState,
  formData: FormData,
): Promise<GamificacionFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permiso para dar puntos." };
  }

  const parsed = pointEventSchema.safeParse({
    student_id: formData.get("student_id"),
    points: formData.get("points"),
    concept: formData.get("concept"),
    source: formData.get("source") ?? "manual",
    rule_code: formData.get("rule_code") ?? "",
    occurred_on: formData.get("occurred_on"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("point_events").insert({
    student_id: d.student_id,
    points: d.points,
    concept: d.concept,
    source: d.source,
    rule_code: d.rule_code || null,
    occurred_on: d.occurred_on,
    created_by: user?.id ?? null,
  });

  if (error) {
    console.error("[addPointEvent]", error.message);
    return { status: "error", message: "No se han podido registrar los puntos." };
  }

  revalidateGamificacion(d.student_id);
  return { status: "idle" };
}

/** Borrado de un apunte equivocado (solo admin). */
export async function deletePointEvent(
  id: string,
  studentId: string,
): Promise<GamificacionResult> {
  if (!(await isAdminSession())) return { ok: false, message: "No tienes permiso." };

  const supabase = await createClient();
  const { error } = await supabase.from("point_events").delete().eq("id", id);

  if (error) {
    console.error("[deletePointEvent]", error.message);
    return { ok: false, message: "No se ha podido borrar el apunte." };
  }

  revalidateGamificacion(studentId);
  return { ok: true };
}

/* ── Catálogo de reglas ──────────────────────────────────────────────────── */

export async function savePointRule(
  _prev: GamificacionFormState,
  formData: FormData,
): Promise<GamificacionFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permiso." };
  }

  const parsed = pointRuleSchema.safeParse({
    id: formData.get("id") ?? "",
    code: formData.get("code"),
    label: formData.get("label"),
    points: formData.get("points"),
    source: formData.get("source") ?? "manual",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, ...row } = parsed.data;
  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("point_rules").update(row).eq("id", id)
    : await supabase.from("point_rules").insert(row);

  if (error) {
    console.error("[savePointRule]", error.message);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Ya existe una regla con ese código."
          : "No se ha podido guardar la regla.",
    };
  }

  revalidateGamificacion();
  return { status: "idle" };
}

/* ── Premios ─────────────────────────────────────────────────────────────── */

export async function saveReward(
  _prev: GamificacionFormState,
  formData: FormData,
): Promise<GamificacionFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permiso." };
  }

  const parsed = rewardSchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    cost_points: formData.get("cost_points"),
    stock: formData.get("stock") ?? "",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, ...d } = parsed.data;
  const row = {
    name: d.name,
    description: d.description || null,
    cost_points: d.cost_points,
    stock: d.stock ?? null,
    active: d.active,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("rewards").update(row).eq("id", id)
    : await supabase.from("rewards").insert(row);

  if (error) {
    console.error("[saveReward]", error.message);
    return { status: "error", message: "No se ha podido guardar el premio." };
  }

  revalidateGamificacion();
  return { status: "idle" };
}

/* ── Canjes ──────────────────────────────────────────────────────────────── */

/**
 * Solicitud de canje del propio alumno.
 *
 * El coste se lee de la BD, no del formulario: si viniera del cliente se
 * podría canjear un premio de 500 puntos declarando que cuesta 1. La política
 * RLS de 0027 exige además que `cost_points` coincida con el del premio, así
 * que hay dos barreras para lo mismo a propósito.
 */
export async function requestRedemption(rewardId: string): Promise<GamificacionResult> {
  const role = await getSessionRole();
  if (role === null) return { ok: false, message: "Necesitas iniciar sesión." };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Necesitas iniciar sesión." };

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!student) {
    return { ok: false, message: "Tu usuario no está enlazado a una ficha de alumno." };
  }

  const { data: reward } = await supabase
    .from("rewards")
    .select("id, cost_points, active")
    .eq("id", rewardId)
    .maybeSingle();

  if (!reward || !reward.active) {
    return { ok: false, message: "Ese premio ya no está disponible." };
  }

  const { error } = await supabase.from("reward_redemptions").insert({
    student_id: student.id,
    reward_id: reward.id,
    cost_points: reward.cost_points,
  });

  if (error) {
    console.error("[requestRedemption]", error.message);
    // El trigger `reward_redemptions_apply` es quien valida saldo y stock.
    const detail = error.message ?? "";
    if (detail.includes("saldo insuficiente")) {
      return { ok: false, message: "No tienes puntos suficientes para este premio." };
    }
    if (detail.includes("no quedan unidades")) {
      return { ok: false, message: "Se ha agotado este premio." };
    }
    return { ok: false, message: "No se ha podido solicitar el canje." };
  }

  revalidateGamificacion(student.id);
  return { ok: true, message: "Canje solicitado. Te lo entregamos en clase." };
}

/** El admin marca un canje como entregado o lo cancela (devuelve los puntos). */
export async function resolveRedemption(
  id: string,
  status: "entregado" | "cancelado",
): Promise<GamificacionResult> {
  if (!(await isAdminSession())) return { ok: false, message: "No tienes permiso." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reward_redemptions")
    .update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id ?? null,
    })
    .eq("id", id)
    .select("student_id")
    .maybeSingle();

  if (error) {
    console.error("[resolveRedemption]", error.message);
    return { ok: false, message: "No se ha podido actualizar el canje." };
  }

  revalidateGamificacion(data?.student_id);
  return { ok: true };
}
