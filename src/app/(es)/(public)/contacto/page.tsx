import type { Metadata } from "next";
import { alternatesDe } from "@/i18n/rutas";
import { Contacto } from "@/components/paginas/Contacto";
import { tContacto } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tContacto.es.title,
  description: tContacto.es.description,
  alternates: alternatesDe("/contacto"),
};

export default function ContactoPage() {
  return <Contacto locale="es" />;
}
