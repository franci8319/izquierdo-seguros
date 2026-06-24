import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import { business } from "@/lib/constants";

export default function Footer() {
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
              <li>{business.address.full}</li>
              <li>
                <a href={business.phone.landlineHref} className="hover:text-white">
                  {business.phone.landline}
                </a>
              </li>
              <li>
                <a href={business.phone.mobileHref} className="hover:text-white">
                  {business.phone.mobile} (WhatsApp)
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="hover:text-white">
                  {business.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          <p>
            © {year} {business.name}. Todos los derechos reservados.
          </p>
          {/* TODO: razón social, CIF y nº de registro DGSFP — pendiente de datos del cliente */}
        </div>
      </div>
    </footer>
  );
}
