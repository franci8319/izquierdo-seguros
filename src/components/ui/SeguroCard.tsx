import type { SeguroContent } from "@/types/content";
import IconBadge from "./IconBadge";

export default function SeguroCard({ seguro }: { seguro: SeguroContent }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <IconBadge icon={seguro.icon} />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{seguro.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{seguro.description}</p>
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
