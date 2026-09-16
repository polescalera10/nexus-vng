# Informe SEO comparativo — nexusvng.es

**Fecha:** 16 de septiembre de 2026 (tarde)
**Compara:** la auditoría del 15-09 (`docs/informe-seo-2026-09-15.md`, línea base `docs/seo-baseline-2026-09-15.jsonl`) con el estado actual (`docs/seo-estado-2026-09-16.jsonl`).

**Método.** El mismo de la auditoría:
- Rastreo de producción con `scripts/seo-crawl.py` y `--diff` contra la línea base.
- Variantes de URL (www, http, barra final, 404).
- Cabeceras, DNS y sitemap.
- JSON-LD de la home.
- Búsquedas de competencia con el mismo buscador genérico.

**Limitaciones.** Siguen igual que en la auditoría:
- La API de PageSpeed sigue sin cuota, así que el rendimiento es la medición de laboratorio del 16-09.
- Sin Search Console, sin Ahrefs y con Analytics caído.
- Los efectos en posiciones tardan semanas: esto mide lo que la web **emite**, no todavía cómo la trata Google.

---

## Nota por ámbito

| Ámbito | 15-09 | 16-09 | Qué ha movido la nota |
|---|---|---|---|
| Rastreo e indexación | 8,0 | **8,5** | `/eventos` fuera del índice y del sitemap; `/intensivos` sin fecha pasada; `lastmod` reales. Resta: www sigue en 200 |
| Rendimiento y seguridad | 8,0 | **8,5** | CSP bloqueante confirmada. LCP móvil de laboratorio 1,3–2,0 s y CLS 0 |
| Mobile y UX | 9,0 | **9,0** | Carrusel y mapa pasan los 99 e2e (320 px, Safari incluido) |
| Datos estructurados | 8,0 | **9,0** | `geo`, `hasMap`, `sameAs` con la ficha de Maps, foto real y `BlogPosting` |
| On-page | 7,0 | **9,0** | 29/29 titles ≤60, metas de 122 a 157 caracteres, un H1 con keyword en todas las páginas de apoyo |
| Arquitectura y enlazado | 6,5 | **7,5** | Existe el hub `/blog`, con enlace de ida y vuelta a las fichas. Las fichas de profesor siguen finas |
| Búsqueda con IA | 5,0 | **6,0** | Primer contenido citable, con datos propios (1 h por clase, rotación voluntaria, nivel asignado por el profe) |
| E-E-A-T y prueba social | 4,5 | **6,5** | 9 reseñas reales (5,0), texto literal, sello en el hero, mapa y ficha verificada. Sin bios |
| Contenido | 4,0 | **5,0** | 1 artículo de 1.200 palabras (1 de los 10 del mapa editorial) |
| SEO local | 3,0 | **5,0** | GBP verificada con reseñas, NAP web = ficha, coordenadas del pin. 0 directorios |
| Autoridad y enlaces | 2,0 | **2,0** | Sin cambios. La marca sigue sin aparecer en buscadores |
| Catalán | 1,0 | **1,0** | Fuera del plan, por decisión |
| **Global** | **5,5** | **6,4** | **Técnica de 8,0 a 8,8 · visibilidad de 3,7 a 4,7** |

(Global = media de los 12 ámbitos; técnica = los 5 primeros; visibilidad = los 7 restantes.)

**Lectura corta.** La parte que depende del código ha llegado al techo razonable: queda poco que ganar en titles, schema o rendimiento. Todo lo que falta para superar a Bimba Dance está fuera del repositorio. Por orden, los directorios, más reseñas, las bios de los profes, los artículos y Search Console.

---

## Rastreo: antes y después

| Métrica | 15-09 | 16-09 |
|---|---|---|
| URLs en sitemap | 28 | 29 (−`/eventos`, +`/blog`, +1 artículo) |
| URLs con status ≠ 200 | 0 | 0 |
| Titles >60 caracteres | 2 (62 y 64) | 0 |
| Titles sin keyword en páginas de apoyo | 6 | 0 |
| H1 sin keyword (apoyo + profesores) | 9 | 0 |
| Metas >160 caracteres | 1 (183) | 0 |
| Metas de fichas con ciudad y llamada a la acción | 0/10 | 10/10 |
| Páginas con `GeoCoordinates` | 0 | 29 |
| `Event` caducados en JSON-LD | 8 | 0 |
| Páginas indexables vacías | 1 (`/eventos`, 41 palabras) | 0 |
| Imágenes sin `alt` | 0 | 0 |
| Palabras en la home | 1.207 | 1.614 (reseñas y mapa) |
| Contenido informacional | 0 páginas | 1 artículo (1.200 palabras) |
| `sameAs` de la organización | Instagram | Instagram + Google Maps |

