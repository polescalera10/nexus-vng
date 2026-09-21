# Análisis de bimbadance.com — el competidor directo tras su migración

**Fecha del rastreo:** 21 de septiembre de 2026
**Por qué existe este documento:** Bimba Dance es la rival directa de NEXUS VNG y la referencia de las auditorías del 14-08 y el 15-09-2026, donde figuraba como "sale en todas las búsquedas probadas" y "páginas por keyword exacta". Esa web ya no existe. Este informe mide qué hay ahora.

**Método:** rastreo directo con `curl` (cabeceras y HTML servido, con user-agent de Googlebot), renderizado real en navegador (DOM tras ejecutar JavaScript), consulta de la API CDX de Wayback Machine y búsquedas genéricas. Todo verificable y reproducible.

**Límite honesto:** sin acceso a la Search Console de ese dominio no hay posiciones ni tráfico reales. Lo que sí se puede medir con certeza es qué emite la web y qué estado devuelve cada URL. El diagnóstico técnico es firme; la estimación de pérdida de tráfico es una inferencia, y se marca como tal.

---

## Veredicto

**La migración se ha hecho mal, y el daño no es el que parece.** El problema no es que la web nueva sea una one-page. El problema es que **todas las URLs antiguas devuelven HTTP 200 con una página en inglés cuyo `<title>` es "Lovable App" y cuyo H1 dice "404"**.

No es un 404. Es un **soft 404 masivo**: Google recibe una señal de "todo correcto" en decenas de URLs que ya no tienen contenido, con lo que ni las conserva (el contenido no está) ni las retira limpiamente (no hay 410 ni 404) ni transfiere su fuerza (no hay 301). La autoridad acumulada en esas URLs se está evaporando sin destino.

Encima, el dominio **sigue posicionando con esas URLs fantasma**. Hoy, "clases de kizomba Vilanova i la Geltrú" devuelve `bimbadance.com/nuestras-clases/clases-kizomba/` en posición 4. Quien pulse aterriza en una pantalla azul en inglés que pone "404 · Page not found". Eso no es tráfico perdido: es tráfico que se convierte activamente en señal negativa.

**En una frase:** no ha perdido el posicionamiento todavía, lo está perdiendo ahora mismo y de la peor forma posible. Y la mayor parte del daño es reversible con un fichero de redirecciones, que es trabajo de una tarde.

---

## 1. Lo que hay ahora

| Dato | Valor |
|---|---|
| Stack | SPA de React construida con Vite, generada con **Lovable**, desplegada en Vercel |
| HTML servido a un rastreador | **1.583 bytes**. `<div id="root"></div>` y nada más |
| Última modificación (`last-modified`) | 9 de septiembre de 2026 |
| Páginas reales | **1** |
| Palabras en todo el sitio (tras renderizar) | **663** |
| Enlaces internos rastreables | **0** (toda la navegación es `#ancla`) |
| JSON-LD | **0 bloques** |
| `<link rel="canonical">` | **No existe** |
| `robots.txt` | **No existe** (devuelve el HTML de la SPA con status 200) |
| `sitemap.xml` | **No existe** (ídem) |
| `lang` del documento tras renderizar | **`en`** (el HTML servido dice `es`; el JavaScript lo sobrescribe) |
| Registros MX del dominio | **Ninguno**. El dominio no tiene correo |
| Cabeceras de seguridad | Ninguna (sin CSP, X-Robots-Tag, Referrer-Policy ni X-Frame-Options) |

**Lo que sí está bien**, para ser justos: TTFB de 0,09 s desde el edge de Vercel, `load` en 347 ms, responsive correcto a 375 px sin desbordamiento horizontal, `alt` en las 7 imágenes, jerarquía de encabezados limpia (un solo H1, sin saltos de nivel) y copy de conversión bastante mejor que el de la web anterior. El problema no es el diseño ni la velocidad. Es todo lo demás.

---

## 2. El fallo grave: soft 404 en todas las URLs antiguas

