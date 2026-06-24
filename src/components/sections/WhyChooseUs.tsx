import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";

const ventajas = [
  {
    icon: "comparar" as const,
    title: "Comparamos varias aseguradoras",
    description:
      "No dependemos de una sola compañía: buscamos entre varias para encontrar la cobertura y el precio que más te convienen.",
  },
  {
    icon: "cercania" as const,
    title: "Atención personalizada y cercana",
    description:
      "Hablas siempre con una persona que te conoce, no con un contestador automático ni un chatbot.",
  },
  {
    icon: "siniestro" as const,
    title: "Te acompañamos en cada siniestro",
    description:
      "Gestionamos contigo cada parte y cada siniestro, resolviendo tus dudas de forma directa, paso a paso.",
  },
  {
    icon: "telefono" as const,
    title: "Disponibles cuando nos necesitas",
    description:
      "Atendemos incluso fuera del horario habitual, porque sabemos que un imprevisto no avisa.",
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
