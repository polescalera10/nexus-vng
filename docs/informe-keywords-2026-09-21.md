# Mapa de palabras clave y 15 páginas nuevas — nexusvng.es

**Fecha:** 21 de septiembre de 2026
**Punto de partida:** `docs/informe-seo-2026-09-16-comparativa.md` (global 6,4; contenido 5,0; arquitectura 7,5)
**Qué contiene:** la investigación de palabras clave, el mapa de qué URL ataca qué consulta, las 15 páginas creadas, el enlazado interno, el análisis de canibalización y la comparativa con la competencia.

---

## 1. Investigación de palabras clave

**Método y su límite.** Sin Search Console conectada, sin Ahrefs autorizado y con Analytics caído, aquí no hay volúmenes de búsqueda. Lo que hay es análisis de SERP real (qué URLs se posicionan hoy y con qué estructura), la estructura de URLs de la competencia directa y los patrones de consulta que llegan por WhatsApp. Sirve para decidir qué páginas abrir; no sirve para prometer tráfico. Los volúmenes llegarán cuando Pol conecte GSC.

**25 consultas agrupadas por intención y por quién las tiene ya:**

| # | Consulta | Intención | Dueño después de este cambio |
|---|---|---|---|
| 1 | clases de baile en Vilanova i la Geltrú | Transaccional local | Home (ya lo era) |
| 2 | escuela de baile en Vilanova i la Geltrú | Transaccional local | Home (ya lo era) |
| 3 | **clases de salsa en Vilanova i la Geltrú** | Transaccional local | **`/clases-de-salsa-en-vilanova` (nueva)** |
| 4 | clases de bachata en Vilanova i la Geltrú | Transaccional local | `/clases/bachata` (ya lo era) |
| 5 | clases de salsa cubana / casino Vilanova | Transaccional local | `/clases/salsa-cubana` (ya lo era) |
| 6 | academia de baile Vilanova | Transaccional local | Home (sinónimo de 1 y 2) |
| 7 | **clases de baile sin pareja** | Objeción | **`/clases-de-baile-sin-pareja` (nueva)** |
| 8 | **aprender a bailar desde cero / principiantes adultos** | Objeción de nivel | **`/aprender-a-bailar-desde-cero` (nueva)** |
| 9 | **precio / cuánto cuestan las clases de baile Vilanova** | Comercial | **`/precios-clases-de-baile-vilanova` (nueva)** |
| 10 | **clases de baile en Sant Pere de Ribes** | Geolocal (dirección real) | **`/clases-de-baile-sant-pere-de-ribes` (nueva)** |
| 11 | **clases de baile / salsa / bachata en Sitges** | Geolocal vecina | **`/clases-de-baile-sitges` (nueva)** |
| 12 | **primera clase de baile / qué esperar** | Informacional | **`/blog/primera-clase-de-baile-que-esperar`** |
| 13 | **rueda de casino qué es** | Informacional | **`/blog/rueda-de-casino-que-es`** |
| 14 | **zapatos para bailar salsa y bachata** | Informacional comercial | **`/blog/zapatos-para-bailar-salsa-y-bachata`** |
| 15 | **dónde bailar salsa y bachata en el Garraf** | Informacional local | **`/blog/donde-bailar-salsa-y-bachata-en-el-garraf`** |
| 16 | **cuánto se tarda en aprender a bailar salsa** | Informacional | **`/blog/cuanto-se-tarda-en-aprender-a-bailar-salsa`** |
| 17 | **tipos de bachata (dominicana, sensual, moderna)** | Informacional | **`/blog/tipos-de-bachata-dominicana-sensual-moderna`** |
| 18 | **beneficios de bailar / bailar como ejercicio** | Informacional | **`/blog/beneficios-de-bailar-para-adultos`** |
| 19 | **empezar a bailar a los 40** | Informacional por audiencia | **`/blog/empezar-a-bailar-a-partir-de-los-40`** |
| 20 | **cómo elegir escuela de baile** | Investigación comercial | **`/blog/como-elegir-escuela-de-baile`** |
| 21 | salsa cubana o bachata cuál empezar | Informacional | `/blog/salsa-cubana-o-bachata-cual-empezar` (ya existía) |
| 22 | horarios clases de baile Vilanova | Navegacional | `/horarios` (ya lo era) |
| 23 | reparto cubano / reggaetón Vilanova | Transaccional local | `/clases/reparto`, `/clases/reggaeton` (ya lo eran) |
| 24 | lady style salsa / bachata | Transaccional local | `/clases/lady-style-*` (ya lo eran) |
| 25 | heels / sexy style Vilanova | Transaccional local | `/clases/heels`, `/clases/sexy-style` (ya lo eran) |

