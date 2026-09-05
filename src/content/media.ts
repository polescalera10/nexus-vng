/**
 * Fuente única del material audiovisual de la web pública.
 *
 * Todo lo que hay aquí sale de una grabación REAL de una clase de NEXUS VNG:
 * los intensivos de agosto de 2026, en la sala del gimnasio Aranha. No hay
 * banco de imágenes ni fotografía de archivo — misma regla de honestidad que
 * rige los precios y las reseñas: si no existe la foto de algo, ese hueco se
 * queda vacío en vez de rellenarse con una imagen que no es de la escuela.
 *
 * Los archivos se generan con `scripts/build-media.py` a partir de los .MOV
 * originales (1080×1920, vertical, del móvil). El script recorta, escala y
 * comprime; NO se editan los JPG/MP4 a mano. Si hay que cambiar un fotograma,
 * se cambia el instante en el script y se vuelve a ejecutar.
 *
 * Los vídeos van SIN pista de audio (`-an` en el script). Además de ahorrar
 * peso, evita el problema de derechos de la música que sonaba en la sala: un
 * loop mudo no reproduce nada de nadie.
 *
 * Disciplinas sin material: reggaetón y sexy style. En la home no aparecen (ver
 * `Modalidades`) y en /clases llevan el degradado de marca en el hueco de la
 * foto. En cuanto haya grabación suya, basta con añadir la entrada aquí.
 */

export type MediaImagen = {
  src: string;
  alt: string;
  /** Dimensiones reales del archivo: next/image las necesita para el srcset. */
  ancho: number;
  alto: number;
};

export type MediaVideo = {
  src: string;
  poster: string;
  ancho: number;
  alto: number;
};

/** Todos los recortes verticales del script salen a 900×1200 (3:4). */
const V = { ancho: 900, alto: 1200 } as const;

/* ── Hero de la home ──────────────────────────────────────────────────────
   Dos archivos porque la fuente es vertical y el hero ocupa toda la pantalla:
   en móvil cabe un clip tal cual, pero en escritorio un 1080×1920 estirado a
   pantalla completa se vería reventado. El de escritorio es un tríptico —tres
   clips verticales pegados en horizontal— montado en el propio script. */
export const heroVideo = {
  desktop: {
    src: "/media/hero/hero-desktop.mp4",
    poster: "/media/hero/hero-desktop.jpg",
    ancho: 1920,
    alto: 1080,
  },
  movil: {
    src: "/media/hero/hero-mobile.mp4",
    poster: "/media/hero/hero-mobile.jpg",
    ancho: 720,
    alto: 1280,
  },
  alt: "Alumnos de NEXUS VNG bailando bachata, reparto y lady style en la sala de Vilanova i la Geltrú",
} satisfies { desktop: MediaVideo; movil: MediaVideo; alt: string };

/**
 * Misma imagen, en franja baja, para las cabeceras del resto de páginas.
 *
 * Existe por peso: la banda de título mide unos 250 px de alto y servir ahí el
 * hero completo (2,4 MB) sería pagar por píxeles que se recortan. Estos pesan
 * ~0,9 MB y ~0,4 MB. Ver `HeroFondo`.
 */
export const heroBanda = {
  desktop: {
    src: "/media/hero/banda-desktop.mp4",
    poster: "/media/hero/banda-desktop.jpg",
    ancho: 1440,
    alto: 480,
  },
  movil: {
    src: "/media/hero/banda-mobile.mp4",
    poster: "/media/hero/banda-mobile.jpg",
    ancho: 720,
    alto: 540,
  },
  alt: heroVideo.alt,
} satisfies { desktop: MediaVideo; movil: MediaVideo; alt: string };

/* ── Disciplinas ──────────────────────────────────────────────────────────
   Dos encuadres del mismo momento, no uno recortado por CSS:

   · `portada` (3:4) para las tarjetas altas de la home.
   · `portadaAncha` (4:3) para las tarjetas de /clases y la columna lateral de
     la ficha. Recortar el 3:4 a apaisado con `object-cover` deja la banda
     central del vertical — es decir, las caderas. El recorte apaisado se hace
     en el script, desde el original y anclado a la altura de las caras.

   `loop` es el microvídeo mudo y `galeria` los tres apoyos de la ficha. */
