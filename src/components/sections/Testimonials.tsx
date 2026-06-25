import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types/content";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section id="opiniones" className="bg-amber-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Opiniones" title="Lo que dicen nuestros clientes" align="center" />

        <RevealOnScroll
          itemsSelector="[data-testimonial]"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <figure
              data-testimonial
              key={testimonial.id}
              className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <span aria-hidden="true" className="text-3xl font-serif leading-none text-brand-300">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-foreground">
                — {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
