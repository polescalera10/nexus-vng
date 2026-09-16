# Informe SEO — nexusvng.es

**Fecha:** 15 de septiembre de 2026
**Objetivo:** posicionar NEXUS VNG por encima de las escuelas de baile de Vilanova i la Geltrú y el Garraf.
**Alcance:** técnico, on-page, datos estructurados, contenido, enlazado, E-E-A-T, SEO local, autoridad, búsqueda con IA y catalán. A diferencia del informe del 14-08, **aquí sí entra el SEO local**, porque es donde se decide la búsqueda "escuela de baile Vilanova".

**Método.** Rastreo de las 28 URLs del sitemap en producción (status, title, meta, H1/H2, canonical, robots, JSON-LD, palabras, imágenes, enlaces), cabeceras HTTP, variantes www/http/barra final, rutas 404, y revisión de competidores (webs, sitemaps, directorios y resultados de búsqueda).

**Limitaciones.** Sin Search Console, sin Ahrefs (conector sin autorizar) y con el conector de Google Analytics caído (`invalid_grant`). La API de PageSpeed agotó su cuota diaria: los datos de rendimiento son los del 15-08. Los resultados de búsqueda de competidores salen de un buscador web genérico, no de Google España: sirven para ver quién tiene presencia, no para dar posiciones exactas.

---

## Estado de implementación (16 de septiembre de 2026)

Todo lo que se podía resolver desde el repositorio está hecho, desplegado y verificado en producción, una tarea tras otra. El detalle de cada verificación está en `MEMORY.md`.

| Punto | Estado |
|---|---|
| Titles y H1 sin keyword (§5) | **Hecho** — `4515fe3` |
| Meta descriptions sin ciudad ni acción (§5) | **Hecho** — `eff9864` |
| `/eventos` vacía e indexable (§1) | **Hecho** — `2396512`, sitemap de 28 a 27 URLs |
| `/intensivos` con edición pasada y `Event` caducados (§1) | **Hecho** — `5fc5cc4` |
| `image` del schema con foto antigua (§4) | **Hecho** — `7e42dc7` |
| Mapa en `/contacto` (§9) | **Hecho** — `c98cc41`, fachada de dos clics |
| Rendimiento y CSP (§2) | **Medido, sin cambios** — LCP móvil 1,3–2,0 s y CLS 0 (Chromium con CPU ×4 y 4G lenta; la API de PageSpeed lleva días sin cuota). CSP bloqueante confirmada |
| Falta hub informacional (§6, §7) | **Infraestructura hecha** — `283b7f8`: `/blog` y `/blog/[slug]`, `BlogPosting`, enlace de ida y vuelta con las fichas. En `noindex` hasta el primer artículo |
| Material para GBP, reseñas, directorios, prensa y bios (§8, §9, §10) | **Preparado** — `docs/seo-local-kit-2026-09-15.md` |
| Brief del primer artículo (§7) | **Hecho** — `docs/briefs/salsa-cubana-o-bachata-brief.md` |
| `lastmod` desactualizado (§1) | **Hecho** — fechas reales en `content/actualizaciones.ts` |
| www sin redirigir · Search Console · Bing · GBP · reseñas · directorios · bios · artículos | **Pendiente de Pol** — ninguno se puede hacer desde el repositorio |

Efecto secundario útil: `scripts/seo-crawl.py` rastrea el sitemap y compara contra `docs/seo-baseline-2026-09-15.jsonl`, así que cualquier cambio futuro se mide contra la foto previa a este trabajo.

---

## Valoración por ámbito

