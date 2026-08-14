# Informe SEO — nexusvng.es

**Fecha:** 14 de agosto de 2026
**Alcance:** SEO técnico, indexación, on-page, contenido, arquitectura y datos estructurados. **Excluido: SEO local** (Google Business Profile, NAP, citaciones, mapas).
**Método:** rastreo completo de las 56 URLs del sitemap, análisis de cabeceras HTTP, medición de TTFB y peso de recursos, extracción de metadatos y JSON-LD, y grafo de enlazado interno. No se han usado datos de Search Console ni de campo (CrUX): las conclusiones de rendimiento son de laboratorio y deben contrastarse con GSC.

---

## Estado de implementación (14 de agosto de 2026)

Todo lo que se podía resolver desde el repositorio está hecho y verificado (`tsc`, `next build`, 89/89 unitarios, 99/99 e2e). Detalle en `MEMORY.md`, entrada «2026-08-14 (3)».

| Punto | Estado |
|---|---|
| 0.1 · 30 landings `/l/` indexables y duplicadas | **Hecho** — `noindex, follow` + fuera del sitemap (56 → 26 URLs) |
| 0.2 · www y dominio raíz ambos a 200 | **Pendiente de Pol** — se configura en el panel de Vercel, no en el repo |
| 0.3 · HTML sin caché y origen en EE. UU. | **Hecho** — cliente Supabase sin cookies + `regions: ["cdg1"]`; las rutas públicas vuelven a ser estáticas |
| 1.1 · Cero contenido informacional | **Pendiente** — requiere escribir; el mapa de 14 artículos sigue vigente |
| 1.2 · Title y H1 de la home | **Hecho** |
| 1.3 · Enlazado interno plano | **Hecho en parte** — nueva sección por disciplina en `/horarios` y anchors descriptivos; falta enlazar eventos desde la home |
| 1.4 · Datos estructurados | **Hecho** — las seis mejoras, salvo `sameAs` de profesores (faltan sus Instagram) |
| 1.5 · Iconos con 404 en producción | **Causa localizada** — ya estaban en `main`; producción iba un despliegue por detrás. El próximo deploy los sube |
| 1.6 · Search Console | **Pendiente de Pol** |
| 2.1 · Titles y descripciones con defectos | **Hecho** |
| 2.2 · Género en fichas de profesoras | **Hecho** |
| 2.3 · Fichas de profesor cortas | **Pendiente** — hacen falta trayectorias reales; el repo prohíbe inventarlas |
| 2.4 · Canibalización entre páginas | **Hecho en parte** — `/horarios` reforzada como propietaria del horario |
| 2.5 · `/horarios` con poco contenido | **Hecho** |
| 2.6 · Sitemap sin `lastmod` fiable | **Hecho** |
| 3.1 · Rendimiento (polyfills, preloads) | **Hecho** |
| 3.2 · Versión en catalán | **Pendiente** — decisión de producto |
| 3.3 · E-E-A-T (testimonios, credenciales) | **Pendiente** — datos reales de Pol |
| 3.4 · Enlaces entrantes | **Pendiente** |
| 3.5 · Detalles menores | **Hecho** — 308 en `/curso-regular`, `noindex` por cabecera en `/area-privada`, guion del `priceRange` |

Sobre la dirección del schema (`Sant Pere de Ribes` frente a `Vilanova i la Geltrú` en el copy): Pol confirma que es intencionado y se mantiene. El local está a dos calles de Vilanova, que es el referente real del público, y la ubicación es temporal — hay traslado previsto para el año que viene.

---

## Resumen ejecutivo

La base técnica está muy por encima de la media del sector: renderizado en servidor, titles y meta descriptions únicas y bien escritas en las 56 URLs, canonical autorreferencial en todas, un H1 por página, sitemap y robots correctos, 404 real, HTTPS con HSTS, imágenes servidas en WebP con `alt` y datos estructurados ricos (`DanceSchool`, `Course` con `hasCourseInstance`, `Event`, `Person`, `FAQPage`, `BreadcrumbList`). Esto no es lo habitual y conviene decirlo antes de la lista de problemas.

Dicho eso, hay tres cosas que están limitando el rendimiento orgánico y una de ellas es un riesgo real:

1. **Treinta landings de campaña (`/l/…`) son indexables, huérfanas y prácticamente idénticas entre sí** (94 % de similitud de texto). Son el 54 % de las URLs indexables del dominio. Es el patrón que el sistema de contenido útil de Google penaliza como contenido escalado de bajo valor, y el castigo es a nivel de sitio, no de página: puede arrastrar a las páginas buenas.
2. **La infraestructura de entrega está mal configurada para SEO.** El HTML se sirve con `no-store`, nunca cachea en CDN (`x-vercel-cache: MISS` en el 100 % de las peticiones) y el origen está en Washington (`iad1`) para un público español. TTFB medido: 500–690 ms cuando debería estar en 50–150 ms.
3. **No hay ni una sola página de contenido informacional.** Las 56 URLs son marca, producto o conversión. El sitio solo puede captar búsquedas de marca y transaccionales, que en este nicho son un volumen muy pequeño. Todo el tráfico de descubrimiento —el de quien aún no sabe que quiere apuntarse— hoy es inalcanzable.

