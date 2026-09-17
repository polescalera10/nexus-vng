import type { Metadata } from "next";
import { Contacto } from "@/components/paginas/Contacto";
import { tContacto } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tContacto.es.title,
  description: tContacto.es.description,
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return <Contacto locale="es" />;
}