Cada URL probada devuelve exactamente la misma respuesta: **HTTP 200, 1.583 bytes**.

| URL probada | Estado HTTP | Lo que ve el usuario |
|---|---|---|
| `/clases-de-baile/` | 200 | "Lovable App" · H1 "404" |
| `/clases-de-baile/clases-salsa/` | 200 | ídem |
| `/clases-de-baile/clases-kizomba/` | 200 | ídem |
| `/nuestras-clases/clases-kizomba/` | 200 | ídem |
| `/salsa-en-vilanova-i-la-geltru/` | 200 | ídem |
| `/academia-bachata-vilanova-geltru-bimba/` | 200 | ídem |
| `/escuela-baile-vilanova-geltru-bimba/` | 200 | ídem |
| `/clases-baile-vilanova-geltru-salsa-bachata/` | 200 | ídem |
| `/clase-heels-vilanova-geltru/` | 200 | ídem |
| `/fiestas/` · `/inscripciones/` · `/feed/` | 200 | ídem |
| `/esta-url-no-existe-jamas-12345/` (inventada) | 200 | ídem |

La última fila es la que cierra el diagnóstico: **una URL que nunca ha existido también devuelve 200**. No hay ruta de error. El `rewrite` de la SPA captura absolutamente todo el dominio.

Consecuencias, por orden de gravedad:

1. **Ninguna redirección 301.** La autoridad de cada URL antigua no va a ninguna parte. Es la única pérdida que, si se deja pasar el tiempo, se vuelve irreversible.
2. **Soft 404 masivo.** Google tarda semanas o meses en clasificar como soft 404 una URL que responde 200. Mientras tanto la mantiene en el índice con el título y la descripción antiguos, manda gente a una pantalla de error, registra el rebote y baja la calidad percibida del dominio entero.
3. **Superficie infinita de rastreo.** Cualquier enlace roto, cualquier parámetro, cualquier rastro de la instalación de WordPress consume presupuesto de rastreo devolviendo 200.
4. **El índice muestra información falsa.** Los resultados siguen prometiendo kizomba y una clase de heels con una profesora concreta. El horario actual de la web no tiene ni kizomba ni heels: tiene sevillanas y flamenco.

---

## 3. Índice: lo que Google todavía cree

Una consulta `site:` del 21-09-2026 devuelve todavía las URLs de la web antigua con **sus títulos y descripciones de entonces**, no los de la web actual. El índice aún no se ha enterado.

Dos detalles que conviene subrayar:

**Duplicados de época.** Conviven en el índice `/clases-de-baile/clases-kizomba/` y `/nuestras-clases/clases-kizomba/`, dos rutas distintas de la misma página de dos reestructuraciones distintas. Las dos devuelven 200 y la misma pantalla de error.

**`/godsend.php`.** La consulta `site:` devuelve una URL `godsend.php` con el título "Bimbadance". Un `.php` suelto con ese patrón de nombre en la raíz de un WordPress es un artefacto típico de instalación comprometida. No se puede confirmar desde fuera (hoy devuelve la SPA, como todo lo demás), pero encaja con una caída en abril y con que no se haya recuperado la web anterior.

**Wayback Machine no tiene copia.** La API CDX solo conoce 7 URLs de ese dominio, y de la home solo una captura de 2023 que era un 308. **El contenido de la web antigua no está archivado en ningún sitio público.** Si no hay copia de seguridad propia, ese contenido está perdido.

---

## 4. Posicionamiento actual: lo que se ve

| Consulta | Qué devuelve para bimbadance.com |
|---|---|
| "escuela de baile Vilanova i la Geltrú salsa bachata" | La home, pero por **debajo** de go&dance, Instagram, Dance Gold, Serveis Actius y JL Dance |
| "clases de salsa en Vilanova i la Geltrú" | Varias URLs antiguas, todas fantasma |
| "clases de kizomba Vilanova i la Geltrú" | `/nuestras-clases/clases-kizomba/` en posición 4. Fantasma, y de un baile que ya no imparten |