| Ámbito | Nota | En una línea |
|---|---|---|
| Rastreo e indexación | **8,0** | Limpio. Queda el www sin redirigir desde agosto |
| Rendimiento y seguridad | **8,0** | CDN en París con caché HIT, HSTS. LCP móvil de 4,5 s en la última medición |
| Mobile y UX | **9,0** | Mobile-first real, alt en el 100 % de las imágenes |
| Datos estructurados | **8,0** | El mejor marcado de la zona. Faltan `geo`, `hasMap`, `sameAs` y reseñas |
| On-page (titles, meta, H1) | **7,0** | Fichas de disciplina muy bien; páginas de apoyo sin keyword |
| Arquitectura y enlazado interno | **6,5** | Buen cruce entre disciplinas; eventos vacío y profesores finos |
| Búsqueda con IA (GEO) | **5,0** | Hechos claros y FAQ, pero nada que citar más allá de la ficha comercial |
| E-E-A-T y prueba social | **4,5** | Fotos y vídeo reales (gran avance). Cero reseñas, cero trayectorias |
| Contenido y profundidad | **4,0** | Ni una página informacional. Todo es transaccional |
| SEO local | **3,0** | NAP incoherente, fuera de los directorios, sin reseñas visibles |
| Autoridad y enlaces | **2,0** | Dominio nuevo, sin enlaces detectables, marca que colisiona con otra empresa |
| Cobertura en catalán | **1,0** | Inexistente, en una zona catalanoparlante |
| **Global** | **5,5** | **Técnica de 8, visibilidad de 3** |

**Lectura corta.** La web es técnicamente la mejor de la competencia con diferencia: ninguna escuela de la zona tiene SSR, schema de `Course` con horarios, canonicals limpias y fotos reales optimizadas. Pero Google no posiciona a quien mejor está construido, sino a quien más señales tiene de ser relevante, cercano y de confianza. Ahí NEXUS está por detrás de Bimba Dance, que es la rival directa. El margen está en tres frentes: **Google Business Profile con reseñas, contenido que no sea de venta y presencia en catalán.** Nada de eso se arregla desde el código.

---

## Competencia

| Escuela | Web | Qué hace bien | Punto débil |
|---|---|---|---|
| **Bimba Dance** (Axerum, Vilanova) | bimbadance.com — WordPress | Rival directa en salsa/bachata. Sale en todas las búsquedas probadas. Tiene páginas por keyword exacta: `/clases-de-baile/`, `/academia-bachata-vilanova-geltru-bimba/`, `/escuela-baile-vilanova-geltru-bimba/`, `/salsa-en-vilanova-i-la-geltru/`, `/fiestas/`, `/inscripciones/`. "Primera clase gratis" en la meta. Ficha en go&dance | Páginas casi duplicadas entre sí (mismo patrón que tumbamos en las `/l/`). Web bloquea bots y renderiza poco texto. Sin schema detectable |
| **Estudi de Dansa TS** | estudidedansa.com — WordPress + Yoast | En catalán. `LocalBusiness` con `GeoCoordinates`, `VideoObject`, blog con posts | Generalista (ballet, hip hop, flamenco); la salsa es secundaria |
| **Dance Gold Escola de Ball** | dancegold.es | Aparece en directorios de la ciudad | Sitemap con 4 URLs (home + legales), title vacío. Web casi inexistente |
| **Flow Center** | Sin dominio localizado | Ficha en salsaybachata.net con 5,0 (3 reseñas); aparece en sientelbaile.com | Depende de directorios |
| **Teresa Carulla** | teresacarulla.com | 35 años de trayectoria, citada en la guía de Eix Diari | Certificado SSL mal configurado |
| **JL Dance, Dancing Queens, TuTumbao** | Facebook / directorios | Presencia en redes y listados | Sin web propia relevante |

**Conclusión.** El listón técnico está bajísimo; el de presencia local, no. Bimba gana por antigüedad, reseñas y páginas exact-match, no por calidad. NEXUS **no aparece en ninguno** de los directorios revisados (sientelbaile.com, salsaybachata.net, go&dance, Cylex, Fixando) ni en ninguna búsqueda genérica probada.

---

## Hallazgos por ámbito

Formato: **Fallo** · impacto · **Cómo arreglarlo**. Impacto: Alto / Medio / Bajo.

