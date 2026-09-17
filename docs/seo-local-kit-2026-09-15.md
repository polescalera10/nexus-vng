# Kit de SEO local — NEXUS VNG

Material listo para las tareas del plan SEO que tiene que hacer Pol (T10, T13, T14, T15, T16). Todo sale de datos que ya están en la web (`src/lib/site.ts`, horario del cartel, fichas de disciplina). **Nada inventado:** donde falta un dato, pone `[PENDIENTE]`.

> **Regla de oro del NAP.** Nombre, dirección y teléfono se copian **exactamente** así en todos los sitios, carácter a carácter. Una variación ("Rbla.", "1ª planta", otro formato de teléfono) cuenta para Google como otro negocio.

```
NEXUS VNG
Rambla del Garraf, 32, 1a Planta
08812 Sant Pere de Ribes (Barcelona)
+34 669 29 10 88
https://nexusvng.es
```

---

## T10 · Google Business Profile

| Campo | Valor |
|---|---|
| Nombre | `NEXUS VNG` (sin añadir "escuela de baile" al nombre: Google lo penaliza como relleno de keywords) |
| Categoría principal | Escuela de baile |
| Categorías secundarias | Academia de salsa · Clases de bachata (si Google no las ofrece literalmente, las más cercanas) |
| Dirección | Rambla del Garraf, 32, 1a Planta, 08812 Sant Pere de Ribes |
| Zona de servicio | Vilanova i la Geltrú · Sant Pere de Ribes · Sitges · Cubelles |
| Teléfono | +34 669 29 10 88 |
| Web | `https://nexusvng.es/?utm_source=gbp&utm_medium=organic` |
| Enlace de citas | `https://wa.me/34669291088` |
| Horario | Lunes 18:30–23:00 · Martes 20:30–23:00 · Miércoles 18:30–23:00 · Jueves 20:30–23:00 · Viernes 19:30–23:00 · Sábado y domingo cerrado |
| Atributos | Idiomas: español, catalán · [PENDIENTE: accesibilidad del local, lo sabe Pol] |

El horario es el mismo que declara el schema de la web; si cambia el cartel, se cambia en los dos sitios.

**Descripción (≤750 caracteres):**

> NEXUS VNG es la escuela de baile del Gimnasio Aranha, a dos calles de Vilanova i la Geltrú. Damos clases de salsa cubana, bachata, reparto, reggaetón, lady style, heels y sexy style, y tenemos grupos de compañía de salsa y de bachata lady. Los grupos van por nivel real, desde cero absoluto, de lunes a viernes por la tarde-noche. No hace falta venir con pareja. La forma más rápida de empezar es escribirnos por WhatsApp: nos cuentas qué quieres bailar y qué días puedes, y te decimos qué grupo encaja contigo.

**Servicios** (nombre y enlace):

| Servicio | URL |
|---|---|
| Clases de salsa cubana | https://nexusvng.es/clases/salsa-cubana |
| Clases de bachata | https://nexusvng.es/clases/bachata |
| Clases de reparto | https://nexusvng.es/clases/reparto |
| Clases de reggaetón | https://nexusvng.es/clases/reggaeton |
| Lady style salsa | https://nexusvng.es/clases/lady-style-salsa |
| Lady style bachata | https://nexusvng.es/clases/lady-style-bachata |
| Clases de heels | https://nexusvng.es/clases/heels |
| Clases de sexy style | https://nexusvng.es/clases/sexy-style |
| Compañía de salsa | https://nexusvng.es/clases/cia-salsa |
| Compañía de bachata lady | https://nexusvng.es/clases/cia-bachata-lady |

**Fotos** (subir desde `public/media/` del repo, que son del material real de agosto):
- Portada: `comunidad/sala-panoramica.jpg`
- Interior: `comunidad/clase-bachata.jpg`
- En acción, una por disciplina: `clases/salsa-cubana-ancha.jpg`, `clases/bachata-ancha.jpg`, `clases/reparto-ancha.jpg`, `clases/heels-ancha.jpg`, `clases/lady-style-salsa-ancha.jpg`, `clases/lady-style-bachata-ancha.jpg`
- Equipo: fotos de `public/images/profes/`
- Logo: `public/images/nexus-logo.png`

**Cuando la ficha esté verificada, pásame:**
1. La URL de la ficha en Google Maps.
2. Latitud y longitud del pin (clic derecho sobre el pin en Maps → la primera línea son las coordenadas).
3. El enlace para pedir reseñas (Perfil → "Pedir reseñas").

Con eso hago la T11 (`geo`, `hasMap` y `sameAs` en el schema).

---

## T13 · Pedir reseñas

**Checklist legal** (Directiva Ómnibus y LGDCU; incumplirla es sancionable):
- [ ] Se pide a **todos** los alumnos, no solo a los que sabemos contentos.
- [ ] **Sin nada a cambio:** ni puntos del ranking, ni descuentos, ni sorteos.
- [ ] No se redacta la reseña por nadie ni se sugiere la nota.
- [ ] No se piden reseñas a profesores, familia ni amigos que no son alumnos.
- [ ] No se borran ni se esconden las negativas: se responden con educación.

**Mensaje de WhatsApp** (enlace de la ficha verificada el 16-09-2026):

> Hola, {nombre}. Estamos empezando a darnos a conocer en Google y nos ayuda mucho saber qué opinan quienes ya bailan con nosotros. Si te apetece, puedes dejar tu opinión aquí, tal cual la tengas: https://g.page/r/CYgihhQ1LBbiEBM/review
> Tarda un minuto. Y si hay algo que mejorarías, también queremos saberlo. ¡Gracias!

**Responder a cada reseña** en menos de una semana, con nombre y algo concreto de lo que dice. Nunca una respuesta copiada.