**Ganancias rápidas** (menos de un día de trabajo, impacto alto): `noindex` en las landings de campaña y sacarlas del sitemap, redirección 301 de www a dominio raíz, cachear el HTML, desplegar los iconos que ya están en el repo pero no en producción, y corregir los títulos duplicados de `/eventos/*`.

---

## Prioridad 0 — Crítico

### 0.1 · Treinta landings de campaña indexables, huérfanas y casi idénticas

**Evidencia.** Las 30 URLs bajo `/l/` (`/l/social/*`, `/l/expresion/*`, `/l/pareja/*`, `/l/empezar/*`, `/l/nivel/*`) están en el sitemap, no tienen `meta robots noindex` y reciben **0 o 1 enlaces internos** cada una: son huérfanas dentro del propio sitio. Entre pares de landings la similitud de texto plano es de **0,94 de media** (máximo 0,97) y el solape de 8-gramas exactos del 25 %. La estructura es literalmente la misma plantilla en las 30: cuatro H2 (`… // …: [disciplina] … // Dudas rápidas // ¿Empezamos?`), diez H3, ~780 palabras y un bloque `FAQPage` con las mismas tres preguntas repetidas en 32 páginas del dominio (`¿Dónde estáis?`, `¿Necesito venir con pareja?`, `¿Qué nivel necesito?`).

**Impacto.** Alto y de riesgo sistémico. Google trata estas páginas como *doorway pages* (varias URLs que llevan al mismo destino y ofrecen el mismo valor, segmentadas por ángulo de mensaje) y como contenido escalado. El sistema de contenido útil evalúa el dominio entero: 30 páginas flojas pueden hundir el posicionamiento de `/clases/salsa-cubana`, que sí es buena. Además, diluyen el presupuesto de rastreo y compiten entre ellas por las mismas consultas.

**Qué hacer.** Estas páginas están bien hechas *como landings de pago* —tienen su función en Meta y Google Ads— pero no deben estar en el índice orgánico. La corrección es la opción A; la B solo si se quiere invertir de verdad en ellas.

**Opción A (recomendada, 1 hora).** Excluirlas del índice manteniéndolas vivas para campañas:

```ts
// src/app/(campanas)/l/layout.tsx  (o en cada page.tsx del grupo)
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};
```

Y quitarlas de `src/app/sitemap.ts` (el sitemap debe contener solo URLs canónicas e indexables; incluir una URL con `noindex` es una señal contradictoria). No usar `Disallow` en robots.txt: si se bloquea el rastreo, Google no llega a leer el `noindex` y puede dejarlas indexadas sin snippet. Se bloquea con `noindex`, no con robots.txt.

**Opción B (si se quieren como activo orgánico).** Consolidar las 30 en 5 o 6 páginas —una por cluster: social, expresión, pareja, empezar de cero, nivel— con contenido genuinamente distinto en cada una (mínimo 60 % de texto único, ejemplos propios, fotos propias, testimonios reales) y redirigir 301 las demás a la superviviente de su cluster. Enlazarlas desde el cuerpo de las páginas de disciplina para que dejen de ser huérfanas. Es semanas de trabajo y no lo recomiendo antes de tener contenido informacional.

En ambos casos, **mantener el `canonical` autorreferencial**. Nunca canonicalizar una landing a `/clases`: mezclar `noindex` con canonical cruzado manda señales contradictorias.

### 0.2 · www y dominio raíz devuelven ambos 200, sin redirección

**Evidencia.** `https://www.nexusvng.es/` → 200. `https://nexusvng.es/` → 200. `https://www.nexusvng.es/clases` → 200. No hay 301/308 entre variantes; solo salva la situación el `canonical`, que apunta correctamente al dominio raíz. `http://www…` sí redirige a HTTPS (308).

**Impacto.** Medio-alto. Todo el sitio es accesible en dos hosts. El canonical es una sugerencia, no una directiva: Google puede rastrear e indexar ambas versiones, se divide la autoridad de los enlaces entrantes que apunten a www y se duplica el gasto de rastreo. Con enlaces externos apuntando a la variante equivocada, la señal se pierde.

**Qué hacer.** En Vercel → proyecto → *Settings* → *Domains*: dejar `nexusvng.es` como dominio principal y configurar `www.nexusvng.es` con la opción **Redirect to nexusvng.es (308 Permanent)**. Se hace en el panel, no en `vercel.json`. Después verificar:

```bash
curl -sI https://www.nexusvng.es/clases | head -3
```

Debe devolver `308` y `location: https://nexusvng.es/clases`. El `canonical`, el sitemap y la línea `Sitemap:` de robots.txt ya usan el dominio raíz, así que no hay nada más que tocar.

