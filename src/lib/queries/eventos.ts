import { createPublicClient } from "@/lib/supabase/public";
import type { Evento } from "@/types/database";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const eventosFallback: Evento[] = [
  {
    id: "d3b07384-d113-4ec5-a5d6-0c1a84f3d001",
    titulo: "Fiesta social mensual",
    slug: "fiesta-social-mensual",
    tipo: "social",
    fecha: "2026-07-04T21:00:00",
    publico: true,
    descripcion: `¡No te pierdas nuestra gran fiesta mensual en Vilanova! Un espacio ideal para bailar, practicar lo aprendido en clase y compartir risas con la comunidad.

## ¿Qué te espera en el Social?
- **Música:** 50% Salsa Cubana, 50% Bachata, pinchada por nuestros profesores y DJs invitados.
- **Rueda de Casino:** Haremos ruedas improvisadas para todos los niveles a mitad de la noche.
- **Buen ambiente:** Un espacio abierto a alumnos de la escuela y bailadores de toda la zona.

![Gran noche social de salsa y bachata en Vilanova](/images/social_dance_event.png)

### Horario y Ubicación
La fiesta arranca el **sábado 4 de julio a las 21:00h** en las instalaciones de la escuela (dentro del Gimnasio Aranha). Estaremos bailando hasta las 01:30h.

¡Ven a pasar una noche increíble y a quemar la pista de baile!`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "d3b07384-d113-4ec5-a5d6-0c1a84f3d002",
    titulo: "Masterclass de bachata",
    slug: "masterclass-bachata",
    tipo: "masterclass",
    fecha: "2026-07-18T19:00:00",
    publico: true,
    descripcion: `¿Quieres llevar tu bachata al siguiente nivel? Únete a esta sesión intensiva enfocada en la técnica, fluidez de movimiento y conexión en pareja.

## Contenido de la Masterclass
- **Estilo y Conexión:** Técnicas de guiado (leading & following) para marcar figuras complejas de forma suave.
- **Musicalidad:** Aprende a identificar los instrumentos de la bachata (güira, bongo, bajo) y cómo bailar con ellos.
- **Footwork (Pasos libres):** Secuencias divertidas para lucirte individualmente en la pista social.

![Sesión de entrenamiento intensivo de Bachata](/images/bachata_masterclass.png)

### Detalles e Inscripciones
La sesión tendrá lugar el **sábado 18 de julio de 19:00h a 21:00h**.
- **Nivel mínimo aconsejado:** Haber cursado al menos 3 meses de clases (nivel *Empiezo* o superior).
- **Plazas limitadas:** Es necesario reservar tu plaza con antelación para cuadrar el equilibrio del grupo.

¡No te quedes sin tu plaza para esta clase exclusiva!`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Obtener todos los eventos públicos ordenados por fecha ascendente.
 * Si no hay Supabase o la consulta falla, cae al fallback de desarrollo.
 */
export async function getEventos(): Promise<Evento[]> {
  if (!hasSupabaseEnv()) return eventosFallback;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("publico", true)
      .order("fecha", { ascending: true });

    if (error || !data || data.length === 0) return eventosFallback;
    return data;
  } catch {
    return eventosFallback;
  }
}

/**
 * Obtener un único evento por su slug.
 * Si no hay Supabase o la consulta falla, cae al fallback de desarrollo.
 */
export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  if (!hasSupabaseEnv()) {
    return eventosFallback.find((e) => e.slug === slug) ?? null;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("slug", slug)
      .eq("publico", true)
      .maybeSingle();

    if (error || !data) {
      return eventosFallback.find((e) => e.slug === slug) ?? null;
    }
    return data;
  } catch {
    return eventosFallback.find((e) => e.slug === slug) ?? null;
  }
}

/**
 * Obtener slugs de eventos para generateStaticParams.
 */
export async function getEventoSlugs(): Promise<string[]> {
  const list = await getEventos();
  return list.map((e) => e.slug).filter((slug): slug is string => !!slug);
}

/**
 * Slug + fecha real de última edición, para el `lastmod` del sitemap.
 * Ver el porqué en `getModalidadesSitemap()`.
 */
export async function getEventosSitemap(): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  const list = await getEventos();
  return list
    .filter((e): e is Evento & { slug: string } => !!e.slug)
    .map((e) => ({ slug: e.slug, updatedAt: e.updated_at ?? undefined }));
}
