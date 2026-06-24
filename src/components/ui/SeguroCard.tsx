import type { Seguro } from "@/types/seguro";
import IconBadge from "./IconBadge";

export default function SeguroCard({ seguro }: { seguro: Seguro }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <IconBadge icon={seguro.icono} />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{seguro.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{seguro.descripcion}</p>
      <a
        href="#contacto"
        className="mt-4 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Pedir información
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </a>
    </div>
  );
}
