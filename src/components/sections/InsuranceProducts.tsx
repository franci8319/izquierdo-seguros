import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import SeguroCard from "@/components/ui/SeguroCard";
import type { SeguroContent } from "@/types/content";

export default function InsuranceProducts({
  seguros,
  backgroundDesktop,
  backgroundMobile,
}: {
  seguros: SeguroContent[];
  backgroundDesktop: string | null;
  backgroundMobile: string | null;
}) {
  return (
    <section id="seguros" className="relative overflow-hidden bg-white py-20 sm:py-28">
      {backgroundMobile && (
        <div
          className="absolute inset-0 opacity-90 sm:hidden"
          style={{ backgroundImage: `url(${backgroundMobile})`, backgroundRepeat: "repeat", backgroundSize: "260px" }}
        />
      )}
      {backgroundDesktop && (
        <div
          className="absolute inset-0 hidden opacity-90 sm:block"
          style={{ backgroundImage: `url(${backgroundDesktop})`, backgroundRepeat: "repeat", backgroundSize: "340px" }}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          {seguros.map((seguro) => (
            <div data-card key={seguro.id}>
              <SeguroCard seguro={seguro} />
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