### 1. Rastreo e indexación — 8,0

Bien: robots.txt abierto con sitemap, 28 URLs todas 200, canonical autorreferencial en todas, `/l/*` en `noindex, follow`, `/area-privada` con `X-Robots-Tag: noindex`, 404 reales con `noindex`, 308 en `http→https`, barra final y `/curso-regular`.

- **`www.nexusvng.es` sigue devolviendo 200** (pendiente desde el 14-08). · Alto · Vercel → Settings → Domains → `www.nexusvng.es` → *Redirect to nexusvng.es (308)*. Comprobar con `curl -sI https://www.nexusvng.es/clases`.
- **`/eventos` es indexable con 41 palabras** y el texto "Estamos preparando el calendario". Página vacía = soft 404 para Google. · Medio · `noindex` mientras no haya eventos reales, o convertirla en una página de "socials y fiestas de baile en el Garraf" con contenido propio.
- **`/intensivos` habla de una edición terminada** ("agosto 2026… Esta edición ya ha terminado") con 8 `Event` en pasado. · Medio · Reorientarla a evergreen: "Intensivos de baile de verano en Vilanova", con la edición 2026 como archivo y fecha de la próxima cuando exista. Quitar los `Event` pasados del JSON-LD o marcarlos solo como históricos.
- **`lastmod` congelado** (5 URLs a 01-08, 13 a 14-08, 10 a 25-08) aunque el 05-09 se cambiaron fotos y vídeos en casi todas. · Bajo · Actualizar `src/content/actualizaciones.ts` al tocar contenido.
- **Search Console y Bing Webmaster sin verificar desde el repo.** · Alto · Propiedad de dominio en GSC, enviar sitemap, importar a Bing (alimenta ChatGPT y Copilot). Sin esto no se puede medir nada de este informe.

### 2. Rendimiento y seguridad — 8,0

Bien: `x-vercel-cache: HIT` desde `cdg1`, TTFB 0,17–0,35 s, HSTS con preload, `nosniff`, `Permissions-Policy`, CSS inline.

- **LCP móvil 4,5 s** en la última medición (PSI, 15-08, rendimiento 85). Desde entonces se añadió vídeo en el hero de todas las cabeceras. · Medio · Pasar PSI de nuevo en `/`, `/clases` y `/clases/bachata`. El póster debe ser el LCP y cargar con `fetchpriority="high"`; el vídeo, nunca antes del póster.
- **Home de 172 KB de HTML** (27 imágenes). · Bajo · Revisar que las 15 teselas del mosaico sean `lazy` y no viajen en el payload RSC más de una vez.
- **CSP en `Report-Only`** desde agosto. · Bajo (no SEO) · Pasarla a real y volver a poner `upgrade-insecure-requests`.

### 3. Mobile y UX — 9,0

Bien: e2e de desbordamiento a 320 px, objetivos táctiles ≥44 px, `alt` en 100 % de imágenes, vídeo que respeta `prefers-reduced-motion` y `saveData`.

- **CTA de WhatsApp sin medir como conversión orgánica.** · Medio · Evento GA4 `click_whatsapp` con `page_location` y marcado como evento clave, para saber qué URL orgánica convierte.

### 4. Datos estructurados — 8,0

Bien: `DanceSchool` con `@id` único, `Course` + `CourseInstance` + `Schedule` + `Offer` en las 10 fichas, `ItemList` en `/clases`, `BreadcrumbList`, `Person`, `FAQPage`, `Offer` con `inventoryLevel` real en `/socio-fundador`.

- **Sin `geo` ni `hasMap`** en `DanceSchool`. · Medio · Añadir coordenadas de Rambla del Garraf 32 y la URL de la ficha de Google Maps.
- **`sameAs` solo con Instagram.** · Medio · Añadir la URL de Google Business Profile, TikTok, Facebook, YouTube cuando existan. Es lo que desambigua la entidad (ver punto 10: nexusvng.com es otra empresa).
- **`Person` sin `sameAs`** (Instagram de cada profe). · Bajo.
- **`image` de la organización apunta a `equipo-nexus.png`**, foto anterior al material real. · Bajo · Usar una foto del material de agosto.
- **Sin `AggregateRating`.** · Bajo hasta que haya reseñas · Solo con reseñas reales y verificables (Directiva Ómnibus). Nunca autogeneradas.

