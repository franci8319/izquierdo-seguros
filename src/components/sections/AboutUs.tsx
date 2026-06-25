import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import type { SiteContent } from "@/types/content";

export default function AboutUs({
  aboutUs,
  aboutImage,
}: {
  aboutUs: SiteContent["aboutUs"];
  aboutImage: string;
}) {
  return (
    <section id="sobre-nosotros" className="bg-neutral-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealOnScroll className="lg:order-2">
            <SectionHeading eyebrow={aboutUs.eyebrow} title={aboutUs.heading} />
            <div className="mt-6 space-y-4">
              {aboutUs.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="text-base leading-relaxed text-neutral-600">
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {aboutUs.stats.map((stat) => (
                <li key={stat.label} className="flex items-start gap-3">
                  <IconBadge icon={stat.icon} size="sm" />
                  <span className="text-sm font-medium text-neutral-800">{stat.label}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          <RevealOnScroll className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-md lg:order-1">
            <Image src={aboutImage} alt="Oficina de Izquierdo Seguros en Dúrcal" fill className="object-cover" />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
