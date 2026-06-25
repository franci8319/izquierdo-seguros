import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types/content";

function StarRating() {
  return (
    <span className="flex items-center gap-0.5" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-amber-400" aria-hidden="true">
          <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.77l-5.18 2.67.99-5.77L1.62 7.59l5.79-.84z" />
        </svg>
      ))}
    </span>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section id="opiniones" className="bg-neutral-50 py-10 sm:py-14">
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
              <figcaption className="mt-4 flex items-center gap-3 text-sm font-semibold text-foreground">
                {testimonial.avatar ? (
                  <span className="relative h-10 w-10 overflow-hidden rounded-full border border-neutral-200">
                    <Image src={testimonial.avatar} alt={testimonial.author} fill className="object-cover" />
                  </span>
                ) : null}
                <span className="flex flex-col">
                  <span>{testimonial.author}</span>
                  <StarRating />
                </span>
              </figcaption>
            </figure>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
