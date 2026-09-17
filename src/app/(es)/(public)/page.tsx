import { Inicio } from "@/components/paginas/Inicio";
import { tInicioMeta } from "@/i18n/textos/inicio";
import type { Metadata } from "next";

/*
  Meta propia de la home, con acción al final. No se toca `site.description`:
  además de la meta por defecto del layout, es la `description` del
  `DanceSchool` en el JSON-LD, y ahí no pinta una llamada a WhatsApp.
  Solo se declara `description`: Next fusiona por clave con el layout, así que
  title, canonical y openGraph siguen saliendo de allí.
*/
export const metadata: Metadata = {
  description: tInicioMeta.es.description,
};

// ISR: la landing es estática y se revalida cada hora (modalidades editables).
export const revalidate = 3600;

export default function HomePage() {
  return <Inicio locale="es" />;
}
