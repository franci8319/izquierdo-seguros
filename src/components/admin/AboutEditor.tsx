import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { SiteContent } from "@/types/content";

export default function AboutEditor({
  aboutUs,
  onChange,
}: {
  aboutUs: SiteContent["aboutUs"];
  onChange: (aboutUs: SiteContent["aboutUs"]) => void;
}) {
  function updateParagraph(index: number, value: string) {
    const paragraphs = [...aboutUs.paragraphs];
    paragraphs[index] = value;
    onChange({ ...aboutUs, paragraphs });
  }

  function updateStatLabel(index: number, label: string) {
    const stats = aboutUs.stats.map((stat, i) => (i === index ? { ...stat, label } : stat));
    onChange({ ...aboutUs, stats });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Sobre nosotros</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Texto pequeño superior"
          value={aboutUs.eyebrow}
          onChange={(eyebrow) => onChange({ ...aboutUs, eyebrow })}
        />
        <TextField label="Título" value={aboutUs.heading} onChange={(heading) => onChange({ ...aboutUs, heading })} />
        {aboutUs.paragraphs.map((paragraph, index) => (
          <TextAreaField
            key={index}
            label={`Párrafo ${index + 1}`}
            value={paragraph}
            onChange={(value) => updateParagraph(index, value)}
          />
        ))}
        <div>
          <span className="block text-sm font-medium text-neutral-700">Frases destacadas</span>
          <div className="mt-2 space-y-2">
            {aboutUs.stats.map((stat, index) => (
              <input
                key={index}
                type="text"
                value={stat.label}
                onChange={(e) => updateStatLabel(index, e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