type MediaModalidad = {
  portada: MediaImagen;
  portadaAncha: MediaImagen;
  loop?: MediaVideo;
  galeria: MediaImagen[];
};

/** Recortes apaisados del script: 1200×900 (4:3). */
const A = { ancho: 1200, alto: 900 } as const;

const modalidad = (slug: string, alt: string, altGaleria: string[]): MediaModalidad => ({
  portada: { src: `/media/clases/${slug}.jpg`, alt, ...V },
  portadaAncha: { src: `/media/clases/${slug}-ancha.jpg`, alt, ...A },
  loop: {
    src: `/media/clases/${slug}.mp4`,
    poster: `/media/clases/${slug}.jpg`,
    ancho: 540,
    alto: 960,
  },
  galeria: altGaleria.map((a, i) => ({ src: `/media/clases/${slug}-${i + 1}.jpg`, alt: a, ...V })),
});

export const mediaModalidades: Record<string, MediaModalidad> = {
  "salsa-cubana": modalidad(
    "salsa-cubana",
    "Parejas bailando salsa cubana en una clase de NEXUS VNG",
    [
      "Dos parejas practicando salsa cubana durante la clase",
      "Grupo de salsa cubana repartido por la sala en parejas",
      "Rueda de casino en la clase de salsa cubana",
    ],
  ),
  bachata: modalidad("bachata", "Pareja bailando bachata en una clase de NEXUS VNG", [
    "Pareja trabajando la conexión en la clase de bachata",
    "Parejas bailando bachata durante la clase",
    "Pareja abrazada bailando bachata",
  ]),
  reparto: modalidad("reparto", "Clase de reparto llena de alumnos en NEXUS VNG", [
    "Grupo de reparto siguiendo la coreografía",
    "Sala llena durante la clase de reparto",
    "Alumnas de reparto bailando en grupo",
  ]),
  heels: modalidad("heels", "Alumna de heels bailando en la sala de NEXUS VNG", [
    "Grupo de heels marcando la coreografía",
    "Alumnas de heels trabajando en línea",
    "Clase de heels en la sala de NEXUS VNG",
  ]),
  "lady-style-salsa": modalidad(
    "lady-style-salsa",
    "Profesora de lady style salsa bailando en la sala",
    [
      "Dos alumnas practicando lady style salsa",
      "Clase de lady style salsa en NEXUS VNG",
      "Grupo de lady style salsa bailando",
    ],
  ),
  "lady-style-bachata": modalidad(
    "lady-style-bachata",
    "Grupo de lady style bachata bailando en la sala de NEXUS VNG",
    [
      "Alumnas de lady style bachata frente al espejo",
      "Dos alumnas practicando lady style bachata",
      "Clase de lady style bachata en NEXUS VNG",
    ],
  ),
  /* Las dos compañías no se grabaron aparte. Se ilustran con material de su
     propia disciplina —salsa cubana y bachata lady—, con clips distintos de los
     que usan esas fichas para que no se repita la misma foto. Decisión de Pol
     (05-09-2026): el estilo que se baila es el mismo; lo que las distingue es
     la audición y el compromiso con los ensayos, no la estética de la clase. */
  "cia-salsa": modalidad("cia-salsa", "Pareja bailando salsa cubana en NEXUS VNG", [
    "Alumnos practicando salsa cubana en la sala",
    "Grupo de salsa cubana durante la clase",
    "Parejas bailando salsa cubana",
  ]),
  "cia-bachata-lady": modalidad(
    "cia-bachata-lady",
    "Alumnas bailando bachata lady en NEXUS VNG",
    [
      "Alumna de bachata lady frente al espejo",
      "Grupo de bachata lady durante la clase",
      "Alumnas practicando bachata lady",
    ],
  ),
};

/** Portada vertical (3:4) de una disciplina, o `null` si no hay material suyo. */
export function portadaModalidad(slug: string): MediaImagen | null {
  return mediaModalidades[slug]?.portada ?? null;
}

/** Portada apaisada (4:3), para las tarjetas y columnas que no son altas. */
export function portadaAnchaModalidad(slug: string): MediaImagen | null {
  return mediaModalidades[slug]?.portadaAncha ?? null;
}

