import type { Metadata } from "next";
import { SupportPage } from "@/components/layout/SupportPage";
import { LegalDraftNote, LegalList, LegalP, LegalSection, LegalTodo } from "@/components/layout/Legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recoge NEXUS VNG cuando escribes o rellenas un formulario, para qué se usan, cuánto se guardan y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <SupportPage
      title="Política de privacidad"
      intro="Cómo tratamos tus datos personales, para qué y qué derechos tienes (RGPD y LOPDGDD)."
    >
      <LegalDraftNote />

      <LegalSection title="1. Responsable del tratamiento">
        <LegalList
          items={[
            <>Responsable: <LegalTodo>nombre y apellidos o razón social del titular</LegalTodo></>,
            <>NIF/CIF: <LegalTodo>NIF o CIF</LegalTodo></>,
            <>Domicilio: {site.nap.streetAddress}, {site.nap.postalCode} {site.nap.addressLocality} ({site.nap.addressRegion})</>,
            <>Correo electrónico: <LegalTodo>email para asuntos de privacidad</LegalTodo></>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Qué datos tratamos">
        <LegalList
          items={[
            "Formularios de contacto y clase de prueba: nombre, teléfono, email (opcional), modalidad de interés y mensaje.",
            "Contacto por WhatsApp: número de teléfono y contenido de la conversación, tratados también por WhatsApp (Meta) según sus propias condiciones.",
            "Área privada de alumnos: email de acceso, datos de perfil y datos de gestión académica (inscripciones, asistencia).",
            "No se solicitan categorías especiales de datos. Los servicios se dirigen a personas mayores de 18 años.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Para qué y con qué base legal">
        <LegalList
          items={[
            "Atender tu solicitud de información o de clase de prueba y proponerte grupo y horario — medidas precontractuales a petición tuya (art. 6.1.b RGPD).",
            "Gestionar tu relación como alumno (inscripciones, asistencia, comunicaciones operativas) — ejecución de contrato (art. 6.1.b RGPD).",
            "Enviarte comunicaciones comerciales, solo si las has consentido expresamente — consentimiento (art. 6.1.a RGPD), revocable en cualquier momento.",
            "Seguridad del sitio y prevención de abuso en los formularios — interés legítimo (art. 6.1.f RGPD).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Cuánto tiempo conservamos los datos">
        <LegalP>
          Los datos de solicitudes de información se conservan el tiempo necesario para atenderlas
          y, como máximo, <LegalTodo>plazo de conservación de leads, p. ej. 12 meses</LegalTodo>{" "}
          desde el último contacto. Los datos de alumnos se conservan mientras dure la relación y,
          después, durante los plazos de prescripción legal aplicables.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Destinatarios y encargados de tratamiento">
        <LegalP>No vendemos tus datos. Los tratan por cuenta nuestra, como encargados o servicios necesarios:</LegalP>
        <LegalList
          items={[
            <>Supabase (base de datos y autenticación del área privada) — <LegalTodo>confirmar región de alojamiento (UE) y acuerdo de encargo (DPA)</LegalTodo>.</>,
            <>n8n (automatización de avisos internos de nuevas solicitudes) — <LegalTodo>confirmar dónde está alojada la instancia y su DPA</LegalTodo>.</>,
            "WhatsApp (Meta Platforms Ireland Ltd.), si nos escribes por ese canal: se aplica su propia política de privacidad.",
            "Google Analytics 4 (Google Ireland Ltd.), solo si aceptas las cookies de análisis: mide de forma agregada el uso de la web. Ver la política de cookies.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Transferencias internacionales">
        <LegalP>
          Trabajamos preferentemente con proveedores que alojan los datos en la Unión Europea.{" "}
          <LegalTodo>
            confirmar, según los proveedores definitivos, si existen transferencias fuera del EEE y
            bajo qué garantías (cláusulas contractuales tipo, Data Privacy Framework)
          </LegalTodo>
          .
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <LegalP>
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del
          tratamiento y portabilidad escribiendo a{" "}
          <LegalTodo>email para asuntos de privacidad</LegalTodo>, adjuntando información que
          permita verificar tu identidad. También puedes retirar tu consentimiento en cualquier
          momento y reclamar ante la Agencia Española de Protección de Datos (www.aepd.es) si
          consideras que el tratamiento no es adecuado.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <LegalP>
          Aplicamos medidas técnicas y organizativas apropiadas: acceso restringido por roles a la
          base de datos, cifrado de las comunicaciones (HTTPS) y validación de los datos recibidos
          por los formularios.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Actualizaciones de esta política">
        <LegalP>
          Podemos actualizar esta política para reflejar cambios normativos o de proveedores. Última
          actualización: <LegalTodo>fecha de publicación definitiva</LegalTodo>.
        </LegalP>
      </LegalSection>
    </SupportPage>
  );
}
