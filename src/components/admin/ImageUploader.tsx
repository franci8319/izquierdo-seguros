"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { optimizeImage } from "@/lib/optimize-image";

export default function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke the local preview's object URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const optimized = await optimizeImage(file);

    // Show the chosen image immediately: the path returned below won't be
    // live on the public site until the GitHub commit it triggers finishes
    // redeploying (~30-60s), so previewing it from there would show broken
    // until then.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(optimized));

    setUploading(true);
    const formData = new FormData();
    formData.append("file", optimized);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido subir la imagen.");
      return;
    }
    const data = await res.json();
    onChange(data.path);
  }

  const displaySrc = previewUrl ?? value;

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative mt-2 block h-32 w-48 overflow-hidden rounded-lg border border-neutral-200 disabled:opacity-60"
      >
        {displaySrc ? (
          <Image src={displaySrc} alt="" fill unoptimized={!!previewUrl} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-50 text-sm text-neutral-400">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
          {uploading ? "Subiendo..." : displaySrc ? "Cambiar imagen" : "Añadir imagen"}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      {previewUrl && !uploading && !error && (
        <p className="mt-1 text-sm text-neutral-500">
          Guarda los cambios; la nueva imagen se verá en la web en ~1 minuto.
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