**Consultas descartadas a propósito:**

| Consulta | Por qué NO se abre página |
|---|---|
| clases de salsa y bachata Vilanova | Combina 3 y 4, que ya tienen dueño. Una tercera página se comería a las dos |
| clases de baile Cubelles / Vilafranca / Calafell | Sin contenido propio que decir, sería una plantilla con el nombre cambiado. Eso es exactamente el patrón doorway |
| qué es el reparto cubano | `/clases/reparto` ya trae 4 párrafos sobre el género. Un artículo competiría con su propia ficha |
| lady style qué es | Mismo caso: `/clases/lady-style-salsa` y `/clases/lady-style-bachata` ya lo cubren |
| clases de baile para niños / ballet | La escuela no lo da. Página sin producto detrás |
| primera clase gratis | La clase de prueba tiene coste. Anunciar lo contrario es publicidad engañosa |

---

## 2. Las 15 páginas nuevas

### 6 páginas de entrada (URL de primer nivel)

| URL | Consulta | Su trabajo, distinto del de las demás |
|---|---|---|
| `/clases-de-salsa-en-vilanova` | clases de salsa en Vilanova | Desambigua cubana / en línea y dice en qué grupo entras. No explica qué es la salsa cubana: eso lo hace la ficha |
| `/clases-de-baile-sin-pareja` | clases de baile sin pareja | La mecánica de la rotación, minuto a minuto, y qué pasa si el número no cuadra |
| `/aprender-a-bailar-desde-cero` | aprender a bailar desde cero | El nivel, no el estilo. Las cuatro primeras semanas y los miedos que se pasan solos |
| `/precios-clases-de-baile-vilanova` | precio clases de baile Vilanova | La tarifa, interpolada desde `content/precios.ts`. Tres combinaciones reales y qué NO entra |
| `/clases-de-baile-sant-pere-de-ribes` | clases de baile Sant Pere de Ribes | La dirección real del NAP. Dónde es, cómo llegar y por qué la marca dice Vilanova |
| `/clases-de-baile-sitges` | clases de baile Sitges | El desplazamiento. Dice en la primera línea que NO hay sala en Sitges |

### 9 guías (`/blog`)

Todas firmadas por el profe que imparte la disciplina, con su credencial real del cartel 26·27, y con marcas de procedencia (`<!-- ORIGINAL DATA -->`, `<!-- UNIQUE INSIGHT -->`) que documentan de dónde sale cada dato propio.

| URL | Consulta | Fuente externa verificada |
|---|---|---|
| `/blog/primera-clase-de-baile-que-esperar` | primera clase de baile | UNESCO (bachata dominicana, 2019) |
| `/blog/rueda-de-casino-que-es` | rueda de casino | Britannica (salsa), UNESCO (rumba cubana, 2016) |
| `/blog/zapatos-para-bailar-salsa-y-bachata` | zapatos para bailar salsa | — (criterio de sala) |
| `/blog/donde-bailar-salsa-y-bachata-en-el-garraf` | dónde bailar salsa Garraf | UNESCO (bachata dominicana) |
| `/blog/cuanto-se-tarda-en-aprender-a-bailar-salsa` | cuánto se tarda en aprender salsa | — (observación de sala, dicho como tal) |
| `/blog/tipos-de-bachata-dominicana-sensual-moderna` | tipos de bachata | UNESCO (bachata dominicana) |
| `/blog/beneficios-de-bailar-para-adultos` | beneficios de bailar | OMS (ficha de actividad física y directrices 2020) |
| `/blog/empezar-a-bailar-a-partir-de-los-40` | bailar a los 40 | OMS (ficha de actividad física) |
| `/blog/como-elegir-escuela-de-baile` | cómo elegir escuela de baile | BOE (Ley 3/1991 de Competencia Desleal) |

---

## 3. Canibalización: cómo se ha evitado y cómo se vigila

**Las tres reglas que se han seguido**

1. **Una consulta, una URL.** Si ya tenía dueño, no se abre página: se enlaza. Por eso no hay página de "clases de bachata en Vilanova" (la tiene `/clases/bachata`) ni de "clases de baile en Vilanova" (la tiene la home).
2. **El schema no se duplica.** `Course` sigue viviendo solo en las fichas de disciplina. Las páginas de entrada emiten `FAQPage` y `BreadcrumbList`, y heredan el `DanceSchool` del layout. Dos `Course` compitiendo por el mismo resultado enriquecido es la forma más rápida de no salir en ninguno.
3. **El par en riesgo se resuelve con jerarquía, no con suerte.** `/clases-de-salsa-en-vilanova` y `/clases/salsa-cubana` son el único par cercano. La página de entrada enlaza hacia la ficha con el ancla exacta de la ficha ("Clases de salsa cubana en Vilanova i la Geltrú") y la ficha enlaza de vuelta. Los dos `title`, los dos `h1` y los dos cuerpos son distintos.

