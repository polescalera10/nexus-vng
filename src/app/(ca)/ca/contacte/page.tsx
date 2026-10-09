import type { Metadata } from "next";
import { Contacto } from "@/components/paginas/Contacto";
import { alternatesDe } from "@/i18n/rutas";
import { tContacto } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tContacto.ca.title,
  description: tContacto.ca.description,
  alternates: alternatesDe("/ca/contacte"),
};

export default function ContactePage() {
  return <Contacto locale="ca" />;
}
