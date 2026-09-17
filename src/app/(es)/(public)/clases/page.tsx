import type { Metadata } from "next";
import { Clases } from "@/components/paginas/Clases";
import { tClases } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  // Sin "Clases de baile en Vilanova…": ese es el title de la home y las dos
  // URLs competirían por la misma consulta.
  title: tClases.es.title,
  // 150–160 caracteres: por encima, Google corta la descripción en el SERP.
  description: tClases.es.description,
  alternates: { canonical: "/clases" },
};

// Revalidar cada hora por si cambian las modalidades en Supabase.
export const revalidate = 3600;

export default function ClasesPage() {
  return <Clases locale="es" />;
}