### 0.3 · El HTML no se cachea nunca y el origen está en Estados Unidos

**Evidencia.** Cabecera de respuesta en todas las páginas públicas:

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
x-vercel-id: cdg1::iad1::…
```

Cuatro mediciones consecutivas de `/clases`: TTFB 0,687 s / 0,608 s / 0,499 s / 0,602 s. Siempre `MISS`. El `cdg1::iad1` significa que la petición entra por el edge de París y viaja a la función en Washington D.C. para cada visita.

**Impacto.** Alto sobre Core Web Vitals y sobre el rastreo. El TTFB entra directamente en el LCP: medio segundo perdido antes de que empiece a llegar el primer byte es medio segundo que no se puede recuperar optimizando imágenes. Google también reduce la frecuencia de rastreo en sitios lentos de responder. Para un sitio de contenido esencialmente estático —horarios, precios y descripciones que cambian una vez por temporada— es un coste totalmente evitable.

**Qué hacer.** Tres cambios, por orden de impacto:

1. **Hacer estáticas las rutas públicas.** El `no-store` indica que Next las está renderizando en modo dinámico. La causa habitual es una llamada a `cookies()`, `headers()` o `noStore()` en el layout del grupo `(public)` —típicamente el bootstrap de Consent Mode o el cliente de Supabase—, que contagia el modo dinámico a todo lo que cuelga de él. Hay que aislar esa lógica en un componente de cliente (`"use client"`) y declarar revalidación en el layout público:

   ```ts
   // src/app/(public)/layout.tsx
   export const revalidate = 3600; // ISR: se regenera cada hora
   ```

   Objetivo: `x-vercel-cache: HIT` y `cache-control` con `s-maxage` y `stale-while-revalidate`.

2. **Mover la región de las funciones a Europa.** En `vercel.json`:

   ```json
   {
     "regions": ["cdg1"],
     "crons": [{ "path": "/api/cron/keep-alive", "schedule": "0 6 * * *" }]
   }
   ```

   (`cdg1` París o `fra1` Fráncfort; ambas a ~20 ms de Barcelona frente a los ~90 ms de `iad1`.) Con ISR funcionando esto importa menos, pero sigue afectando a los formularios y a la primera petición tras cada revalidación.

3. **Verificar después con datos reales**, no de laboratorio: PageSpeed Insights sobre `/`, `/clases` y `/clases/bachata`, y el informe de Core Web Vitals de Search Console pasadas cuatro semanas.

---

## Prioridad 1 — Alto

### 1.1 · Cero contenido informacional: el sitio no puede captar demanda que no sea de marca

**Evidencia.** Las 56 URLs se reparten en: portada, hub y fichas de disciplina, profesores, horarios, eventos, precios, contacto, FAQ, legales y 30 landings de campaña. No hay blog, ni guías, ni glosario, ni comparativas. Todos los titles atacan la misma estructura `[disciplina] en Vilanova i la Geltrú · NEXUS VNG`, es decir, intención transaccional pura.

**Impacto.** Alto y estructural. La demanda transaccional de este nicho (quien busca directamente "clases de salsa" y ya quiere apuntarse) es una fracción pequeña del total. La mayoría del recorrido empieza mucho antes: alguien que se pregunta qué baile aprender, qué diferencia hay entre estilos, si se puede empezar sin pareja, qué ponerse. Hoy esas búsquedas no tienen ninguna página que las reciba, y son además las que alimentan las citas en respuestas de IA (AI Overviews, ChatGPT, Perplexity), que ya es un canal de descubrimiento relevante.

**Qué hacer.** Abrir `/blog` (o `/guias`, que encaja mejor con el tono) y publicar dos artículos al mes con esta estructura de clusters. Cada artículo debe enlazar a la ficha de disciplina correspondiente con anchor descriptivo, y cada ficha debe enlazar de vuelta a dos o tres artículos.

| Cluster | Artículo | Intención | Enlaza a |
|---|---|---|---|
| Elegir baile | Salsa cubana vs. salsa en línea: cuál te pega más | Informacional / comparativa | `/clases/salsa-cubana` |
| Elegir baile | Bachata sensual, dominicana y moderna: guía para no perderte | Informacional | `/clases/bachata` |
| Elegir baile | Qué baile empezar según lo que buscas (test) | Informacional / decisión | `/clases` |
| Empezar | Cómo es tu primera clase de baile, minuto a minuto | Informacional / miedo | `/contacto` |
| Empezar | Aprender a bailar sin pareja: cómo funciona la rotación | Informacional | `/clases/salsa-cubana` |
| Empezar | Qué ropa y qué zapatos llevar a clase de salsa y bachata | Informacional / long tail | `/faq` |
| Empezar | ¿Se puede aprender a bailar sin ritmo? Qué dice la práctica | Informacional | `/clases/bachata` |
| Cultura | Qué es la rueda de casino y por qué engancha | Informacional | `/clases/salsa-cubana` |
| Cultura | Reparto cubano: de dónde sale el género que lo está petando | Informacional / tendencia | `/clases/reparto` |
| Cultura | Glosario del bailador: 40 términos que oirás en clase | Informacional / recurso | `/clases` |
| Progresión | Cuánto se tarda en bailar en una fiesta (por disciplina) | Informacional | `/horarios` |
| Progresión | Los cinco errores del principiante y cómo se corrigen | Informacional | `/profesores` |
| Comunidad | Qué es un social de baile y cómo ir por primera vez | Informacional | `/eventos` |
| Comunidad | Dónde se baila salsa y bachata en el Garraf y alrededores | Informacional / captación | `/eventos` |

Extensión objetivo: 1.200–1.800 palabras con experiencia propia (fotos reales de clase, citas de los profesores, ejemplos de lo que pasa en la sala). El diferencial de E-E-A-T aquí es que sois una escuela real: usadlo. Nada de texto genérico que podría haber escrito cualquiera.

### 1.2 · La portada no compite por la keyword principal

**Evidencia.**
- Title: `NEXUS VNG — Escuela de baile en Vilanova i la Geltrú` (52 car.). La marca ocupa las primeras 9 posiciones.
- H1: `No vienes a una clase. Entras a una comunidad.` — cero keywords.
- La keyword sí aparece, pero en un H2: `Escuela de baile en Vilanova i la Geltrú`.

**Impacto.** Medio-alto. El title es el factor on-page con más peso y el principio del title es lo que más pesa dentro de él. Para una marca sin volumen de búsqueda propio todavía, abrir con el nombre es regalar el espacio más valioso. El H1 refuerza el mensaje de marca, que está bien para conversión, pero deja la señal semántica principal en un nivel inferior.

**Qué hacer.** Mantener el claim como reclamo visual y reordenar las señales:

- **Title:** `Clases de baile en Vilanova i la Geltrú · Salsa y bachata | NEXUS VNG` (68 car.; se trunca algo en móvil, pero lo importante está delante). Alternativa más corta: `Escuela de baile en Vilanova — Salsa y bachata | NEXUS VNG` (57 car.).
- **H1:** `Escuela de baile en Vilanova i la Geltrú`, con el claim actual (`No vienes a una clase. Entras a una comunidad.`) inmediatamente encima o debajo como texto destacado sin marcado de encabezado. Se conserva el impacto y se recupera la señal.
- **Meta description:** la actual es buena; añadir el gancho de conversión al final: `…y clases de prueba para empezar. Reserva la tuya por WhatsApp.`

### 1.3 · Enlazado interno plano: todo pasa por el menú, nada por el cuerpo

**Evidencia.** Recuento de enlaces internos entrantes por URL: portada, `/clases`, `/sobre-nosotros`, `/contacto` y las legales reciben 56 (están en menú y pie, o sea en las 56 páginas). `/horarios` 40. `/socio-fundador`, `/profesores`, `/eventos`, `/faq` 25–26. Las fichas de disciplina, entre 11 y 23 —y las que menos son `/clases/reparto` y `/clases/heels` con 11—. Las fichas de profesor, entre 6 y 10. Las dos páginas de evento, **1 enlace cada una**. Las 30 landings, 0 o 1.

**Impacto.** Medio-alto. La distribución actual reparte autoridad por posición en el menú, no por importancia comercial. `/clases/salsa-cubana` y `/clases/bachata` —que son las que deben rankear— reciben menos enlaces que `/aviso-legal`. Y como casi todos los enlaces vienen de menú y pie, el anchor text es siempre el mismo y aporta poca información semántica adicional.

**Qué hacer.**
1. **Enlaces contextuales en el cuerpo.** En la portada, dentro del bloque de disciplinas, que cada tarjeta enlace con anchor completo (`clases de salsa cubana en Vilanova`, no `Ver más`). En `/sobre-nosotros`, `/faq` y `/horarios`, enlazar a las fichas de disciplina desde el texto corrido cuando se las menciona.
2. **Cross-linking entre disciplinas.** El bloque `Si te gusta Salsa cubana, prueba también` ya existe en las fichas: perfecto, mantener y asegurarse de que las seis fichas se enlazan entre sí de forma equilibrada (hoy reparto y heels quedan descolgadas).
3. **Eventos.** Enlazar cada evento desde la portada y desde la ficha de la disciplina relacionada (la masterclass de bachata, desde `/clases/bachata`). Un evento con un solo enlace entrante tarda semanas en indexarse y llega tarde a su propia fecha.
4. **Profesores.** Enlazar cada profesor desde las fichas de las disciplinas que imparte (ya se hace en salsa cubana: extenderlo a todas) y desde los artículos del blog cuando se les cite.
5. **Reducir el pie.** Las cuatro legales en las 56 páginas absorben enlaces sin ningún retorno. Se pueden mantener (son obligatorias) pero conviene no añadir más ruido ahí.

### 1.4 · Datos estructurados: buena base, seis mejoras concretas

El marcado es sólido y válido. Lo que falta es lo que convierte marcado correcto en resultados enriquecidos y en entidad reconocida.

| # | Problema | Corrección |
|---|---|---|
| a | Cada página repite un bloque `DanceSchool` **sin `@id`**, así que Google ve N organizaciones sueltas en vez de una entidad consolidada. | Añadir `"@id": "https://nexusvng.es/#organization"` al bloque en todas las páginas y referenciarlo desde `provider`, `organizer`, `worksFor` y `offeredBy` con `{"@id": "https://nexusvng.es/#organization"}` en lugar de repetir el objeto entero. |
| b | Los 8 `Event` de `/intensivos` comparten `url` (la del hub) y **no llevan `offers` ni `image`**. | Google exige URL única por evento para el resultado enriquecido. Crear `/intensivos/[slug]` para cada uno, o como mínimo anclas (`/intensivos#salsa-nivel-2`) y añadir `offers` (precio, moneda, `url`, `availability`, `validFrom`) e `image`. Sin `offers` ni `image` no hay ficha enriquecida. |
| c | `/clases` no tiene `ItemList` de los seis cursos. | Añadir un `ItemList` con los seis `Course` referenciados por `@id`. Es lo que habilita el carrusel de cursos. |
| d | `Course` no lleva `image`, `about`, `teaches` ni `educationalLevel`. | Añadirlos: `teaches` con lo que se aprende (los H2 «En clase aprenderás» ya lo dicen), `educationalLevel` con los niveles reales, `image` con la foto de la clase. |
| e | `Person` sin `sameAs` ni `description`. | Añadir `sameAs` con el Instagram de cada profesor y una `description` de una frase. Refuerza E-E-A-T y ayuda a la desambiguación de entidad. |
| f | `BreadcrumbList` solo en 13 de 56 URLs. Faltan en `/clases`, `/profesores`, `/faq`, `/horarios`, `/socio-fundador`, `/sobre-nosotros`, `/contacto` y en las páginas hijas de `/eventos`. | Añadirlo a todas las páginas que no sean la portada. Se traduce en la ruta de migas visible en el resultado de búsqueda, que mejora el CTR. |

