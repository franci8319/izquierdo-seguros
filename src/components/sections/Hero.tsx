"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import CtaButton from "@/components/ui/CtaButton";
import { business } from "@/lib/constants";

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll<HTMLElement>("[data-hero-anim]");

    if (reduceMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, delay: 0.1 }
    );
  }, []);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative overflow-hidden bg-white pt-32 pb-16 sm:pt-40 sm:pb-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p data-hero-anim className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Agentes de seguros en Dúrcal, Granada
          </p>
          <h1
            data-hero-anim
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Tu tranquilidad, nuestra prioridad
          </h1>
          <p data-hero-anim className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Décadas acompañando a familias de Dúrcal y la comarca con un trato cercano que ya
            no es fácil de encontrar. Estudiamos tus necesidades, revisamos tu seguro cada año
            y te atendemos también fuera de horario en caso de urgencia.
          </p>
          <div data-hero-anim className="mt-8 flex flex-wrap gap-4">
            <CtaButton href={business.phone.landlineHref}>Llamar ahora</CtaButton>
            <CtaButton href="#seguros" variant="secondary">
              Ver nuestros seguros
            </CtaButton>
          </div>
        </div>

        <div data-hero-anim className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/images/hero/hero-familia.jpg"
            alt="Vivienda asegurada por Izquierdo Seguros"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />
          <div className="absolute inset-0 bg-brand-700/20 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
