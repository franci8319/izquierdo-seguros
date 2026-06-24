import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import CtaButton from "@/components/ui/CtaButton";
import IconBadge from "@/components/ui/IconBadge";
import { toTelHref, toWhatsappHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function Contact({ contact }: { contact: SiteContent["contact"] }) {
  return (
    <section id="contacto" className="bg-brand-900 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos sin compromiso"
          description="Cuéntanos qué necesitas y te asesoramos de forma honesta y directa, como siempre."
          align="center"
          light
        />

        <RevealOnScroll className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <IconBadge icon="telefono" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Teléfono fijo</p>
                <a href={toTelHref(contact.phoneLandline)} className="text-lg font-medium hover:text-white/80">
                  {contact.phoneLandline}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IconBadge icon="telefono" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Móvil y WhatsApp</p>
                <a href={toTelHref(contact.phoneMobile)} className="text-lg font-medium hover:text-white/80">
                  {contact.phoneMobile}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IconBadge icon="cercania" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Dirección</p>
                <p className="text-lg font-medium">{contact.address}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <CtaButton href={toTelHref(contact.phoneLandline)}>Llamar ahora</CtaButton>
              <CtaButton href={toWhatsappHref(contact.whatsappNumber)} variant="whatsapp">
                Escribir por WhatsApp
              </CtaButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-lg">
            <iframe
              title="Ubicación de Izquierdo Seguros en Dúrcal"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
              className="h-80 w-full border-0 lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
