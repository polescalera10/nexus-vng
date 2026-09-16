/**
 * Configuración de marca y NAP (Name · Address · Phone).
 * FUENTE ÚNICA de los datos de contacto y redes: todo el sitio (footer,
 * contacto, JSON-LD, enlaces sociales) lee de aquí. Cambiar un dato aquí
 * lo cambia en toda la web.
 *
 * Regla: los campos vacíos ("") significan "dato aún no confirmado" y la UI
 * no los muestra. Rellenar y aparecen solos.
 */
export const site = {
  name: "NEXUS VNG",
  legalName: "NEXUS VNG",
  description:
    "Escuela de salsa cubana, bachata y más en Vilanova i la Geltrú. Comunidad, niveles desde cero a avanzado y clases de prueba para empezar.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexusvng.es",
  locale: "es_ES",
  /**
   * Localidad de MARCA: la que aparece en el copy, los títulos y el SEO.
   *
   * Ojo, no coincide con el municipio del NAP y es a propósito (decisión de
   * Pol, 01-08-2026): la sala está en Sant Pere de Ribes, pegada a Vilanova,
   * pero el público, las búsquedas y el local propio previsto son de Vilanova.
   * Para textos usa SIEMPRE `site.locality`; para direcciones y schema,
   * `site.nap` — que lleva el dato verificable.
   */
  locality: "Vilanova i la Geltrú",
  /** Comarca: sirve para el área de servicio y para el copy de alcance. */
  area: "Garraf",
  nap: {
    /** Nombre del local tal y como lo conoce la gente (se muestra en dirección). */
    venue: "Gimnasio Aranha",
    streetAddress: "Rambla del Garraf, 32, 1a Planta",
    /** Municipio REAL de la sala. No usar en copy — para eso está `site.locality`. */
    addressLocality: "Sant Pere de Ribes",
    addressRegion: "Barcelona",
    postalCode: "08812",
    addressCountry: "ES",
    /** Teléfono visible (formato local). El de WhatsApp sale de env o del fallback de abajo. */
    telephoneDisplay: "+34 669 29 10 88",
  },
  /**
   * Coordenadas de la ficha verificada de Google Business Profile (16-09-2026),
   * las que Google tiene para el negocio (no un pin puesto a mano). El schema
   * y el mapa de /contacto tienen que decir lo mismo que la ficha.
   */
  geo: { latitude: 41.2341134, longitude: 1.7475994 },
  google: {
    /** Enlace estable a la ficha (por `cid`); los enlaces cortos de "Compartir" caducan de formato. */
    mapsUrl: "https://maps.google.com/?cid=16291257308548571784",
    /** Formulario de reseña de la ficha. Pedirla a todos y sin nada a cambio (docs/seo-local-kit). */
    reviewUrl: "https://g.page/r/CYgihhQ1LBbiEBM/review",
  },
  social: {
    instagram: "https://www.instagram.com/nexusvng",
    instagramHandle: "@nexusvng",
    // TODO: URL real de TikTok — mientras esté vacío, la UI no pinta el enlace.
    tiktok: "",
  },
} as const;

/** Número de WhatsApp en formato internacional sin '+' (ej: 34669291088). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34669291088";
