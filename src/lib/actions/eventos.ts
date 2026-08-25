"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { madridToIso } from "@/lib/datetime-madrid";
import { eventoSchema } from "@/lib/validation/evento";

/**
 * Server Actions de eventos (solo admin).
 *
 * La tabla `eventos` existía desde el principio y la web pública ya la leía,
 * pero no había ninguna pantalla para escribir en ella: había que entrar en
 * Supabase Studio. Esto es esa pantalla.
 *
 * Las fechas viajan como `datetime-local` (hora de Madrid, sin zona) y se
 * guardan tal cual: la columna es `timestamptz` y Postgres las interpreta con
 * la zona del servidor, así que se les añade el desfase explícito para que la
 * hora que escribe el admin sea la que ve el visitante.
 */

export type EventoFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export type EventoMutationResult = { ok: boolean; message?: string };

const BASE_PATH = "/area-privada/admin/eventos";

function revalidateEventos(slug?: string) {
  revalidatePath(BASE_PATH);
  revalidatePath("/eventos");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/eventos/${slug}`);
}

export async function saveEvento(
  _prev: EventoFormState,
  formData: FormData,
): Promise<EventoFormState> {
  if (!(await isAdminSession())) {
    return { status: "error", message: "No tienes permiso para gestionar eventos." };
  }

  const parsed = eventoSchema.safeParse({
    id: formData.get("id") ?? "",
    titulo: formData.get("titulo"),
    slug: formData.get("slug"),
    tipo: formData.get("tipo"),
    fecha: formData.get("fecha"),
    fecha_fin: formData.get("fecha_fin") ?? "",
    descripcion: formData.get("descripcion") ?? "",
    ubicacion: formData.get("ubicacion") ?? "",
    precio: formData.get("precio") ?? "",
    capacidad: formData.get("capacidad") ?? "",
    puntos: formData.get("puntos") ?? 0,
    cta_url: formData.get("cta_url") ?? "",
    cover_image_url: formData.get("cover_image_url") ?? "",
    publico: formData.get("publico") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  const row = {
    titulo: d.titulo,
    slug: d.slug,
    tipo: d.tipo,
    fecha: madridToIso(d.fecha),
    fecha_fin: d.fecha_fin ? madridToIso(d.fecha_fin) : null,
    descripcion: d.descripcion || null,
    ubicacion: d.ubicacion || null,
    precio: d.precio ?? null,
    capacidad: d.capacidad ?? null,
    puntos: Number(d.puntos),
    cta_url: d.cta_url || null,
    cover_image_url: d.cover_image_url || null,
    publico: d.publico,
  };

  const supabase = await createClient();

  if (d.id) {
    const { error } = await supabase.from("eventos").update(row).eq("id", d.id);
    if (error) {
      console.error("[saveEvento] update:", error.message);
      return {
        status: "error",
        message:
          error.code === "23505"
            ? "Ya hay otro evento con ese slug."
            : "No se han podido guardar los cambios.",
      };
    }
    revalidateEventos(d.slug);
    redirect(BASE_PATH);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("eventos")
    .insert({ ...row, created_by: user?.id ?? null });

  if (error) {
    console.error("[saveEvento] insert:", error.message);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Ya hay un evento con ese slug."
          : "No se ha podido crear el evento.",
    };
  }

  revalidateEventos(d.slug);
  redirect(BASE_PATH);
}

/** Publicar/despublicar sin salir del listado. */
export async function toggleEventoPublico(
  id: string,
  publico: boolean,
): Promise<EventoMutationResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos")
    .update({ publico })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("[toggleEventoPublico]", error.message);
    return { ok: false, message: "No se ha podido cambiar la visibilidad." };
  }

  revalidateEventos(data?.slug);
  return { ok: true };
}

/**
 * Borrado real. Es el único DELETE del panel que no tiene equivalente en
 * "desactivar": un evento despublicado ya no se ve en la web, así que borrar
 * se reserva a los creados por error.
 */
export async function deleteEvento(id: string): Promise<EventoMutationResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso." };
  }

  const supabase = await createClient();
  const { data: evento } = await supabase
    .from("eventos")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) {
    console.error("[deleteEvento]", error.message);
    return { ok: false, message: "No se ha podido borrar el evento." };
  }

  revalidateEventos(evento?.slug);
  return { ok: true };
}