---

## T14 · Directorios

Mismo texto en todos. Descripción larga (500 caracteres), para los campos que la admitan:

> NEXUS VNG es una escuela de baile en el Gimnasio Aranha (Rambla del Garraf, 32, Sant Pere de Ribes), junto a Vilanova i la Geltrú. Damos clases de salsa cubana, bachata, reparto, reggaetón, lady style, heels y sexy style, y tenemos grupos de compañía que montan coreografías y actúan. Los grupos van por nivel, hay iniciación para quien empieza de cero y no hace falta venir con pareja. Clases de una hora, de lunes a viernes por la tarde-noche. Reserva tu clase de prueba por WhatsApp: 669 29 10 88.

Descripción corta (≤300 caracteres), para los campos con límite:

> Escuela de baile a dos calles de Vilanova i la Geltrú, en el Gimnasio Aranha. Salsa cubana, bachata, reparto, reggaetón, lady style y heels en grupos por nivel, desde cero y sin necesidad de pareja. Clases de lunes a viernes por la tarde-noche.

| Directorio | URL de alta | Coste | Hecho | URL de la ficha publicada |
|---|---|---|---|---|
| Bing Places | https://www.bingplaces.com (importa desde Google Business Profile) | Gratis | [ ] | |
| Apple Business Connect | https://businessconnect.apple.com | Gratis | [ ] | |
| salsaybachata.net | https://salsaybachata.net/profesionales/ | Gratis ("para siempre") | [x] enviado 16-09 | |
| ~~sientelbaile.com~~ | https://sientelbaile.com/add-listing/ | De pago (confirmado por Pol): descartado | — | |
| go&dance | https://www.goandance.com (cuenta profesional → crear local) | Local gratis; comisión solo si vendes plazas | [x] enviado 16-09 | |
| Cylex | https://www.cylex.es | Gratis | [ ] | |
| Infobel | https://www.infobel.com/es/spain | Gratis | [ ] | |
| Hotfrog | https://www.hotfrog.es | Ficha básica gratis | [ ] | |
| QDQ | https://www.qdq.com | Ficha básica gratis | [ ] | |
| Páginas Amarillas | https://www.paginasamarillas.es | Ficha básica gratis; ofrecen planes de pago | [ ] | |
| Serveis Actius (Garraf) | https://www.serveisactius.cat | Por confirmar | [ ] | |
| Guía d'establiments de Sant Pere de Ribes | promocioeconomica@santperederibes.cat | Gratis (municipal) | [ ] | |
| Guía de Eix Diari | https://www.eixdiari.cat/serveis/guia/ | Por confirmar | [ ] | |
| Directorio de vilanova.cat | https://www.vilanova.cat/directori | Gratis; puede exigir sede o entidad en Vilanova | [ ] | |
| Fixando | https://www.fixando.es | Perfil gratis; pagas por cada solicitud | [ ] | |
| ~~mydance.zone~~ | — | Certificado SSL caducado el 16-09-2026: no darse de alta | — | |

Estilos que marcar donde haya lista: salsa cubana, casino, rueda de casino, bachata, reggaetón, reparto, lady style, heels. **Pásame las URL publicadas** y compruebo el NAP de cada una.

---

## T15 · Nota de prensa (borrador)

**Para:** redacción de Eix Diari y Diari de Vilanova
**Asunto:** NEXUS VNG empieza la temporada 2026-2027 de clases de baile junto a Vilanova

> **NEXUS VNG empieza la temporada 2026-2027 de clases de baile junto a Vilanova i la Geltrú**
>
> La escuela de baile NEXUS VNG, con sede en el Gimnasio Aranha (Rambla del Garraf, 32, Sant Pere de Ribes), empieza la temporada 2026-2027 con clases de lunes a viernes de salsa cubana, bachata, reparto, reggaetón, lady style, heels y sexy style, además de dos grupos de compañía que preparan coreografías para actuar.
>
> La escuela cerró el verano con ocho intensivos en agosto, uno por estilo, pensados para probar un baile antes de apuntarse a un curso. [PENDIENTE: si Pol quiere dar una cifra de asistentes, solo la real.] Los grupos se organizan por nivel real y hay grupos de iniciación para quien no ha bailado nunca. No hace falta venir con pareja.
>
> [PENDIENTE: una cita de Pol, con sus palabras, sobre por qué abrió la escuela o qué quiere que encuentre quien viene.]
>
> Horarios y disciplinas en nexusvng.es. Contacto para medios: [PENDIENTE: nombre] · +34 669 29 10 88 · polescalera10@gmail.com
>
> Fotos disponibles para su publicación, con permiso de las personas que aparecen.

Antes de enviarla: rellenar la cita, adjuntar 2–3 fotos de `public/media/comunidad/` y comprobar que el nombre del gimnasio y la dirección están bien escritos.

---

## T16 · Cuestionario para las bios de profesores

Para Davide, Martina, Pol, Yuri y Ana Aylén. Respuestas cortas y verdaderas; no hace falta que suenen bonitas, la redacción la hago yo y cada profe la revisa antes de publicar.

1. ¿Cuántos años llevas bailando y cuántos dando clase?
2. ¿Dónde o con quién te has formado? (escuelas, maestros, congresos, compañías)
3. ¿Has actuado o competido? ¿Dónde? (solo lo que se pueda nombrar)
4. ¿Cómo es una clase tuya? ¿Qué es lo primero que trabajas con alguien nuevo?
5. ¿Para quién son tus clases? ¿Y para quién no?
6. Tu Instagram (o el perfil público que quieras enlazar), si quieres que salga.

Una ficha se queda sin publicar la bio si el profe no la ha revisado.
