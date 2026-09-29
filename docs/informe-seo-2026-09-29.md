# Informe SEO — nexusvng.es

**Fecha:** 29 de septiembre de 2026
**Compara con:** el informe del 16-09 (`docs/informe-seo-2026-09-16-comparativa.md`). Mismos 12 ámbitos, para que las notas se puedan comparar.
**Estado rastreado:** `docs/seo-estado-2026-09-29.jsonl` (sirve de línea base para el próximo `--diff`).

**Método.**
- Rastreo de producción con `scripts/seo-crawl.py`: las 47 URLs del sitemap.
- Grafo de enlaces internos de esas 47 páginas.
- Variantes de URL (http, www, barra final, 404), cabeceras y robots.
- Lighthouse 12 en local, móvil con estrangulado simulado, dos pasadas. La API de PageSpeed sigue sin cuota.
- Search Console y GA4 de los últimos 28 días cerrados (30-08 a 26-09), con la cuenta de servicio.
- Indexación: la inspección de URLs del 28-09 (`MEMORY.md`).

---

## Nota por ámbito

| Ámbito | 16-09 | 29-09 | Por qué |
|---|---|---|---|
| Rastreo e indexación | 8,5 | **8,0** | Lo que emite la web está casi perfecto: el 308 de `www` ya funciona, 47/47 URLs en 200, 404 reales, `lastmod` en todas. Pero Google solo tiene indexadas **25 de 47** y no ha vuelto a leer el sitemap desde el 21-09 |
| Rendimiento y seguridad | 8,5 | **8,5** | Home: 80–97 en Lighthouse móvil según la pasada, CLS 0, TBT 10 ms. `/clases/bachata`: 90, con la imagen del LCP en `lazy`. HSTS con preload y CSP bloqueante |
| Mobile y UX | 9,0 | **9,0** | Accesibilidad 100. En Google el móvil rinde mucho mejor que el escritorio: posición 4,9 frente a 9,0 |
| Datos estructurados | 9,0 | **9,0** | `DanceSchool`, `Course` con `CourseInstance`, `FAQPage`, `BlogPosting`, `Event`, `Person` y migas en su sitio. Hace bien en no llevar `AggregateRating`: Google no pinta estrellas de reseñas propias de un negocio local |
| On-page | 9,0 | **9,0** | 47/47 titles de 23 a 58 caracteres, todos distintos. Metas de 122 a 157 caracteres. Un H1 por página, siempre con la keyword |
| Arquitectura y enlazado | 7,5 | **8,0** | 15 páginas nuevas y la home ya no enlaza a las `/l/`. Quedan páginas casi huérfanas: la masterclass (1 enlace interno), `/intensivos` (2) y 5 guías con 3 o 4 |
| Búsqueda con IA | 6,0 | **7,0** | 10 guías con respuesta directa y fuentes externas (UNESCO, OMS, Britannica, BOE). Los asistentes de IA trajeron 16 sesiones y 2 conversiones en 28 días. Sin `llms.txt` |
| E-E-A-T y prueba social | 6,5 | **7,0** | 19 reseñas reales en la home (eran 9). Las fichas de profesor siguen finas: de 91 a 180 palabras |
| Contenido | 5,0 | **7,0** | De 1 artículo a 10 guías de 950–1.250 palabras, más 7 páginas de entrada. Pero Google solo ha indexado 2 de las 10 |
| SEO local | 5,0 | **6,0** | Ficha de Google con 19 reseñas, alta en goandance y en salsaybachata enviada. Las búsquedas cabeza de Vilanova se quedan en las posiciones 8–12 |
| Autoridad y enlaces | 2,0 | **3,0** | La marca ya se encuentra: «nexus vng» sale en posición 1,3 con 23 clics. Enlaces externos, casi ninguno |
| Catalán | 1,0 | **1,0** | El piloto está en el código, sin publicar (`/ca` da 404) |
| **Global** | **6,4** | **6,9** | **Técnica: de 8,8 a 8,7 · Visibilidad: de 4,7 a 5,6** |

(Global = media de los 12 ámbitos. Técnica = los 5 primeros. Visibilidad = los 7 restantes.)

**Lectura corta.** El código ya no es lo que frena. En dos semanas se ha ganado casi un punto de visibilidad gracias al contenido nuevo, pero la mitad de ese contenido todavía no existe para Google. El siguiente salto depende de tres cosas: que Google indexe lo publicado, llegar al pack local y conseguir enlaces.

---

