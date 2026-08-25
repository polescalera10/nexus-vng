"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ModalidadOption } from "@/lib/queries/catalogo";
import {
  modalidadSchema,
  slugifyModalidad,
  type ModalidadInput,
} from "@/lib/validation/modalidad";

/**
 * Alta de modalidad desde los formularios del panel.
 *
 * El caso real: se está creando un curso o dando de alta a un profe y la
 * disciplina todavía no existe en el catálogo. Antes había que salir, entrar
 * en Supabase Studio y volver. Ahora se crea en el sitio y la opción aparece
 * en el mismo formulario sin perder lo escrito.
 *
 * No usa `useActionState` ni FormData a propósito: iría dentro de otro
 * `<form>`, y anidar formularios es HTML inválido (el navegador cierra el
 * primero y el submit del padre se lleva por delante lo que hubiera dentro).
 * Por eso recibe argumentos sueltos y devuelve un resultado.
 */

export type ModalidadQuickResult =
  | { ok: true; modalidad: ModalidadOption; created: boolean }
  | { ok: false; message: string };

const REVALIDATE = [
  "/area-privada/admin/cursos",
  "/area-privada/admin/profesores",
  "/clases",
];

/** Violación de unique (`modalidades_slug_key`). */
const isDuplicate = (error: { code?: string }) => error.code === "23505";

export async function createModalidadQuick(
  input: ModalidadInput,
): Promise<ModalidadQuickResult> {
  if (!(await isAdminSession())) {
    return { ok: false, message: "No tienes permiso para crear modalidades." };
  }

  const parsed = modalidadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  const { nombre, descripcion, categoria } = parsed.data;
  const slug = slugifyModalidad(nombre);
  if (!slug) {
    return { ok: false, message: "Ese nombre no genera una URL válida." };
  }

  const supabase = await createClient();

  // Si ya existe (aunque esté desactivada), se reactiva en vez de fallar: para
  // quien rellena el formulario el resultado esperado es el mismo — tener esa
  // modalidad disponible en el desplegable.
  const { data: existing } = await supabase
    .from("modalidades")
    .select("id, slug, nombre, categoria, activo")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    if (!existing.activo) {
      const { error } = await supabase
        .from("modalidades")
        .update({ activo: true })
        .eq("id", existing.id);
      if (error) {
        console.error("[createModalidadQuick] reactivar:", error.message);
        return { ok: false, message: "No se ha podido reactivar la modalidad." };
      }
    }
    for (const path of REVALIDATE) revalidatePath(path);
    return {
      ok: true,
      created: false,
      modalidad: {
        id: existing.id,
        slug: existing.slug,
        nombre: existing.nombre,
        categoria: existing.categoria,
      },
    };
  }

  // Al final de la lista, sin pisar el orden del catálogo existente.
  const { data: last } = await supabase
    .from("modalidades")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("modalidades")
    .insert({
      slug,
      nombre,
      descripcion: descripcion || null,
      categoria,
      orden: (last?.orden ?? 0) + 1,
      activo: true,
    })
    .select("id, slug, nombre, categoria")
    .single();

  if (error || !data) {
    console.error("[createModalidadQuick]", error?.message);
    return {
      ok: false,
      message: isDuplicate(error ?? {})
        ? "Ya existe una modalidad con ese nombre."
        : "No se ha podido crear la modalidad.",
    };
  }

  for (const path of REVALIDATE) revalidatePath(path);
  return { ok: true, created: true, modalidad: data };
}
