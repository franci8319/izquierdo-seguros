import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import type { SiteContent } from "@/types/content";

export default function WhyChooseUs({ whyChooseUs }: { whyChooseUs: SiteContent["whyChooseUs"] }) {
  return (
    <section id="por-que-elegirnos" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Por qué elegirnos" title={whyChooseUs.heading} align="center" />

        <RevealOnScroll itemsSelector="[data-ventaja]" className="mt-12 grid gap-8 sm:grid-cols-2">
          {whyChooseUs.cards.map((card) => (
            <div data-ventaja key={card.title} className="flex items-start gap-4">
              <IconBadge icon={card.icon} />
              <div>
                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{card.description}</p>
              </div>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