**La vigilancia automática** está en `tests/unit/paginas-seo.test.ts` y corre en cada push:

| Comprobación | Qué impide |
|---|---|
| `keywordPrincipal` única en el registro | Dos páginas peleando por la misma consulta |
| Ninguna keyword es la de la home | Que una página nueva se coma la home |
| Similitud de trigramas entre páginas < 0,25 | Duplicar un fichero y cambiar la ciudad. Las `/l/` compartían el 94 % |
| Ninguna pregunta de FAQ repetida | Bloques de FAQ clonados entre páginas |
| Cuerpo > 280 palabras significativas y ≥ 4 preguntas | Páginas finas |
| Cero enlaces rotos, cero páginas huérfanas | Landings que existen solo en el sitemap |

Y en `tests/e2e/paginas-seo.spec.ts`: canonical propia, `title` ≤ 60, sin `noindex`, `FAQPage` + `BreadcrumbList` presentes, `Course` ausente, ≥ 6 enlaces internos, y que una URL de primer nivel inexistente siga devolviendo 404.

---

## 4. Enlazado interno

El grafo se deriva de una sola fuente (`enlaces` de cada página), así que el enlace de ida y el de vuelta no pueden desincronizarse.

| Desde | Hacia | Dónde |
|---|---|---|
| Página de entrada | Ficha, guía, `/horarios`, `/faq`, `/contacto` | Cuerpo + bloque "Sigue por aquí" |
| Ficha de disciplina | Páginas de entrada que hablan de ella | Bloque "Antes de apuntarte a…" |
| `/clases` | Páginas de entrada que enlazan al catálogo | Bloque tras el de precios |
| `/horarios` | Páginas de entrada que mandan ahí | Bloque al pie |
| `/faq` | `/aprender-a-bailar-desde-cero`, `/clases-de-baile-sin-pareja` | Bloque "Con más detalle" |
| Artículo del blog | Páginas de entrada que lo enlazan | Barra lateral |
| Pie (las 44 URLs) | `/precios-…`, `/aprender-a-bailar-desde-cero` | Columna "Explora" |

Las dos páginas del pie son las de más intención de compra: desde el pie están a un clic de cualquier URL del sitio, en vez de a tres de la home.

**Contexto de WhatsApp.** Cada página de entrada prerrellena su propio primer mensaje ("Vengo de Sitges y me gustaría info…", "Quería apuntarme pero no tengo pareja…") y manda su etiqueta a GA4 como `cta_label`. Eso convierte cada URL nueva en una fuente de leads identificable, no en tráfico anónimo.

---

## 5. Comparativa con la competencia

**Bimba Dance** es la rival directa y su estrategia es exactamente la que aquí se ha hecho de otra manera. Tiene páginas de coincidencia exacta (`/clases-de-baile/clases-salsa/`, `/salsa-en-vilanova-i-la-geltru/`, `/clases-baile-vilanova-geltru-salsa-bachata/`, `/academia-bachata-vilanova-geltru-bimba/`). Al rastrear `bimbadance.com/clases-de-baile/clases-salsa/` el 21-09-2026, la página devuelve un `h1` genérico de marca y prácticamente ningún texto: bloquea rastreadores y renderiza el contenido en cliente.

| Frente | Bimba Dance | NEXUS después de este cambio |
|---|---|---|
| Páginas con keyword local | Sí, varias, casi duplicadas entre sí | Sí, 6 nuevas, con cuerpo distinto verificado por test |
| Texto servido a un rastreador | Casi nada (render en cliente) | 2.900–3.800 palabras por página, en el HTML |
| Schema | Sin marcado detectable | `DanceSchool` + `FAQPage` + `BreadcrumbList` en las nuevas, `Course` en las fichas |
| Contenido informacional | No | 10 guías con fuentes verificables |
| Cobertura de objeciones | No | Sin pareja, desde cero, precio, todas con URL |
| Cobertura de municipios | Vilanova | Vilanova + Sant Pere de Ribes + Sitges |
| Reseñas visibles | En directorios | 9 (5,0) en web y ficha |
| Directorios | go&dance y otros | 0 |
| Antigüedad y marca | Alta | Baja |

**En qué se le gana y en qué no.** Se le gana en todo lo que Google puede leer de la web. No se le gana en nada de lo que pasa fuera: directorios, antigüedad del dominio y notoriedad de marca. Eso sigue en la lista de Pol y no lo resuelve ninguna página nueva.

---

## 6. Efecto esperado