Además, dos avisos:

- **`FAQPage` está en 33 de 56 páginas** y tres preguntas se repiten literalmente en 32. Desde 2023 Google solo muestra resultados enriquecidos de FAQ a sitios de autoridad reconocida, así que el beneficio directo es hoy casi nulo; el marcado sigue teniendo valor para respuestas de IA, pero repetirlo en masa no aporta y añade ruido. Al aplicar `noindex` a las landings (punto 0.1), esto se resuelve solo en 30 de las 33. Dejar `FAQPage` en `/faq`, portada y `/socio-fundador`.
- **Inconsistencia de dirección:** el `PostalAddress` del marcado dice `Sant Pere de Ribes` mientras todo el contenido visible dice `Vilanova i la Geltrú`. Aunque el SEO local queda fuera de este informe, una discrepancia entre el dato estructurado y el texto visible es una señal de baja fiabilidad para cualquier motor. Conviene que digan lo mismo, sea cual sea la dirección real.

### 1.5 · Los iconos del sitio están en el repositorio pero no en producción

**Evidencia.** `/favicon.ico`, `/icon.svg`, `/apple-icon.png` y `/manifest.webmanifest` devuelven **404** en producción, y el HTML servido no contiene ninguna etiqueta `<link rel="icon">`. En el repositorio local sí existen: `src/app/favicon.ico`, `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/manifest.ts`, añadidos en el último commit (`453047d feat(brand): set completo de iconos a partir de la N de NEXUS`).

