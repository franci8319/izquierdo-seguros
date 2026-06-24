import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import { toTelHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function Footer({
  contact,
  legal,
}: {
  contact: SiteContent["contact"];
  legal: SiteContent["legal"];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Image
              src="/logos/logo-blanco.png"
              alt="Izquierdo Seguros"
              width={242}
              height={100}
              className="h-14 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Agentes de seguros, empresa familiar en Dúrcal (Granada). Trato
              cercano, décadas de experiencia.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>{contact.address}</li>
              <li>
                <a href={toTelHref(contact.phoneLandline)} className="hover:text-white">
                  {contact.phoneLandline}
                </a>
              </li>
              <li>
                <a href={toTelHref(contact.phoneMobile)} className="hover:text-white">
                  {contact.phoneMobile} (WhatsApp)
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          <p>© {year} Izquierdo Seguros. Todos los derechos reservados.</p>
          {legal.razonSocial && (
            <p className="mt-1">
              {legal.razonSocial} — CIF {legal.cif} — Nº registro DGSFP {legal.dgsfpNumber}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