### 5. On-page — 7,0

Bien: las 10 fichas de disciplina tienen title y H1 con "Clases de X en Vilanova i la Geltrú"; home con H1 "Escuela de baile en Vilanova i la Geltrú"; titles únicos, ninguno por encima de 64 caracteres.

| URL | Fallo | Propuesta |
|---|---|---|
| `/clases` | Title `Clases de Baile · Curso Regular · NEXUS VNG` sin ciudad; H1 "Aprende a bailar y encuentra tu gente" sin keyword | Title `Clases de baile en Vilanova i la Geltrú · Salsa, bachata y más`; H1 `Clases de baile en Vilanova i la Geltrú` con el claim como subtítulo |
| `/horarios` | H1 "Horarios" | H1 `Horarios de clases de baile en Vilanova i la Geltrú` |
| `/eventos` | Title `Eventos de Baile · NEXUS VNG`, H1 "Eventos", 0 H2 | Ver punto 1 |
| `/sobre-nosotros` | Title sin keyword | `Escuela de baile en Vilanova i la Geltrú · Sobre NEXUS VNG` |
| `/contacto` | Title y H1 "Contacto" | `Contacto y clase de prueba · Escuela de baile en Vilanova` |
| `/faq` | Title sin keyword | `Preguntas frecuentes sobre clases de baile en Vilanova` |
| `/profesores/*` | H1 solo con el nombre; "Clases de baile" genérico en 3 titles | H1 `Pol, profesor de salsa cubana y reparto`; title con las disciplinas principales |
| `/clases/lady-style-salsa` | Meta de 183 caracteres (se trunca) | Recortar a 150–155 |
| 10 fichas `/clases/*` | La meta description no menciona Vilanova ni invita a la acción ("El baile social por excelencia…") | Añadir ciudad y gancho: "…Grupos desde cero en Vilanova. Reserva tu clase de prueba." |
| Home | Meta sin CTA | Cerrar con "Reserva tu clase de prueba por WhatsApp" |

**Cuidado con la oferta en la meta.** Bimba dice "Primera clase gratis". Si NEXUS no tiene clase de prueba gratuita confirmada (sigue como `TODO` en el repo), no copiarlo: publicidad engañosa.

### 6. Arquitectura y enlazado interno — 6,5

Bien: cada ficha enlaza a sus profesores y a disciplinas relacionadas; 20–36 enlaces internos por página; profundidad máxima de 2 clics.

- **Fichas de profesor con 84–176 palabras** (Yuri 84, Davide 121). Son páginas indexables casi vacías. · Medio · 350–500 palabras con trayectoria real, forma de dar clase y para quién encaja. Si no hay datos, `noindex` hasta tenerlos.
- **No hay hub informacional** al que enlazar desde las fichas. · Alto · Se resuelve con `/guias` (punto 7).
- **`/socio-fundador` es un producto con fecha de caducidad** (10 plazas, quedan 2). · Bajo · Decidir antes de que se agote qué pasa con la URL: 308 a `/clases` o reconvertirla en página de tarifas.

### 7. Contenido y profundidad — 4,0

- **Cero contenido informacional** (pendiente desde el 14-08). Hoy la web solo puede captar a quien ya busca apuntarse. · Alto · Abrir `/guias` y publicar 2 artículos al mes. Por la regla de `CLAUDE.md`, todo pasa por la skill `blog` (score mínimo 90). Prioridad por demanda local y cercanía a conversión:

