import type { Metadata } from "next";
import { Horarios, primeraFranja, ultimaFranja } from "@/components/paginas/Horarios";
import { tHorarios } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tHorarios.es.title,
  // ≤155 caracteres: por encima, el SERP la corta a mitad de frase.
  description: tHorarios.es.description(primeraFranja, ultimaFranja),
  alternates: { canonical: "/horarios" },
};

export default function HorariosPage() {
  return <Horarios locale="es" />;
}