## Lo que dicen los datos (28 días, 30-08 a 26-09)

| Métrica | Valor |
|---|---|
| Clics desde Google | 98 |
| Impresiones | 1.504 |
| CTR | 6,5 % |
| Posición media | 6,6 |
| Sesiones orgánicas (GA4) | 99, con 10 conversiones |
| Sesiones desde asistentes de IA | 16, con 2 conversiones |

**Casi todo el clic es de marca.** Solo 44 de los 98 clics traen la consulta a la vista (Google oculta el resto), y de esos 44, 39 son búsquedas de marca: «nexus vng», «nexus vilanova i la geltru», «aranha vilanova». Sin marca, en 28 días: 3 clics de «salsa vilanova i la geltru» y 1 de «heels dance cerca de mi».

**Las búsquedas que importan están en la parte baja de la primera página:**

| Grupo de consultas | Impresiones | Posición | Clics |
|---|---|---|---|
| Academia / escuela / clases de baile + Vilanova (6 variantes) | 266 | 8,7–11,6 | 0 |
| Bachata + Vilanova (2 variantes) | 159 | 8,4–9,1 (2,9–4,1 la última semana) | 0 |
| Salsa + Vilanova (2 variantes) | 35 | 4,8–6,4 | 3 |
| «que es heels» | 25 | 9,4 | 0 |

Son unas 460 impresiones al mes. En posiciones 8–12 el CTR normal es del 1–2 %, y en el top 3 del 10–25 %. Subir al top 3 en esos dos grupos vale entre 40 y 100 visitas al mes que hoy no llegan. Ese es el objetivo real.

**La home se reparte entre dos URLs.** `nexusvng.es/` tiene 752 impresiones y `www.nexusvng.es/` otras 695. El 308 está puesto desde el 21-09 y Google ya ve el `www` como redirección, así que se irá unificando solo. Cuando termine, la home debería ganar posiciones sin tocar nada.

---

## Indexación: el cuello de botella

Según la inspección del 28-09, **25 de las 47 URLs están indexadas**:

- 16 URLs que Google no conoce: `/intensivos`, `/profesores`, `/horarios`, `/sobre-nosotros`, `/contacto`, `/eventos`, `/blog`, 4 fichas de profesor, la masterclass y varias guías.
- 5 guías descubiertas pero sin indexar.
- 1 guía rastreada sin indexar (`donde-bailar-salsa-y-bachata-en-el-garraf`).

En un dominio nuevo y con poca autoridad, Google rastrea poco. Lo que más ayuda es el sitemap reenviado, la petición de indexación a mano de las páginas clave y enlaces internos desde las páginas que Google sí rastrea a menudo: la home, `/clases` y `/clases/bachata`.

---

## Puntos de mejora, por impacto

### Prioridad alta

**1. Reenviar el sitemap y pedir indexación** *(Pol, 15 minutos)*
En GSC › Sitemaps, reenviar `sitemap.xml`: tiene 47 URLs y la última lectura de Google fue con 44. Después, en «Inspeccionar URL», pedir indexación de `/horarios`, `/profesores`, `/clases-de-baile-en-tacones`, `/blog` y `/intensivos`. Google limita las peticiones a unas 10 al día, así que conviene repartirlas en dos o tres días.

**2. Atacar el pack local de «escuela / academia de baile Vilanova»** *(Pol)*
Son 266 impresiones al mes con cero clics. En estas búsquedas el mapa manda más que la web.
- En la ficha de Google: categoría principal «Escuela de baile», las demás disciplinas como servicios, fotos nuevas cada semana y una publicación semanal (horarios, masterclass, intensivos).
- Más reseñas: pasar de 19 a 40. Se pide a todo el alumnado por igual, sin incentivos y sin sugerir el texto.
- Responder a todas las reseñas.

**3. Enlaces y citas locales** *(Pol)*
Es el ámbito con la nota más baja (3/10) y el que más pesa para subir de la posición 9 a la 3.
- Confirmar que salsaybachata.net ha publicado la ficha.
- Altas en Serveis Actius, la guía de entidades del Ajuntament de Vilanova y el Gimnasio Aranha (si tiene web, que enlace a NEXUS).
- La sala de la masterclass (En Tu Salsa, Cubelles), si publica el evento.
- Una nota en la prensa local (Eix Diari) sobre la escuela o la masterclass.

Siempre con el NAP exacto del kit (`docs/seo-local-kit-2026-09-15.md`). Nada de compra de enlaces ni de granjas.

