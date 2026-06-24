import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import IconPicker from "./IconPicker";
import type { SeguroContent } from "@/types/content";

export default function SegurosEditor({
  seguros,
  onChange,
}: {
  seguros: SeguroContent[];
  onChange: (seguros: SeguroContent[]) => void;
}) {
  function updateSeguro(index: number, patch: Partial<SeguroContent>) {
    onChange(seguros.map((seguro, i) => (i === index ? { ...seguro, ...patch } : seguro)));
  }

  function addSeguro() {
    onChange([
      ...seguros,
      { id: `seguro-${Date.now()}`, title: "Nuevo seguro", description: "", icon: "hogar" },
    ]);
  }

  function removeSeguro(index: number) {
    onChange(seguros.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Seguros</h2>
        <button type="button" onClick={addSeguro} className="text-sm font-semibold text-brand-600 hover:underline">
          + Añadir seguro
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {seguros.map((seguro, index) => (
          <div key={seguro.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <IconPicker value={seguro.icon} onChange={(icon) => updateSeguro(index, { icon })} />
              <button type="button" onClick={() => removeSeguro(index)} className="text-sm text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
            <TextField label="Título" value={seguro.title} onChange={(title) => updateSeguro(index, { title })} />
            <TextAreaField
              label="Descripción"
              rows={2}
              value={seguro.description}
              onChange={(description) => updateSeguro(index, { description })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