El contraste con la auditoría del 15-09-2026 es el dato: allí Bimba "salía en todas las búsquedas probadas" con tres resultados propios. Hoy su ficha de directorio y su Instagram posicionan **por encima de su propio dominio**. Ese es el orden típico de una marca cuya web ha dejado de sostenerse sola.

---

## 5. Problemas de la página actual (aparte de la migración)

Aunque las redirecciones se arreglaran mañana, la one-page tiene lo siguiente:

**Renderizado solo en cliente, sin respaldo.** Lo que se sirve son 1.583 bytes sin contenido. Google sabe renderizar JavaScript, pero lo hace en una segunda pasada, con retraso y sin garantías. El resto de rastreadores (redes sociales, buscadores menores, los bots de las IA generativas) no renderizan en absoluto: para ellos esta web está en blanco. Es exactamente la ventaja que la auditoría del 15-09 ya atribuía a NEXUS, y se ha ensanchado.

**Sin H1 con la consulta ni con la ciudad.** El H1 es "Aprende a bailar. Conoce gente. Disfruta cada semana.". Ningún H2 menciona Vilanova. Toda la señal de localidad vive en el `<title>` y en un bloque de dirección.

**El `<title>` servido y el renderizado no coinciden.** El HTML dice "Salsa, Bachata y **Kizomba**"; tras ejecutar el JavaScript pasa a "Salsa, Bachata y **Sevillanas**". Google puede indexar cualquiera de los dos, y la meta description servida sigue vendiendo un baile que ya no dan.

**`lang="en"` en una web íntegramente en castellano.** Lo pone el JavaScript. Es una contradicción directa con el contenido.

**Sin datos estructurados.** Ni `LocalBusiness`, ni `Course`, ni `FAQPage` (y eso que la página tiene seis preguntas frecuentes visibles), ni `AggregateRating`. Cero posibilidades de resultado enriquecido.

**Sin canonical.** Con una SPA que responde 200 a todo, esto es grave: cualquier variante de URL es una duplicación sin resolver.

**Imágenes sin optimizar.** El hero es un JPG de 1920×1280 servido tal cual para mostrarse a 1009 px. Sin `srcset`, sin WebP ni AVIF, sin `width`/`height` declarados (riesgo de CLS). La `og-image` pesa 370 KB.

**Una sola URL es un techo.** Con una página no se puede atacar "clases de salsa en Vilanova" y "clases de bachata en Vilanova" a la vez. La web anterior tenía una URL para cada una. Esa es la pérdida estructural, y no se arregla con redirecciones.

---

## 6. Riesgo legal a verificar (no es SEO)

La sección "Lo que dicen nuestros alumnos" muestra un sello **"5.0 · Google Reviews"** con tres reseñas firmadas por **Marta Rodríguez**, **Javier Sánchez** y **Ana Gómez**, fechadas "hace 1 mes", "hace 3 semanas" y "hace 2 meses".

Las reseñas reales que mostraba la web anterior, que todavía aparecen en fragmentos de buscador, son otras y tienen otro tono: *"Me encanta BIMBA!! Explican muy bien y son super apasionados"*, *"Nunca pensé que conseguiría aprender a bailar pero Pol es un encanto y muy buen profe"*.

No coinciden ni en nombres ni en texto. Sumado a que el resto del sitio conserva la plantilla de Lovable sin tocar (la página de error sigue diciendo "Lovable App"), el indicio de que esas tres reseñas son **contenido de relleno de la plantilla presentado como reseñas de Google** es fuerte. No se puede afirmar desde fuera sin comprobar su ficha de Google.

Si lo fueran, no es un detalle estético: publicar como reseñas de consumidores reales unas que no lo son es una práctica comercial desleal desde la transposición de la Directiva Ómnibus (Real Decreto-ley 24/2021, que modifica el texto refundido de la LGDCU), con régimen sancionador propio.

**Para NEXUS esto no es munición, es una lección.** Es exactamente la línea que `CLAUDE.md` prohíbe cruzar y el motivo de que las 9 reseñas de la home salgan de la ficha verificada vía Featurable, con `originalText` y sin filtro de estrellas.