**4. Bios de profesores** *(Pol aporta los datos; código después)*
Las fichas tienen de 91 a 180 palabras, y la de Yuri 91. Con 300–400 palabras reales por profe (trayectoria, formación, estilo, desde cuándo enseña) se sube el E-E-A-T de todo el sitio y las fichas pasan a ser indexables con cuerpo. Solo datos verdaderos. Si falta información, mejor una ficha corta que una inventada.

### Prioridad media

**5. Imagen del LCP en las cabeceras internas** *(código, 10 minutos)*
En `/clases/bachata` y en las demás páginas con `HeroFondo`, el póster del vídeo de cabecera se carga con `loading="lazy"` y es el elemento del LCP (3,6 s en laboratorio). `VideoLoop` ya acepta la prop `prioridad`: basta con pasársela desde `src/components/ui/HeroFondo.tsx`. Afecta a todas las páginas con cabecera de banda (fichas de clase, páginas de apoyo, guías, `/intensivos`, `/socio-fundador`).

**6. Enlazado a las páginas casi huérfanas** *(código)*

| Página | Enlaces internos | Propuesta |
|---|---|---|
| `/eventos/masterclass-bachazouk-de-0-a-1` | 1 | Enlazarla desde `/clases/bachata` y desde la home mientras esté vigente |
| `/intensivos` | 2 | Añadirla al menú o al pie, junto a `/eventos` |
| `/blog/tipos-de-bachata-...`, `/blog/como-elegir-escuela-...`, `/clases-de-baile-sant-pere-de-ribes` | 3 | Bloque de «guías relacionadas» en cada ficha de clase, con 2 o 3 guías de su disciplina |
| `/blog/empezar-a-bailar-a-partir-de-los-40`, `/clases-de-baile-sitges` | 4 | Lo mismo, y enlaces cruzados entre guías |

**7. «Qué es heels»: de la posición 9,4 al top 3** *(contenido, con la skill `blog`)*
`/clases/heels` ya tiene la sección «Qué es Heels» y recibe 25 impresiones al mes. Para subir hace falta:
- Una definición de 40–60 palabras nada más empezar la sección, la que sacaría un fragmento destacado.
- Una pregunta en el FAQ de la página con el mismo texto.
- Lo que distingue heels de sexy style, que es la duda que acompaña a la búsqueda.

**8. Vigilar la bachata lady style** *(seguimiento)*
`/clases/cia-bachata-lady` (60 impresiones, posición 14,6) y `/clases/lady-style-bachata` (15 impresiones, 15,1) están cerca en intención. La separación del commit `35b33de` es reciente. Revisar en el informe del 12-10, con el cruce de consulta y página, si siguen repartiéndose las mismas búsquedas.

### Prioridad baja

**9. `llms.txt`** *(código, 15 minutos)*
Da 404. Impacto pequeño y sin garantías, pero es barato: un resumen de la escuela, de las disciplinas y de las 10 guías, con sus URLs.

**10. Peso del hero en móvil** *(código)*
El vídeo del hero pesa 731 KB y el póster se descarga dos veces: el JPG original (64 KB) y la versión de `/_next/image` (23 KB). Con quitar la descarga duplicada basta. El vídeo está bien, porque no afecta al LCP.

**11. Catalán** *(decisión de Pol)*
El piloto está listo en el código. Si se publica, hace falta `hreflang` entre las dos versiones y un sitemap que las incluya. En Vilanova hay búsquedas en catalán («escola de ball», «escola dansa») que hoy no tienen página.

---

## Lo que ya está bien (no tocar)

- Titles, metas y H1 de las 47 páginas.
- El JSON-LD completo, sin `AggregateRating` propio.
- La CSP bloqueante, HSTS y las redirecciones 308, `www` incluido.
- Enlace a WhatsApp en las 47 páginas.
- Las `/l/` en `noindex, follow`, sin enlaces desde el sitio.
- Las URLs viejas (`/eventos/fiesta-social-mensual`, `/clases/tacones`) dan 404 real.

---

## Próxima medición

| Cuándo | Qué |
|---|---|
| 12-10-2026 | Indexación de las 47 URLs (objetivo: 40), sitemap leído, bachata lady style por consulta y página |
| 31-10-2026 | Posición del grupo «escuela / academia de baile Vilanova» (objetivo: por debajo de 6), reseñas (objetivo: 30), directorios publicados |
| 15-12-2026 | Pack local, clics sin marca (objetivo: 20 al mes), clics a WhatsApp desde orgánico |
