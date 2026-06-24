import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { SiteContent } from "@/types/content";

export default function HeroEditor({
  hero,
  onChange,
}: {
  hero: SiteContent["hero"];
  onChange: (hero: SiteContent["hero"]) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Portada (Hero)</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Texto pequeño superior"
          value={hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
        />
        <TextField label="Titular" value={hero.title} onChange={(title) => onChange({ ...hero, title })} />
        <TextAreaField
          label="Subtítulo"
          value={hero.subtitle}
          onChange={(subtitle) => onChange({ ...hero, subtitle })}
        />
      </div>
    </section>
  );
}