**Lo que sube seguro, porque es mecánico y ya está medido:**

| Métrica | Antes | Ahora |
|---|---|---|
| URLs indexables en el sitemap | 29 | 44 |
| Páginas informacionales | 1 | 10 |
| Consultas con URL dedicada | ~13 | ~25 |
| Páginas que atacan una objeción | 0 | 3 |
| Municipios con página propia | 1 | 3 |
| Enlaces internos entrantes a páginas nuevas | — | 2–5 por página, más el pie en dos |

**Lo que puede subir, con plazos realistas.** Nada de esto es una promesa: son los plazos habituales de un dominio nuevo sin autoridad.

- **Semanas 2 a 6:** indexación y primeras impresiones de cola larga ("clases de baile sin pareja", "zapatos para bailar salsa", "cuánto se tarda"). Es tráfico informacional, convierte poco y su trabajo es otro: dar señales de actividad y de relevancia temática al dominio entero.
- **Meses 2 a 4:** las consultas locales de las páginas de entrada. "Clases de baile Sant Pere de Ribes" es la que antes debería moverse, porque la competencia ahí es la más floja de las tres y la dirección es la real. "Clases de salsa en Vilanova" es la más disputada y la que más tardará.
- **Meses 3 a 6:** efecto indirecto sobre la home y las fichas. Diez páginas informacionales enlazando hacia dentro es la señal de profundidad temática que hoy falta y que separa a NEXUS de Bimba en lo único en lo que Bimba gana por web.
- **Sin plazo:** citación en respuestas de IA. Las guías están escritas para eso (respuesta en las primeras frases, datos propios, tablas, fuentes de primer nivel), pero depende de que Bing indexe el dominio, y eso sigue pendiente de Pol.

**Lo que este cambio NO arregla, y conviene tener claro:**

- **La autoridad.** Sigue en 2,0. 15 páginas nuevas sin un solo enlace entrante externo no mueven esa nota. Los 8 directorios siguen siendo la acción de mayor impacto del plan.
- **El local pack.** "Escuela de baile Vilanova" se decide en el mapa, y en el mapa la dirección es Sant Pere de Ribes. `/clases-de-baile-sant-pere-de-ribes` juega a favor de la ficha real, pero no hace que Google ponga la sala en Vilanova.
- **La medición.** Sin Search Console no se puede saber si algo de esto funciona. Es el cuello de botella de todo el plan.
- **El www sin redirigir.** Sigue devolviendo 200 desde agosto, y ahora con 15 URLs más duplicadas en él.

---

## 7. Lo que hace falta de Pol

| # | Acción | Por qué ahora |
|---|---|---|
| 1 | Enviar el sitemap (44 URLs) en Search Console e importarlo a Bing | Sin esto no hay medición ni indexación rápida de lo nuevo |
| 2 | Redirección 308 de `www` en Vercel | Cinco minutos. Ahora duplica 44 URLs en vez de 29 |
| 3 | Alta en los 8 directorios | Sigue siendo lo que más mueve la aguja y no depende del repo |
| 4 | Confirmar locales y periodicidad de los socials del Garraf | Le daría nombres reales al artículo, que hoy enseña a buscarlos pero no lista ninguno |
| 5 | Confirmar el precio de la clase de prueba | Permite cerrar el `TODO` y decirlo en la página de precios |
| 6 | Decidir si alguna de estas páginas va al catalán | Hoy ninguna tiene pareja en `i18n/rutas.ts`; el piloto está parado esperando su revisión |

---

## 8. Nota sobre el score de `analyze_blog.py`

Las 9 guías puntúan entre **60 y 70**. El artículo ya publicado, `salsa-cubana-o-bachata`, puntúa **71** con el mismo script.

El umbral de 90 que fija `CLAUDE.md` no es alcanzable con este analizador para contenido en castellano, y conviene dejarlo escrito para no perseguirlo:

- `entity_definitions` busca el patrón `**X** is|are|refers to|means`. Es una regex en inglés: en castellano nunca dispara, y son 3 puntos que no se pueden ganar.
- `has_tldr` busca `TL;DR`, `key takeaway`, `at a glance`. Mismo caso.
- `technical_elements` penaliza la ausencia de JSON-LD, Open Graph y canonical. Los tres existen, pero los pone la plantilla del sitio (`blog/[slug]/page.tsx`), no el borrador que se analiza. Son 9 puntos de falso positivo, como ya advierte `CLAUDE.md`.

La referencia útil para este proyecto es el 71 del artículo publicado, no el 90 del script. Las diferencias reales entre guías (fuentes externas disponibles, profundidad) sí se ven dentro de ese rango y se han trabajado hasta agotar lo que se podía subir sin inventar citas.
