import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import { aboutUsCopy } from "@/lib/constants";

const stats = [
  { icon: "cercania" as const, label: "Trato familiar y cercano" },
  { icon: "revision" as const, label: "Revisamos anualmente tu seguro" },
  { icon: "telefono" as const, label: "Atención fuera de horario en urgencias" },
] as const;

export default function AboutUs() {
  return (
    <section id="sobre-nosotros" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealOnScroll className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-md">
            <Image
              src="/images/about/equipo-oficina.jpg"
              alt="Oficina de Izquierdo Seguros en Dúrcal"
              fill
              className="object-cover"
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <SectionHeading eyebrow={aboutUsCopy.eyebrow} title={aboutUsCopy.heading} />
            <div className="mt-6 space-y-4">
              {aboutUsCopy.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="text-base leading-relaxed text-neutral-600">
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <li key={stat.label} className="flex items-start gap-3">
                  <IconBadge icon={stat.icon} size="sm" />
                  <span className="text-sm font-medium text-neutral-800">{stat.label}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
