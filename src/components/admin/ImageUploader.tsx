"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
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

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      {value && (
        <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-lg border border-neutral-200">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="mt-2 block text-sm text-neutral-600"
      />
      {uploading && <p className="mt-1 text-sm text-neutral-500">Subiendo...</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