| # | Artículo | Keyword objetivo | Enlaza a |
|---|---|---|---|
| 1 | Salsa cubana o bachata: cuál aprender primero | salsa o bachata | `/clases/salsa-cubana`, `/clases/bachata` |
| 2 | Aprender a bailar sin pareja: cómo funciona la rotación | clases de baile sin pareja | `/clases` |
| 3 | Tu primera clase de baile, minuto a minuto | primera clase de salsa | `/contacto` |
| 4 | Dónde bailar salsa y bachata en el Garraf | salsa Vilanova / socials Garraf | `/eventos` |
| 5 | Qué ropa y zapatos llevar a clase de salsa, bachata y heels | zapatos para bailar salsa | `/faq`, `/clases/heels` |
| 6 | Qué es el reparto cubano | reparto cubano baile | `/clases/reparto` |
| 7 | Rueda de casino: qué es y por qué engancha | rueda de casino | `/clases/salsa-cubana` |
| 8 | Lady style: qué se trabaja y para quién es | lady style salsa | `/clases/lady-style-*` |
| 9 | Cuánto se tarda en bailar salsa en una fiesta | cuánto se tarda en aprender salsa | `/horarios` |
| 10 | Bailar a partir de los 40: lo que nadie te cuenta | clases de baile adultos | `/clases` |

- **Sin experiencia propia visible.** El diferencial frente a Bimba no es el texto, es que hay material real: vídeos de clase, profesores con nombre y un diario de clase. Cada artículo debe llevar foto propia y una cita del profe que imparte esa disciplina.

### 8. E-E-A-T y prueba social — 4,5

Bien: fotos y vídeo reales de las clases desde el 05-09, profesores con nombre y horario, páginas legales, teléfono y WhatsApp visibles.

- **Cero reseñas en la web y ninguna localizada en Google.** · Alto · Pedir reseña en Google a los ~38 alumnos actuales, por WhatsApp, con enlace directo. **Legal:** se puede pedir a todos; no se puede premiar solo las positivas, filtrar quién recibe la petición según su opinión ni publicar testimonios retocados (Directiva Ómnibus, LGDCU). Nada de puntos del ranking a cambio de reseñas.
- **Sin trayectoria de los profesores.** · Medio · Años bailando, formación, congresos. Solo con datos que den ellos.
- **Sin testimonios en la web.** · Medio · Con consentimiento escrito (RGPD), texto literal.

### 9. SEO local — 3,0

Es el ámbito que más pesa para "escuela de baile Vilanova" y "clases de salsa cerca de mí": esas búsquedas se resuelven en el mapa (local pack), no en los resultados azules.

- **Google Business Profile sin verificar desde aquí.** · Alto · Confirmar que existe y está verificada. Categoría principal *Escuela de baile*, secundarias *Academia de salsa* y *Clases de bachata*; horario igual al del schema; 20+ fotos del material de agosto; un post por semana (horario, eventos); productos = disciplinas con enlace a su ficha; enlace de reserva a WhatsApp.
- **NAP incoherente.** Schema y dirección: Sant Pere de Ribes (08812). Copy, titles y `areaServed`: Vilanova i la Geltrú. Decisión de Pol del 01-08, se respeta, pero el coste es real: Google no te pondrá en el mapa de Vilanova con una dirección de Sant Pere de Ribes, y la ficha de GBP tiene que decir la dirección real. · Alto · Dos acciones compatibles con la decisión: (a) atacar también "clases de baile Sant Pere de Ribes" y "Sitges", donde la competencia es aún más débil (Jopil Ribes, JM Dance); (b) cuando llegue el local de Vilanova, cambiar NAP en web, GBP y directorios el mismo día.
- **Ausente de todos los directorios.** · Alto · Alta con el mismo NAP exacto en: go&dance, salsaybachata.net, sientelbaile.com, mydance.zone, Cylex, Fixando, guía de Eix Diari y directorio de entidades de vilanova.cat. Son enlaces, citaciones y tráfico directo a la vez.
- **Sin mapa embebido en `/contacto`.** · Bajo · Fachada de dos clics (RGPD), igual que los vídeos.

