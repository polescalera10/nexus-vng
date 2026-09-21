# Línea base de Search Console — 21 de septiembre de 2026

**Por qué existe:** es la foto del "antes" de las 15 páginas publicadas hoy. Sin ella, dentro de tres meses no se puede saber qué movió qué. Datos leídos directamente de la propiedad, no estimados.

**Propiedad:** `nexusvng.es`, tipo **Dominio** (cubre apex, www, http y https; no hay punto ciego).
**Ventana:** últimos 28 días (23-08 a 19-09-2026). Indexación a 18-09.
**GA4:** cuenta `177906059`, propiedad `548146583`, medición `G-970MFPCC1J`.

---

## 1. Totales

| Métrica | Valor |
|---|---|
| Clics | **87** |
| Impresiones | **894** |
| CTR medio | **9,7 %** |
| Posición media | **7** |
| Consultas con datos | 34 |
| URLs con datos | 27 |

La curva de impresiones despega el 13-16 de septiembre, que es exactamente cuando se desplegaron los titles, las metas, el schema ampliado y el primer artículo.

---

## 2. Consultas: el diagnóstico está aquí

| Consulta | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| nexus vilanova i la geltru | 12 | 22 | 54,5 % | **1,5** |
| salsa vilanova i la geltru | 3 | 16 | 18,8 % | **5,0** |
| nexus | 1 | 10 | 10 % | 5,4 |
| aranha vilanova | 1 | 2 | 50 % | 7,0 |
| clases de bachata en vilanova i la geltru | 0 | **52** | 0 % | **11,2** |
| bachata vilanova i la geltru | 0 | **49** | 0 % | **12,2** |
| clases de baile vilanova i la geltru | 0 | 28 | 0 % | **11,6** |
| escuela de baile en vilanova i la geltru | 0 | 24 | 0 % | **12,3** |
| academias de baile en vilanova i la geltru | 0 | 23 | 0 % | **12,4** |

**Lectura.** Las consultas de marca convierten muy bien (54,5 % de CTR en posición 1,5). Las comerciales sin marca están todas entre la **posición 11 y la 13**: el principio de la página 2, donde no hay clics. 176 impresiones en esas cinco consultas y **cero** clics.

No es un problema de título ni de meta: es que están a dos o cuatro puestos de la página 1. El trabajo on-page ya rinde donde llega (CTR global del 9,7 % es bueno). Lo que falta para cruzar a la página 1 es autoridad, que es lo que dan los directorios y los enlaces.

**La excepción que confirma el plan:** "salsa vilanova i la geltru" ya está en **posición 5 con 18,8 % de CTR**. Es la consulta que hoy refuerza `/clases-de-salsa-en-vilanova`.

---

## 3. Páginas

| URL | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| `nexusvng.es/` | 74 | 537 | 13,8 % | 5,8 |
| **`www.nexusvng.es/`** | **6** | **294** | **2 %** | **7,9** |
| `/clases/bachata` | 2 | 68 | 2,9 % | 7,9 |
| `/faq` | 2 | 53 | 3,8 % | 5,6 |
| `/clases/reparto` | 2 | 30 | 6,7 % | 3,1 |
| `/clases` | 1 | 34 | 2,9 % | 4,2 |
| `/clases/lady-style-bachata` | 1 | 10 | 10 % | 15,2 |
| `/clases/cia-bachata-lady` | 0 | **62** | 0 % | 14,4 |
| `/l/empezar/ya-soy-mayor` | 0 | **49** | 0 % | 5,6 |
| `/clases/heels` | 0 | 36 | 0 % | 4,8 |

### Tres hallazgos

**(a) El `www` costaba un tercio de la home.** 294 impresiones propias con un CTR del 2 %, frente al 13,8 % del apex. Google indexaba las dos versiones y repartía las impresiones, y la duplicada rendía siete veces peor. El 308 puesto hoy consolida esto: esas 294 impresiones deberían fundirse en la URL buena en las próximas semanas. Es el argumento cuantificado de por qué ese punto llevaba un mes de retraso demasiado.

**(b) Canibalización real, detectada.** `/clases/cia-bachata-lady` (62 impresiones, posición 14,4) y `/clases/lady-style-bachata` (10 impresiones, posición 15,2) compiten por la misma consulta. La que se lleva las impresiones es la de **compañía**, que es un grupo por audición, no un producto de captación. Está entrando por la puerta equivocada.

**(c) Una landing en `noindex` sigue apareciendo.** `/l/empezar/ya-soy-mayor` tiene 49 impresiones en **posición 5,6**. Esas URLs se pasaron a `noindex` el 14-08; Google todavía no ha reprocesado la etiqueta. Conviene vigilar que desaparezcan y no dejarlas como están dando por hecho que ya no cuentan.

---

## 4. Indexación (a 18-09, antes de las 15 páginas nuevas)

| Estado | Páginas |
|---|---|
| **Indexadas** | **31** |
| Sin indexar | 16 |

Motivos de las 16:

| Motivo | Páginas | ¿Esperado? |
|---|---|---|
| Descubierta: actualmente sin indexar | **11** | **No. Es el problema** |
| Excluida por `noindex` | 2 | Sí |
| Página alternativa con canónica adecuada | 2 | Sí |
| Página con redirección | 1 | Sí |
| Rastreada: actualmente sin indexar | 0 | — |

Las 11 "descubiertas y sin rastrear": `/contacto`, `/eventos`, `/horarios`, `/intensivos`, `/privacidad`, `/profesores` y **las cinco fichas de profesor**.

"Descubierta: actualmente sin indexar" con último rastreo `N/D` significa que Google conoce la URL y **ni siquiera ha gastado presupuesto de rastreo en abrirla**. Es el síntoma clásico de dominio sin autoridad, y explica por qué las fichas de profesor de 91–180 palabras nunca han llegado al índice: Google no las considera lo bastante prometedoras para ir a verlas.