**Impacto.** Medio. Google muestra el favicon junto a cada resultado en móvil; sin él aparece un icono genérico, lo que resta CTR y reconocimiento de marca frente a competidores que sí lo tienen. Es una de las correcciones más baratas del informe.

**Qué hacer.** Desplegar. El commit está en local y producción sigue con una build anterior. Después verificar:

```bash
curl -sI https://nexusvng.es/icon.svg | head -2
```

Y comprobar que el HTML incluye ya `<link rel="icon">`.

### 1.6 · Search Console: sin verificación detectada

**Evidencia.** No hay meta `google-site-verification` en el HTML. GA4 sí está instalado (`G-970MFPCC1J`). La verificación puede estar hecha por DNS o por el propio GA4, así que esto no es concluyente.

**Impacto.** Alto si efectivamente no está. Sin Search Console no hay forma de saber qué se indexa, qué consultas traen impresiones, qué errores de rastreo hay ni cómo evolucionan los Core Web Vitals de campo. Todas las recomendaciones de este informe se miden ahí.

**Qué hacer.** Confirmar que existe una propiedad **de dominio** (no de prefijo de URL) para `nexusvng.es`, que cubre www y no-www a la vez. Enviar el sitemap. Activar también Bing Webmaster Tools (importa la configuración de GSC en dos clics y es la fuente que alimenta a ChatGPT y Copilot).