/* ── Mosaico de «El corazón son las personas» (home) ─────────────────────
   Quince teselas cuadradas y pequeñas, no cinco grandes: la sección estaba
   ocupando media pantalla para decir algo que se dice mejor con muchas caras
   a la vez. Cuadradas porque a este tamaño un 3:4 se lee como una tira de
   piernas; el recorte 1:1 va anclado arriba, en el script.

   El orden es el de la rejilla y alterna disciplina y tipo de plano a
   propósito. Los nombres van numerados para que `sort` respete ese orden. */
export const mediaMosaico: MediaImagen[] = (
  [
    ["01-reparto-sala", "Sala llena durante una clase de reparto"],
    ["02-bachata-pareja", "Pareja bailando bachata en clase"],
    ["03-heels-grupo", "Grupo de alumnas en la clase de heels"],
    ["04-salsa-rueda", "Alumnos bailando salsa cubana en parejas"],
    ["05-lady-salsa-profe", "Clase de lady style salsa en la sala"],
    ["06-reparto-fila", "Alumnas de reparto siguiendo la coreografía"],
    ["07-bachata-abrazo", "Pareja abrazada bailando bachata"],
    ["08-lady-bachata-grupo", "Grupo de lady style bachata bailando"],
    ["09-salsa-pareja", "Pareja practicando salsa cubana"],
    ["10-heels-coreo", "Alumnas de heels marcando la coreografía"],
    ["11-reparto-grupo", "Grupo de reparto durante la clase"],
    ["12-bachata-parejas", "Parejas bailando bachata en la sala"],
    ["13-lady-salsa-grupo", "Alumnas de lady style salsa en clase"],
    ["14-salsa-pareja-2", "Dos alumnos bailando salsa cubana"],
    ["15-lady-bachata-espejo", "Alumnas de bachata lady frente al espejo"],
  ] as const
).map(([slug, alt]) => ({ src: `/media/mosaico/${slug}.jpg`, alt, ancho: 800, alto: 800 }));

/* Tira de /socio-fundador: tres disciplinas distintas, porque lo que vende esa
   página es justamente el acceso a todas. */
export const mediaSocioFundador: MediaImagen[] = [
  { src: "/media/clases/salsa-cubana-1.jpg", alt: "Clase de salsa cubana en NEXUS VNG", ...V },
  { src: "/media/clases/bachata-1.jpg", alt: "Clase de bachata en NEXUS VNG", ...V },
  { src: "/media/clases/reparto-1.jpg", alt: "Clase de reparto en NEXUS VNG", ...V },
  { src: "/media/clases/heels-1.jpg", alt: "Clase de heels en NEXUS VNG", ...V },
];

/** Apoyos de /sobre-nosotros. */
export const mediaSobreNosotros = {
  sala: {
    src: "/media/comunidad/sala-panoramica.jpg",
    alt: "Vista general de la sala de baile de NEXUS VNG en el gimnasio Aranha",
    ancho: 1200,
    alto: 750,
  },
  clase: {
    src: "/media/comunidad/clase-bachata.jpg",
    alt: "Alumnos bailando en pareja durante una clase de bachata",
    ancho: 1200,
    alto: 750,
  },
} satisfies Record<string, MediaImagen>;

/* ── Intensivos de agosto 2026 ────────────────────────────────────────────
   Una imagen por sesión, indexada por el `value` de content/intensivos.ts.
   Son fotogramas de ESA sesión concreta, no de otra: la página es el archivo
   de lo que se hizo cada día. */
export const mediaIntensivos: Record<string, MediaImagen> = Object.fromEntries(
  (
    [
      ["intensivo-salsa-lun17", "Alumnos bailando en el intensivo de salsa nivel 2"],
      ["intensivo-bachata-lady-mar18", "Alumnas en el intensivo de bachata lady"],
      ["intensivo-reparto-mie19", "Sala llena en el intensivo de reparto"],
      ["intensivo-bachata-jue20", "Pareja bailando en el intensivo de bachata desde cero"],
      ["intensivo-heels-lun24", "Grupo bailando en el intensivo de heels"],
      ["intensivo-salsa-mar25", "Parejas en el intensivo de salsa desde cero"],
      ["intensivo-lady-salsa-mie26", "Alumna bailando en el intensivo de lady salsa"],
      ["intensivo-bachata-jue27", "Pareja bailando en el intensivo de bachata nivel 2"],
    ] as const
  ).map(([value, alt]) => [
    value,
    { src: `/media/intensivos/${value}.jpg`, alt, ancho: 960, alto: 600 },
  ]),
);
