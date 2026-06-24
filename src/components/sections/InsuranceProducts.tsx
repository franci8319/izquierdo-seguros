import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import SeguroCard from "@/components/ui/SeguroCard";
import { segurosData } from "@/lib/seguros-data";

export default function InsuranceProducts() {
  return (
    <section id="seguros" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Nuestros seguros"
          title="Seguros pensados para tu día a día"
          description="Estudiamos tus necesidades y revisamos tu póliza cada año para ajustar tu cobertura, con el mismo trato cercano de siempre."
          align="center"
        />

        <RevealOnScroll
          itemsSelector="[data-card]"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {segurosData.map((seguro) => (
            <div data-card key={seguro.id}>
              <SeguroCard seguro={seguro} />
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