**Comprobaciones puntuales:**
- `http→https` y barra final: 308.
- 404 reales.
- HSTS con preload.
- `x-vercel-cache: HIT`.
- robots.txt abierto con sitemap.
- Registro TXT `google-site-verification` presente en el DNS.
- `/blog/salsa-cubana-o-bachata-cual-empezar` emite `BlogPosting` y `/clases/bachata` lo enlaza.

---

## Qué sigue igual (y por qué)

| Punto de la auditoría | Estado | Qué hace falta |
|---|---|---|
| `www.nexusvng.es` responde 200 | **Sin cambio**. La canonical apunta a `nexusvng.es`, lo que mitiga el duplicado, pero no lo quita | Pol: Vercel → Domains → www → Redirect 308 |
| Search Console y Bing | **Parcial**: el TXT de verificación está en el DNS. No se puede comprobar desde aquí si el sitemap está enviado | Pol: enviar el sitemap (29 URLs) e importar a Bing |
| Directorios | **0 de 8**. sientelbaile.com («11 mejores academias en Vilanova»), salsaybachata.net y go&dance siguen listando a Bimba, Dance Gold y Flow Center, no a NEXUS | Pol: altas con el kit (`docs/seo-local-kit-2026-09-15.md`) |
| Fichas de profesor finas | 91–180 palabras (Yuri 91) | Pol: cuestionario de bios |
| Evento de WhatsApp como conversión en GA4 | Sin comprobar (conector caído) | Pol: marcar `whatsapp_click` como evento clave y reconectar |
| Colisión de marca | «NEXUS VNG» devuelve el repositorio de GitHub (descripción antigua «Aranha Baile») y otras academias. `nexusvng.es` no aparece en el buscador | Directorios, prensa y GBP. Actualizar la descripción del repo |
| Catalán | Inexistente | Fuera del plan |

**Nuevo desde la auditoría:**
- **Vercel Security Checkpoint.** Durante la tarde del 16-09, Vercel respondió 403 con su pantalla de verificación a todo el tráfico que no fuera navegador. A esta hora responde 200 de nuevo. Si vuelve a pasar, revisar Firewall → Attack Challenge Mode / Bot Protection: bloquea previsualizaciones de enlaces y rastreadores de IA.
- **Serveis Actius** (serveisactius.cat) aparece en la búsqueda local con una página de escuelas de danza de Vilanova. Candidato a añadir a la lista de directorios.
- **La descripción del repo de GitHub** («Aranha Baile — escuela de salsa cubana…») es lo primero que sale al buscar la marca. Conviene actualizarla a NEXUS VNG con enlace a nexusvng.es.

---

## Competencia: posición relativa

| Frente | Bimba Dance | NEXUS 15-09 | NEXUS 16-09 |
|---|---|---|---|
| Web técnica (SSR, schema, rendimiento) | Baja | Muy superior | Muy superior |
| Páginas con keyword local | Sí, casi duplicadas | Solo fichas | Fichas + apoyo + blog |
| Reseñas visibles | En directorios | 0 | 9 (5,0) en web y ficha |
| Presencia en directorios | go&dance y otros | 0 | 0 |
| Contenido informacional | No | No | 1 artículo |
| Aparece en «escuela de baile Vilanova salsa bachata» | Sí (3 resultados) | No | No |

NEXUS ha ganado ventaja en todo lo que se controla desde la web. Bimba sigue ganando en lo que se ve fuera de ella: directorios, antigüedad y resultados de búsqueda.

---

## Siguientes pasos por impacto

1. **Directorios** (8 + Serveis Actius) con el NAP exacto del kit → enlaces y presencia en las búsquedas donde hoy sale solo la competencia.
2. **Redirección 308 de www** (5 minutos).
3. **Sitemap en Search Console e importación en Bing**, para empezar a medir.
4. **Más reseñas**: de 9 a 25 en 90 días, con el mensaje del kit (a todos, sin incentivos).
5. **Bios de profesores** → E-E-A-T y fichas indexables con cuerpo.
6. **Artículo 2** («Aprender a bailar sin pareja»).
7. **Descripción del repo de GitHub** con la marca nueva.

## Próxima medición

| Cuándo | Qué |
|---|---|
| 30-09-2026 | Reseñas, indexación de las 29 URLs en GSC, directorios dados de alta |
| 15-12-2026 | Local pack «escuela de baile Vilanova», posiciones, clics a WhatsApp desde orgánico |
