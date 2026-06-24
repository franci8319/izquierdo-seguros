import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";

const ventajas = [
  {
    icon: "revision" as const,
    title: "Revisamos anualmente tu seguro",
    description:
      "Cada año revisamos tu póliza para mejorar el precio o mantener las mejores condiciones, buscando siempre tu beneficio.",
  },
  {
    icon: "telefono" as const,
    title: "Atención fuera de horario en urgencias",
    description:
      "Si tienes una urgencia, te atendemos incluso fuera del horario habitual, porque sabemos que un imprevisto no avisa.",
  },
  {
    icon: "estudio" as const,
    title: "Estudiamos tus necesidades y ajustamos tus coberturas",
    description:
      "Analizamos tu situación para ofrecerte la cobertura justa que necesitas, ni más ni menos.",
  },
  {
    icon: "siniestro" as const,
    title: "Te acompañamos en cada siniestro",
    description:
      "Gestionamos contigo cada parte y cada siniestro, resolviendo tus dudas de forma directa, paso a paso.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="por-que-elegirnos" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Por qué elegirnos"
          title="El valor de un trato de confianza"
          align="center"
        />

        <RevealOnScroll
          itemsSelector="[data-ventaja]"
          className="mt-12 grid gap-8 sm:grid-cols-2"
        >
          {ventajas.map((v) => (
            <div data-ventaja key={v.title} className="flex items-start gap-4">
              <IconBadge icon={v.icon} />
              <div>
                <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{v.description}</p>
              </div>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
