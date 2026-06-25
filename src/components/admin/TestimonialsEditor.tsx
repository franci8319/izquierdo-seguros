import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { Testimonial } from "@/types/content";

export default function TestimonialsEditor({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}) {
  function updateTestimonial(index: number, patch: Partial<Testimonial>) {
    onChange(testimonials.map((testimonial, i) => (i === index ? { ...testimonial, ...patch } : testimonial)));
  }

  function addTestimonial() {
    onChange([...testimonials, { id: `testimonio-${Date.now()}`, quote: "", author: "" }]);
  }

  function removeTestimonial(index: number) {
    onChange(testimonials.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Opiniones de clientes</h2>
        <button type="button" onClick={addTestimonial} className="text-sm font-semibold text-brand-600 hover:underline">
          + Añadir opinión
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => removeTestimonial(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
            <TextAreaField
              label="Opinión"
              rows={3}
              value={testimonial.quote}
              onChange={(quote) => updateTestimonial(index, { quote })}
            />
            <TextField
              label="Autor (nombre o iniciales)"
              value={testimonial.author}
              onChange={(author) => updateTestimonial(index, { author })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
