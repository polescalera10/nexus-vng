import type { Metadata } from "next";
import { SupportPage } from "@/components/layout/SupportPage";
import { CookieSettingsButton } from "@/components/analytics/CookieBanner";
import { LegalDraftNote, LegalList, LegalP, LegalSection, LegalTodo } from "@/components/layout/Legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies usa nexusvng.es, para qué sirven, cuánto duran y cómo aceptarlas, rechazarlas o cambiar tu decisión cuando quieras.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <SupportPage
      title="Política de cookies"
      intro="Qué cookies usa este sitio, para qué sirven y cómo puedes gestionarlas."
    >
      <LegalDraftNote />

      <LegalSection title="1. Qué son las cookies">
        <LegalP>
          Las cookies son pequeños archivos que el navegador guarda al visitar un sitio web. Sirven,
          por ejemplo, para mantener una sesión iniciada o recordar preferencias.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Cookies técnicas (sin consentimiento)">
        <LegalP>
          Son estrictamente necesarias para el funcionamiento del sitio y están exentas de
          consentimiento según el artículo 22.2 de la LSSI-CE:
        </LegalP>
        <LegalList
          items={[
            "Cookies de sesión de autenticación (Supabase, con prefijo “sb-”): mantienen la sesión iniciada en el área privada de alumnos y profesores. Duración: la de la sesión y su renovación.",
            "Preferencia de cookies (almacenamiento local del navegador, clave “nexus-consent-analytics”): recuerda si has aceptado o rechazado la analítica para no volver a preguntártelo.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cookies de análisis (solo si las aceptas)">
        <LegalP>
          {site.name} utiliza Google Analytics 4 (Google Ireland Limited) para saber cuántas
          personas visitan la web, qué páginas leen y qué botones funcionan mejor. Nos sirve para
          mejorar el sitio, no para perfilarte con fines publicitarios.
        </LegalP>
        <LegalList
          items={[
            "Cookies “_ga” y “_ga_<ID>”: distinguen visitantes y sesiones de forma anónima. Duración: hasta 2 años.",
            "No se activan hasta que pulsas “Aceptar” en el banner: hasta entonces el modo de consentimiento de Google mantiene el almacenamiento denegado y no se escribe ninguna cookie de análisis.",
            "No usamos cookies de publicidad ni compartimos los datos con fines de marketing (ad_storage, ad_user_data y ad_personalization permanecen denegados).",
            "Los datos se tratan en la infraestructura de Google, que puede implicar transferencias internacionales amparadas en el Marco de Privacidad de Datos UE-EE. UU.",
          ]}
        />
        <LegalP>
          Puedes cambiar tu decisión en cualquier momento —retirar el consentimiento es tan fácil
          como darlo:
        </LegalP>
        <div className="mt-4">
          <CookieSettingsButton />
        </div>
      </LegalSection>

      <LegalSection title="4. Cookies de terceros">
        <LegalP>
          El único tercero que puede instalar cookies en nuestras páginas es Google Analytics, y
          solo tras tu consentimiento (apartado 3). Los enlaces a servicios externos (WhatsApp,
          Instagram, Google Maps) abren esos servicios fuera de este sitio; una vez allí, se aplican
          sus propias políticas de cookies.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Cómo gestionar o eliminar cookies">
        <LegalP>
          Puedes configurar tu navegador para bloquear o eliminar cookies (consulta la ayuda de
          Chrome, Safari, Firefox o Edge). Si bloqueas las cookies técnicas, el área privada puede
          dejar de funcionar; la parte pública seguirá siendo accesible.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Actualizaciones">
        <LegalP>
          Esta política se revisará si cambian las cookies utilizadas. Última actualización:{" "}
          <LegalTodo>fecha de publicación definitiva</LegalTodo>.
        </LegalP>
      </LegalSection>
    </SupportPage>
  );
}