---

## Prioridad 2 — Medio

### 2.1 · Títulos y descripciones con defectos de plantilla

| Problema | URLs | Corrección |
|---|---|---|
| Marca duplicada en el title | `/eventos/fiesta-social-mensual` → `Fiesta social mensual · Eventos NEXUS VNG · NEXUS VNG`; `/eventos/masterclass-bachata` igual | La plantilla concatena el nombre de la sección (que ya contiene la marca) con el sufijo de marca. Cambiar a `Fiesta social mensual · Eventos · NEXUS VNG`, o mejor con gancho: `Fiesta social de baile en Vilanova · NEXUS VNG` |
| Meta description autogenerada del cuerpo, con puntos suspensivos y saltos de línea | `/eventos/fiesta-social-mensual` (corta en `…la comunid...`), `/eventos/masterclass-bachata` (contiene un salto de línea literal) | Escribir descripciones propias de 150–155 caracteres para cada evento. No autogenerar desde el primer párrafo |
| Descripciones demasiado largas (se truncan) | `/profesores/ana-aylen` (172), `/clases/lady-style` (163), `/sobre-nosotros` (159), `/horarios` (157) | Recortar a 150–155 caracteres. En Ana Aylén, la lista de cinco disciplinas se come el espacio: sustituir por «cinco disciplinas» y dedicar el resto al gancho |
| Descripciones vacías de contenido | `/aviso-legal` (25 car.), `/privacidad` (36), `/cookies` (33) | Poco importantes por ser legales, pero cuestan un minuto: describir de qué trata cada documento en una frase |
| Falta la keyword al inicio en fichas de disciplina | Las seis `/clases/*` | Los titles están bien (`Clases de Salsa cubana en Vilanova i la Geltrú · NEXUS VNG`). El problema está en los H1, que son solo `Salsa cubana`, `Bachata`, `Heels`… Cambiarlos a `Clases de salsa cubana en Vilanova i la Geltrú` y dejar el nombre corto como kicker visual |

### 2.2 · Género incorrecto en las fichas de profesoras

**Evidencia.** Titles: `Martina · Profesor de baile · NEXUS VNG`, `Ana Aylén · Profesor de baile · NEXUS VNG`. En el JSON-LD, `"jobTitle": "Profesor de baile"` en todas las fichas, también las de mujeres.

**Impacto.** Bajo en ranking, alto en percepción de marca: el title es lo primero que ve alguien en Google y en el navegador. Es un fallo de plantilla, no de contenido.

**Qué hacer.** Añadir un campo de género al modelo de datos del profesor o, más simple y robusto, usar una forma neutra en la plantilla: `Martina · Clases de bachata y lady style · NEXUS VNG` (además aporta keywords, que `Profesor de baile` no aporta). Lo mismo en `jobTitle`.

### 2.3 · Fichas de profesor demasiado cortas para posicionar

**Evidencia.** Recuento de palabras: Yuri 159, Davide 198, Martina 240, Ana Aylén 245, Pol 251. Con la plantilla común (menú, pie, CTA) descontada, el contenido único ronda las 80–120 palabras.

**Impacto.** Medio. Son páginas indexables con contenido mínimo y muy repetido entre sí, la misma dinámica de las landings pero en pequeño. Además, la ficha de profesor es una de las páginas con más potencial de conversión: quien la visita ya está decidiendo.

**Qué hacer.** Llevar cada ficha a 350–500 palabras con material que solo vosotros tenéis: trayectoria y formación (dónde ha aprendido, con quién, cuántos años), su forma de dar clase, qué tipo de alumno encaja con su estilo, un vídeo corto de 30 segundos, y sus enlaces de Instagram (que además alimentan el `sameAs` del punto 1.4e). Si alguna ficha no puede llegar ahí, es mejor `noindex` que dejarla fina.

### 2.4 · Riesgo de canibalización entre `/clases`, `/horarios` y la portada

**Evidencia.** El bloque de precios (`Precios claros, sin letra pequeña`, con los mismos H3 `1 estilo / Cada estilo extra / Tarifa plana`) aparece íntegro en la portada y en `/clases`. El horario aparece en la portada, en `/clases` (`Horario de la temporada`), en `/horarios` y en cada ficha de disciplina (`Horario y precio de …`). Cuatro URLs compitiendo por «horarios clases baile Vilanova» y tres por «precios clases de baile».

**Impacto.** Medio. Google elige una sola URL por consulta; cuando varias del mismo sitio compiten, suele elegir peor que tú y las señales se reparten.

**Qué hacer.** Asignar una URL canónica por intención y hacer que las demás enlacen a ella en lugar de duplicar el contenido:

