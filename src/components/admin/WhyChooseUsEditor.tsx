import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import IconPicker from "./IconPicker";
import type { SiteContent } from "@/types/content";

export default function WhyChooseUsEditor({
  whyChooseUs,
  onChange,
}: {
  whyChooseUs: SiteContent["whyChooseUs"];
  onChange: (whyChooseUs: SiteContent["whyChooseUs"]) => void;
}) {
  function updateCard(index: number, patch: Partial<SiteContent["whyChooseUs"]["cards"][number]>) {
    const cards = whyChooseUs.cards.map((card, i) => (i === index ? { ...card, ...patch } : card));
    onChange({ ...whyChooseUs, cards });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Por qué elegirnos</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Título de la sección"
          value={whyChooseUs.heading}
          onChange={(heading) => onChange({ ...whyChooseUs, heading })}
        />
        {whyChooseUs.cards.map((card, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <IconPicker value={card.icon} onChange={(icon) => updateCard(index, { icon })} />
            <TextField label="Título" value={card.title} onChange={(title) => updateCard(index, { title })} />
            <TextAreaField
              label="Descripción"
              rows={2}
              value={card.description}
              onChange={(description) => updateCard(index, { description })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