---

## 7. Qué significa para NEXUS VNG

**La ventaja técnica se ha vuelto una diferencia de categoría.**

| Frente | Bimba (21-09-2026) | NEXUS (21-09-2026) |
|---|---|---|
| Páginas indexables | 1 real + decenas de fantasmas | 44 |
| Texto servido a un rastreador sin JavaScript | 0 palabras | 2.900–3.800 por página |
| URLs con keyword local | 0 vivas (las antiguas son fantasmas) | 6 páginas de entrada + 10 fichas |
| Contenido informacional | 0 | 10 guías |
| Datos estructurados | Ninguno | `DanceSchool` + `Course` + `FAQPage` + `BreadcrumbList` |
| `canonical` | No existe | En las 44 URLs |
| `robots.txt` y `sitemap.xml` | No existen | Los dos, con 44 URLs |
| Gestión de 404 | Todo devuelve 200 | 404 reales con `noindex` |
| Reseñas | 3, verosímilmente de plantilla | 9 reales de la ficha verificada |
| Directorios | go&dance y otros | **0** |
| Antigüedad y notoriedad de marca | Alta, aunque erosionándose | Baja |

**Lo que NO cambia esto:** Bimba sigue teniendo lo que NEXUS no tiene y no depende de código. Su Instagram posiciona. Está en los directorios. Su marca la conoce la gente de Vilanova. Nada de eso se ha caído con la web.

**La lectura estratégica, sin autoengaño.** Hay una ventana abierta, y tiene fecha de caducidad. Mientras las URLs de Bimba sean fantasmas, esas consultas ("clases de salsa en Vilanova", "clases de bachata en Vilanova", "clases de kizomba", "clases de heels") tienen el primer puesto mal defendido. Las 6 páginas de entrada publicadas hoy están hechas exactamente para eso. Pero **la ventana se cierra el día que alguien de Bimba suba un fichero de redirecciones**, que son dos horas de trabajo. Contar con que no lo hagan no es una estrategia.

Lo que sí es una estrategia es lo que sigue pendiente y no depende de ellos:

1. **Enviar el sitemap en Search Console.** Sin esto NEXUS no se entera de si ocupa el hueco.
2. **Los 8 directorios.** Ahí Bimba sigue intacta y sigue siendo el frente donde NEXUS va 0.
3. **Reseñas de Google.** De 9 a 25.
4. **La redirección 308 de `www`.** Ahora duplica 44 URLs.

---

## 8. Resumen del veredicto

| Ámbito | Nota | En una línea |
|---|---|---|
| Migración | **1/10** | Ni una sola redirección. Todo devuelve 200 |
| Rastreo e indexación | **1/10** | Sin robots.txt, sin sitemap, sin canonical, soft 404 en todo el dominio |
| Contenido | **2/10** | 663 palabras y una sola URL para todo el negocio |
| Datos estructurados | **0/10** | Ninguno |
| On-page | **3/10** | H1 sin keyword ni ciudad, `lang="en"`, title servido ≠ title renderizado |
| Accesibilidad para rastreadores | **2/10** | Todo el contenido depende de ejecutar JavaScript, sin respaldo |
| Rendimiento | **7/10** | TTFB de 0,09 s. Penaliza el hero sin optimizar y la carga en cliente |
| Mobile | **8/10** | Correcto a 375 px, sin desbordamiento |
| Conversión y copy | **7/10** | Mejor escrito que la web anterior. Es lo único que ha mejorado |
| Confianza y legalidad | **A verificar** | Reseñas que no coinciden con las reales y llevan sello de Google |
| **Global** | **3/10** | **Una web bonita montada encima de una migración no hecha** |

La web anterior valía más que esta aunque fuera más fea, porque tenía URLs, texto y una estructura que Google entendía. Lo que se ha publicado en septiembre es una tarjeta de presentación con buen copy, y una tarjeta de presentación no posiciona.
