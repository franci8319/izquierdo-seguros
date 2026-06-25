"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUploader from "./ImageUploader";

const LIBRARY_AVATARS = Array.from(
  { length: 30 },
  (_, i) => `/images/avatars/library/face-${String(i + 1).padStart(2, "0")}.jpg`,
);

export default function AvatarPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (path: string) => void;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700">Foto del cliente</span>

      <div className="mt-2 flex items-center gap-3">
        <span className="relative h-16 w-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
          {value && <Image src={value} alt="" fill className="object-cover" />}
        </span>
        <button
          type="button"
          onClick={() => setGalleryOpen((open) => !open)}
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          {galleryOpen ? "Cerrar galería" : "Elegir de la galería"}
        </button>
      </div>

      {galleryOpen && (
        <div className="mt-3 grid grid-cols-6 gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-8">
          {LIBRARY_AVATARS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                onChange(src);
                setGalleryOpen(false);
              }}
              className={`relative aspect-square overflow-hidden rounded-full border-2 transition hover:border-brand-500 ${
                value === src ? "border-brand-600" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-3">
        <ImageUploader label="O sube tu propia foto" value={null} onChange={onChange} />
      </div>
    </div>
  );
}