| Intención | URL propietaria | Qué hacen las demás |
|---|---|---|
| Horarios y parrilla | `/horarios` | Portada y `/clases` muestran un resumen visual y enlazan con anchor `consulta el horario completo`. Las fichas muestran solo los días de su disciplina |
| Precios y tarifas | `/socio-fundador` para la oferta fundadora; una sección de `/clases` para las tarifas regulares | La portada muestra el precio de entrada («desde 35 €/mes») y enlaza. No repetir la tabla completa |
| Catálogo de disciplinas | `/clases` | La portada muestra las tarjetas y enlaza |

Añadir además un `ItemList` de cursos en `/clases` (punto 1.4c) para reforzar que esa es la página del catálogo.

### 2.5 · `/horarios` es la página con peor relación importancia/contenido

**Evidencia.** 482 palabras, tres H2 y **ningún H3**. Recibe 40 enlaces internos —la quinta URL más enlazada del sitio— y ataca una consulta con intención altísima.

**Qué hacer.** Estructurar la parrilla semánticamente: un H2 por día (`Lunes`, `Martes`…) o por disciplina, con los grupos y niveles como H3 y el horario en texto plano indexable (no solo dentro de una tabla estilizada o, peor, en una imagen). Añadir un párrafo introductorio con la keyword (`Horario de clases de baile en Vilanova i la Geltrú, temporada 26·27`) y una explicación de cómo se asignan los niveles. Objetivo: 700–900 palabras sin relleno.

### 2.6 · Sitemap con metadatos inútiles y `lastmod` falso

**Evidencia.** Las 56 URLs comparten exactamente el mismo `lastmod` (`2026-08-14T14:39:19.822Z` — la hora del build), `changefreq: monthly` y `priority` de 0,7 a 1.

**Impacto.** Bajo, pero es una señal desperdiciada. Google ignora `changefreq` y `priority` desde hace años, y usa `lastmod` **solo si le parece fiable**: un timestamp idéntico en todas las URLs que cambia en cada despliegue le indica que ese dato no significa nada, y deja de usarlo.

**Qué hacer.** En `src/app/sitemap.ts`, poner en `lastmod` la fecha real de última modificación del contenido de cada página (del CMS, del frontmatter, o de la fecha del commit que tocó ese contenido) y eliminar `changefreq` y `priority`. Con `lastmod` fiable, Google prioriza el rastreo de lo que de verdad ha cambiado.

---

## Prioridad 3 — Bajo / medio plazo

### 3.1 · Rendimiento: peso razonable, dos ajustes pendientes

La medición de laboratorio da un panorama sano una vez resuelto el 0.3: **413 KB de recursos `/_next/` comprimidos** (de los cuales ~200 KB de JavaScript) más 118 KB de HTML. Las imágenes están bien: el original `equipo-nexus.png` pesa 716 KB pero se sirve como WebP de 56 KB vía `next/image`, con `loading="lazy"`, `sizes` correcto y `alt` descriptivo en las tres imágenes de la portada. Las fuentes se precargan por cabecera `Link`. Dos cosas mejorables:

- **`polyfills-*.js` pesa 38,9 KB** y solo sirve a navegadores que ya no existen en vuestro público. Ajustar `browserslist` en `package.json` a algo como `["chrome >= 111", "edge >= 111", "firefox >= 111", "safari >= 16.4"]` elimina la mayor parte.
- **El logo se precarga dos veces** (`<link rel="preload">` para las variantes de 64/128 y 96/256 px) mientras que la imagen que probablemente es el LCP (`equipo-nexus.png`) no se precarga. Poner `priority` en la imagen del héroe y quitar el `priority` del logo del pie.

Ambos son de laboratorio: **confirmar con PageSpeed Insights y con el informe de campo de Search Console** antes de tocar nada más.

### 3.2 · Sin versión en catalán

**Evidencia.** `<html lang="es">`, sin `hreflang`, sin rutas por idioma. El propio JSON-LD declara `"knowsLanguage": ["es-ES","ca-ES"]`, así que en la escuela se habla catalán, pero la web no.

**Impacto.** Medio a largo plazo. Vilanova i la Geltrú está en zona catalanoparlante y una parte relevante de las búsquedas se hace en catalán (`classes de ball`, `escola de ball`, `balls llatins`). Hoy esas consultas no tienen ninguna página que las reciba. La competencia orgánica en catalán suele ser mucho menor que en castellano.

**Qué hacer.** Es un proyecto, no un parche: no traducir por traducir. Si se aborda, hacerlo con estructura de subdirectorio (`/ca/…`), traducción completa del contenido principal (no solo del menú, o se crean duplicados), `hreflang` recíproco con autorreferencia (`es-ES`, `ca-ES`, `x-default`), canonical autorreferencial en cada versión y ambas versiones en el sitemap con `<xhtml:link>`. Media traducción es peor que ninguna. Una alternativa más barata para empezar: publicar dos o tres artículos del blog directamente en catalán y medir qué tal responden antes de comprometerse con el sitio entero.

