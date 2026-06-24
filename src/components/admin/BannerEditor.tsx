import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import ImageUploader from "./ImageUploader";
import type { SiteContent } from "@/types/content";

export default function BannerEditor({
  banner,
  onChange,
}: {
  banner: SiteContent["banner"];
  onChange: (banner: SiteContent["banner"]) => void;
}) {
  function update(patch: Partial<SiteContent["banner"]>) {
    onChange({ ...banner, ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Aviso emergente</h2>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={banner.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
          Activado
        </label>
      </div>
      <div className="mt-4 space-y-4">
        <TextAreaField label="Texto del aviso" rows={3} value={banner.text} onChange={(text) => update({ text })} />
        <ImageUploader label="Imagen (opcional)" value={banner.image} onChange={(image) => update({ image })} />
        <TextField
          label="Texto del botón (opcional)"
          value={banner.ctaText ?? ""}
          onChange={(ctaText) => update({ ctaText: ctaText || null })}
        />
        <TextField
          label="Enlace del botón (opcional, ej. #contacto)"
          value={banner.ctaHref ?? ""}
          onChange={(ctaHref) => update({ ctaHref: ctaHref || null })}
        />
      </div>
    </section>
  );
}