### 10. Autoridad y enlaces — 2,0

- **Sin perfil de enlaces medible** (Ahrefs sin autorizar). Dominio nuevo: hipótesis de partida, perfil casi nulo. · Alto · Por orden de rendimiento: directorios del punto 9; nota a Eix Diari y Diari de Vilanova con los intensivos o el primer social; agenda del Ajuntament; Gimnasio Aranha enlazando a nexusvng.es; festivales y congresos donde bailen los profes.
- **La marca colisiona.** Buscar "NEXUS VNG" devuelve **nexusvng.com, una asesoría fiscal de Vilanova**. · Medio · Usar siempre "NEXUS VNG escuela de baile" en GBP, redes y notas de prensa; completar `sameAs`; que el nombre de GBP sea idéntico al del schema.

### 11. Búsqueda con IA — 5,0

- **Nada citable fuera de la ficha comercial.** Las respuestas de ChatGPT, Perplexity y AI Overviews citan guías, comparativas y listados. · Medio · Las guías del punto 7 con respuesta en las primeras 2 frases de cada H2, y datos concretos propios (duración de un nivel, tamaño de grupo, precios).
- **Sin Bing Webmaster Tools.** · Medio · Ver punto 1.

### 12. Catalán — 1,0

- **La web no existe en catalán** y el schema declara `knowsLanguage: ca-ES`. Estudi de Dansa TS, que sí está en catalán, recoge "escola de ball Vilanova" y "classes de ball". · Medio · Empezar por lo que más rinde: `/ca` con home, `/ca/classes` y las fichas de salsa cubana y bachata, traducción completa, `hreflang` recíproco `es` / `ca` / `x-default` y ambas versiones en el sitemap. Media traducción es peor que ninguna.

---

## Plan de acción

**Semana 1 — lo que depende de Pol (1–2 h)**
1. Redirección 308 de www (punto 1)
2. Verificar GSC (dominio) y Bing; enviar sitemap
3. Confirmar o crear Google Business Profile y completarla (punto 9)
4. Enviar a los alumnos el enlace para dejar reseña en Google

**Semana 1–2 — desde el repo**
5. Titles, H1 y metas de la tabla del punto 5
6. `/eventos` a `noindex` o con contenido; `/intensivos` a evergreen
7. `geo`, `hasMap`, `sameAs` ampliado, `image` nueva en el schema
8. Evento GA4 de clic en WhatsApp como evento clave
9. `lastmod` al día y PSI de nuevo tras el vídeo en cabeceras

**Semanas 2–4 — presencia local**
10. Alta en los 8 directorios con NAP idéntico
11. Fichas de profesor a 350+ palabras con datos reales (o `noindex`)
12. Nota de prensa a Eix Diari con el inicio de temporada

**Mes 2–3 — contenido**
13. `/guias` con los 4 primeros artículos (pasando por la skill `blog`)
14. Testimonios reales con consentimiento en home y fichas
15. Piloto en catalán: home + 3 páginas

**Mes 3 en adelante**
16. Dos guías al mes; un post semanal en GBP
17. Completar `/ca` si el piloto trae impresiones
18. Enlaces ligados a cada evento propio

## Cómo medir

| Métrica | Dónde | Hoy | Objetivo a 90 días |
|---|---|---|---|
| Impresiones sin marca | GSC | Sin dato | Tendencia al alza mes a mes |
| Posición media "clases de salsa/bachata Vilanova" | GSC | Sin dato | Top 5 |
| Aparición en local pack "escuela de baile Vilanova" | Búsqueda en móvil desde Vilanova | No aparece | Top 3 |
| Reseñas en Google | GBP | 0 localizadas | 25+ reales |
| Clics en WhatsApp desde orgánico | GA4 | Sin evento | Medido y creciendo |
| Directorios con NAP correcto | Manual | 0 | 8 |