### 3.3 · E-E-A-T: falta la prueba social y las credenciales

**Evidencia.** No hay reseñas ni testimonios en el sitio, ninguna página muestra credenciales de los profesores, no hay autoría en ningún contenido y el único `sameAs` de la organización es una cuenta de Instagram.

**Impacto.** Medio. En un servicio presencial que se contrata por confianza, la prueba social es a la vez factor de conversión y señal de calidad para Google.

**Qué hacer.** Recoger testimonios **reales** de alumnos (con su consentimiento expreso por escrito, como exige el RGPD, y sin retocar el contenido de la opinión: la Directiva Ómnibus prohíbe publicar reseñas falsas o manipuladas y se sanciona) y publicarlos en la portada, en `/sobre-nosotros` y en las fichas de disciplina. Si se marcan con `Review`/`AggregateRating`, deben corresponder a opiniones reales verificables. Añadir a las fichas de profesor la formación y trayectoria concretas, y ampliar el `sameAs` de la organización con todos los perfiles activos (Instagram, TikTok, YouTube, Facebook).

### 3.4 · Autoridad y enlaces entrantes: sin plan

No se ha podido medir el perfil de enlaces (requiere Ahrefs o Semrush, no disponibles en esta auditoría). Dado que el dominio es nuevo, la hipótesis segura es que el perfil es mínimo. Sin excluir lo local, las vías más productivas para una escuela de baile son: fichas en directorios de escuelas de danza y de deporte, colaboraciones con festivales y congresos de salsa y bachata (que enlazan a las escuelas participantes), notas de prensa a medios comarcales cuando haya evento propio, perfiles de los profesores en plataformas del sector, y colaboraciones cruzadas con gimnasios, academias y organizadores de socials de la zona. Cada evento propio bien difundido es una oportunidad de enlace.

### 3.5 · Detalles menores

- **`/area-privada` devuelve 200 y está bloqueada en robots.txt.** Con `Disallow`, Google no la rastrea pero puede indexar la URL si alguien la enlaza. Más limpio: quitar el `Disallow` y devolver `X-Robots-Tag: noindex` desde el middleware que ya cubre esa ruta.
- **`/curso-regular` responde 307 (temporal) hacia `/clases`.** Si el cambio es definitivo, debe ser **308/301 permanente**; un 307 no transfiere señales de posicionamiento.
- **La CSP sigue en modo `Report-Only`.** No afecta al SEO, pero el comentario del código dice que era temporal y ya han pasado varios días desde el despliegue: conviene revisar los avisos y activarla de verdad.
- **`priceRange: "35–100 €/mes"`** usa un guion largo tipográfico; algunos validadores lo interpretan mal. Usar guion simple.

---

## Plan de acción por orden de ejecución

**Semana 1 — Bloqueantes y ganancias rápidas**
1. `noindex, follow` en las 30 landings `/l/` y sacarlas del sitemap (0.1)
2. Redirección 308 de www a dominio raíz en el panel de Vercel (0.2)
3. Desplegar la build con los iconos (1.5)
4. Corregir la marca duplicada y las descripciones truncadas de `/eventos/*` (2.1)
5. Verificar la propiedad de dominio en Search Console y enviar el sitemap (1.6)

**Semanas 2–3 — Infraestructura y on-page**
6. Rutas públicas a ISR + región europea; verificar `x-vercel-cache: HIT` (0.3)
7. Reescribir title y H1 de la portada y H1 de las seis fichas de disciplina (1.2, 2.1)
8. `@id` de organización, `ItemList` en `/clases`, `BreadcrumbList` en las 43 URLs que no lo tienen, `sameAs` en `Person` (1.4)
9. Enlazado contextual: eventos, profesores y cross-linking entre disciplinas (1.3)
10. `lastmod` real en el sitemap (2.6)

**Mes 2 — Contenido**
11. Abrir `/blog` y publicar los cuatro primeros artículos del cluster «Elegir baile» y «Empezar» (1.1)
12. Ampliar las cinco fichas de profesor y `/horarios` (2.3, 2.5)
13. Reordenar la propiedad de intenciones entre portada, `/clases` y `/horarios` (2.4)

**Mes 3 en adelante — Consolidación**
14. Dos artículos al mes siguiendo el mapa de clusters
15. Testimonios reales y credenciales de profesores (3.3)
16. Páginas individuales de evento con `offers` e `image` (1.4b)
17. Evaluar la versión en catalán con dos artículos piloto (3.2)
18. Plan de enlaces entrantes ligado al calendario de eventos (3.4)

**Cómo medir.** A las cuatro semanas de la semana 1: número de URLs indexadas en Search Console (debe bajar de ~56 a ~26 al desindexar las landings — es lo esperado, no una caída), impresiones totales y CTR medio. A los tres meses: impresiones de consultas sin marca, posición media de las seis fichas de disciplina, y Core Web Vitals de campo en verde.
