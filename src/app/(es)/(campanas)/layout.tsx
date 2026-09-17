import { Analytics } from "@/components/analytics/Analytics";
import { Logo } from "@/components/layout/Logo";
import { CampanaFooter } from "@/components/campanas/CampanaFooter";

/**
 * Layout aislado de las landings de campaña (/l/[icp]/[dolor]).
 * Sin nav del sitio: logo + contenido + un pie mínimo. Mobile-first, foco
 * total en el CTA. El WhatsApp sticky lo pone cada página (necesita el
 * mensaje propio del dolor).
 *
 * El pie es deliberadamente pequeño (`CampanaFooter`, no el `Footer` global):
 * cubre lo legal — se recogen datos en el formulario — y da enlaces internos
 * al sitio ahora que estas rutas también reciben tráfico orgánico.
 */
export default function CampanasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink">
      <header className="container-nexus flex items-center py-5">
        <Logo size={28} priority />
      </header>
      {children}
      <CampanaFooter />
      <Analytics />
    </div>
  );
}