Es el argumento definitivo para las bios: no es que estén indexadas y rindan mal, es que no llegan a entrar.

---

## 5. Las 15 páginas de hoy

**Sitemap:** enviado y leído el 21-09, estado *Correcto*, **44 páginas descubiertas**.

Inspección individual el mismo día de publicación:

| URL | Estado |
|---|---|
| `/clases-de-salsa-en-vilanova` | **Indexada** |
| `/precios-clases-de-baile-vilanova` | **Indexada** |
| `/clases-de-baile-sin-pareja` | **Indexada** |
| `/clases-de-baile-sitges` | **Indexada** |
| `/blog/primera-clase-de-baile-que-esperar` | Descubierta, sin rastrear → indexación solicitada |

Las páginas de entrada entraron en el índice en horas. Los artículos del blog no, y la diferencia es el enlazado: las de entrada las enlaza el pie y las fichas; los artículos cuelgan más abajo.

**Indexación solicitada a mano (cuota diaria agotada tras 5):** primera-clase, rueda-de-casino, zapatos, donde-bailar-garraf, cuanto-se-tarda.

**Pendientes para mañana:** tipos-de-bachata, beneficios-de-bailar, empezar-a-bailar-a-partir-de-los-40, como-elegir-escuela-de-baile, más las dos páginas de entrada que faltan por comprobar.

---

## 6. Qué mirar en la próxima medición (30-09 y 15-12)

| Métrica | Hoy | Qué esperar |
|---|---|---|
| Impresiones de `www.nexusvng.es` | 294 | Tendiendo a 0, absorbidas por el apex |
| Posición de "clases de bachata en vilanova i la geltru" | 11,2 | Por debajo de 10 = primeros clics |
| Posición de "salsa vilanova i la geltru" | 5,0 | Top 3 con la página de entrada nueva |
| Páginas "descubiertas sin indexar" | 11 | Bajando según entren bios y enlaces |
| URLs indexadas | 31 de 47 | Subiendo hacia 44 |
| Consultas con datos | 34 | Subiendo: las guías abren cola larga |
| Clics de marca vs sin marca | 17 vs 0 | El objetivo es que aparezca la segunda columna |

---

# Parte 2 — Línea base de GA4 (mismos 28 días)

Leída con la cuenta de servicio `claude-ga-lector`, propiedad `548146583`.

## Canales

| Canal | Sesiones | Usuarios |
|---|---|---|
| Organic Social | **133** | 114 |
| Direct | 122 | 55 |
| Organic Search | 92 | 35 |
| Referral | 28 | 19 |
| **AI Assistant** | **24** | 13 |

**Instagram es el canal número uno**, por delante de la búsqueda. Direct tiene 122 sesiones de solo 55 usuarios: gente que vuelve, que es lo que se espera de alumnos consultando horarios.

**24 sesiones desde asistentes de IA, todas de `chatgpt.com`**, con un solo artículo publicado. Entran por `/`, `/clases`, `/horarios`, `/clases/sexy-style`, `/clases/heels`, `/clases/reparto` y hasta por la ficha de Ana Aylén. ChatGPT ya está recomendando la escuela. Las 10 guías publicadas hoy juegan exactamente en ese tablero.

## Conversión

| Evento | 28 días |
|---|---|
| `whatsapp_click` | **91** |
| `form_start` | 60 |
| `generate_lead` | **42** |

- **22,8 % de las sesiones acaban en un clic a WhatsApp** (91 sobre 399). Es una tasa muy alta.
- El formulario convierte al **70 %** una vez empezado (42 de 60). El problema no es el formulario.

## Dónde se convierte

| Página | Clics a WhatsApp |
|---|---|
| **`/clases`** | **47** |
| `/` | 9 |
| `/clases/salsa-cubana` | 7 |
| `/clases/sexy-style` | 6 |
| `/horarios` | 5 |
| `/profesores` | 5 |
| `/clases/bachata` | 4 |
| `/clases/reparto` | 3 |

**`/clases` se lleva el 52 % de todas las conversiones del sitio.** Es la página de verdad, muy por encima de la home. Y es también donde aterriza el tráfico social.

## Página de entrada del tráfico de búsqueda

| Página | Sesiones |
|---|---|
| `/` | 49 |
| `/clases` | 16 |
| `/clases/bachata` | 12 |
| `/intensivos` | 4 |
| resto | 1–3 |

Toda la captación orgánica entra por tres URLs. Las 15 nuevas están hechas para ensanchar justo eso.

## Lo que hay que saber al leer estos números

1. **Consent Mode v2 arranca en `denied`.** Hasta que el visitante acepta el banner solo llegan pings sin cookies, así que GA4 infracuenta siempre. GSC dice 87 clics orgánicos y GA4 dice 92 sesiones de Organic Search: cuadran, pero no siempre lo harán.
2. **Las 4 dimensiones personalizadas se crearon hoy y no son retroactivas.** `cta_origin` y `cta_label` empezarán a tener datos a partir de ahora, así que el desglose de qué página de entrada trae cada lead no estará disponible hasta dentro de unos días.
3. **Los eventos clave se marcaron hoy.** Las conversiones históricas no se recalculan: el informe de conversiones empieza a contar desde hoy.

## Conclusión que cruza las dos fuentes

La web **convierte muy bien y recibe poco**. 22,8 % de clic a WhatsApp y 70 % de cierre de formulario con solo 92 sesiones de búsqueda en 28 días.

El cuello de botella no es la web ni el copy: es que las consultas comerciales están en la página 2. Cada puesto que se suba se traduce casi en línea recta en leads, porque la conversión ya está resuelta.
