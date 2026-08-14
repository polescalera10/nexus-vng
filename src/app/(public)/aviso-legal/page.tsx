import type { Metadata } from "next";
import { SupportPage } from "@/components/layout/SupportPage";
import { LegalDraftNote, LegalList, LegalP, LegalSection, LegalTodo } from "@/components/layout/Legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Titularidad del sitio, condiciones de uso y responsabilidad de NEXUS VNG, escuela de baile en Vilanova i la Geltrú.",
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegalPage() {
  return (
    <SupportPage title="Aviso legal" intro="Información legal sobre la titularidad y el uso de este sitio web.">
      <LegalDraftNote />

      <LegalSection title="1. Identificación del titular">
        <LegalP>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este
          sitio web es titularidad de:
        </LegalP>
        <LegalList
          items={[
            <>Titular: <LegalTodo>nombre y apellidos o razón social del titular</LegalTodo></>,
            <>NIF/CIF: <LegalTodo>NIF o CIF</LegalTodo></>,
            <>Domicilio: {site.nap.streetAddress}, {site.nap.postalCode} {site.nap.addressLocality} ({site.nap.addressRegion})</>,
            <>Correo electrónico: <LegalTodo>email de contacto legal</LegalTodo></>,
            <>Teléfono: <LegalTodo>teléfono de contacto</LegalTodo></>,
            <>Nombre comercial: {site.name}</>,
            <>Sitio web: {site.url}</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Objeto">
        <LegalP>
          Este sitio web tiene por objeto dar a conocer la actividad de {site.name} —escuela de
          baile en {site.locality}—, informar sobre sus clases, eventos y servicios, y
          facilitar el contacto con las personas interesadas. El acceso y la navegación implican la
          aceptación de este aviso legal.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. Condiciones de uso">
        <LegalP>
          El usuario se compromete a hacer un uso adecuado del sitio y de sus contenidos, y a no
          emplearlos para actividades ilícitas o contrarias a la buena fe, ni para difundir
          contenidos que atenten contra los derechos de terceros. El envío de datos a través de los
          formularios debe corresponder a información veraz y propia.
        </LegalP>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <LegalP>
          Los contenidos de este sitio (textos, diseño, logotipos, imágenes, vídeos y código) están
          protegidos por derechos de propiedad intelectual e industrial titularidad de{" "}
          {site.name} o de terceros que han autorizado su uso. Queda prohibida su reproducción,
          distribución o transformación sin autorización expresa, salvo los usos permitidos por la
          ley.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Responsabilidad">
        <LegalP>
          {site.name} no se hace responsable de los daños derivados del mal uso del sitio, de
          interrupciones o fallos técnicos ajenos a su control, ni de los contenidos de sitios de
          terceros enlazados desde estas páginas. La información publicada tiene carácter
          informativo; las condiciones concretas de clases, horarios y tarifas se confirman por los
          canales de contacto.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Enlaces">
        <LegalP>
          Este sitio puede incluir enlaces a servicios de terceros (por ejemplo, WhatsApp, Instagram
          o Google Maps). {site.name} no controla ni asume responsabilidad sobre esos servicios, que
          se rigen por sus propias condiciones y políticas de privacidad.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Legislación aplicable">
        <LegalP>
          Este aviso legal se rige por la legislación española. Para cualquier controversia, y salvo
          que la normativa de consumidores establezca otro fuero, las partes se someten a los
          juzgados y tribunales del domicilio del usuario cuando este tenga la condición de
          consumidor.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Actualización">
        <LegalP>
          Última actualización: <LegalTodo>fecha de publicación definitiva</LegalTodo>.
        </LegalP>
      </LegalSection>
    </SupportPage>
  );
}
