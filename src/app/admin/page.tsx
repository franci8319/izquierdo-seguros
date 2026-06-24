"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/types/content";
import AdminShell from "@/components/admin/AdminShell";
import HeroEditor from "@/components/admin/HeroEditor";
import AboutEditor from "@/components/admin/AboutEditor";
import SegurosEditor from "@/components/admin/SegurosEditor";
import WhyChooseUsEditor from "@/components/admin/WhyChooseUsEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import ContactLegalEditor from "@/components/admin/ContactLegalEditor";
import BannerEditor from "@/components/admin/BannerEditor";
import ChangePasswordEditor from "@/components/admin/ChangePasswordEditor";

export default function AdminPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then(async (res) => {
        if (!res.ok) throw new Error("No se ha podido cargar el contenido.");
        return res.json();
      })
      .then((data) => {
        setContent(data.content);
        setSha(data.sha);
      })
      .catch((error: Error) => setLoadError(error.message));
  }, []);

  async function handleSave() {
    if (!content || !sha) return;
    setSaving(true);
    setSaveError(null);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sha }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(data.error ?? "No se ha podido guardar.");
      return;
    }
    const data = await res.json();
    setSha(data.sha);
    setSavedAt(Date.now());
  }

  if (loadError) {
    return <p className="p-10 text-sm text-red-600">{loadError}</p>;
  }

  if (!content) {
    return <p className="p-10 text-sm text-neutral-500">Cargando contenido...</p>;
  }

  return (
    <AdminShell onSave={handleSave} saving={saving} saveError={saveError} savedAt={savedAt}>
      <HeroEditor hero={content.hero} onChange={(hero) => setContent({ ...content, hero })} />
      <AboutEditor aboutUs={content.aboutUs} onChange={(aboutUs) => setContent({ ...content, aboutUs })} />
      <SegurosEditor seguros={content.seguros} onChange={(seguros) => setContent({ ...content, seguros })} />
      <WhyChooseUsEditor
        whyChooseUs={content.whyChooseUs}
        onChange={(whyChooseUs) => setContent({ ...content, whyChooseUs })}
      />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Imágenes</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ImageUploader
            label="Foto del Hero"
            value={content.images.hero}
            onChange={(hero) => setContent({ ...content, images: { ...content.images, hero } })}
          />
          <ImageUploader
            label="Foto de Sobre Nosotros"
            value={content.images.about}
            onChange={(about) => setContent({ ...content, images: { ...content.images, about } })}
          />
          <ImageUploader
            label="Fondo de Seguros (escritorio)"
            value={content.images.segurosBackgroundDesktop}
            onChange={(segurosBackgroundDesktop) =>
              setContent({ ...content, images: { ...content.images, segurosBackgroundDesktop } })
            }
          />
          <ImageUploader
            label="Fondo de Seguros (móvil)"
            value={content.images.segurosBackgroundMobile}
            onChange={(segurosBackgroundMobile) =>
              setContent({ ...content, images: { ...content.images, segurosBackgroundMobile } })
            }
          />
        </div>
      </section>

      <ContactLegalEditor
        contact={content.contact}
        legal={content.legal}
        onChangeContact={(contact) => setContent({ ...content, contact })}
        onChangeLegal={(legal) => setContent({ ...content, legal })}
      />

      <BannerEditor banner={content.banner} onChange={(banner) => setContent({ ...content, banner })} />

      <ChangePasswordEditor />
    </AdminShell>
  );
}
