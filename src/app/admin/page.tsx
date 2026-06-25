"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/types/content";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import InsuranceProducts from "@/components/sections/InsuranceProducts";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Contact from "@/components/sections/Contact";
import WhatsappFloatingButton from "@/components/ui/WhatsappFloatingButton";

import EditButton from "@/components/admin/EditButton";
import EditDrawer from "@/components/admin/EditDrawer";
import HeroEditor from "@/components/admin/HeroEditor";
import AboutEditor from "@/components/admin/AboutEditor";
import SegurosEditor from "@/components/admin/SegurosEditor";
import WhyChooseUsEditor from "@/components/admin/WhyChooseUsEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import ContactLegalEditor from "@/components/admin/ContactLegalEditor";
import BannerEditor from "@/components/admin/BannerEditor";
import ChangePasswordEditor from "@/components/admin/ChangePasswordEditor";

type EditorKey = "hero" | "about" | "seguros" | "why" | "contact" | "banner" | "password" | null;

export default function AdminPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [openEditor, setOpenEditor] = useState<EditorKey>(null);

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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (loadError) {
    return <p className="p-10 text-sm text-red-600">{loadError}</p>;
  }

  if (!content) {
    return <p className="p-10 text-sm text-neutral-500">Cargando contenido...</p>;
  }

  return (
    <div>
      <div className="fixed inset-x-0 top-20 z-[60] flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-foreground">Editando la web</span>
          <span className="hidden text-neutral-500 sm:inline">
            Pulsa el lápiz de cada sección para cambiarla.
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {saveError && <span className="text-sm text-red-600">{saveError}</span>}
          {!saveError && savedAt && (
            <span className="hidden text-sm text-green-600 sm:inline">Guardado, se publica en ~1 min</span>
          )}
          <button
            type="button"
            onClick={() => setOpenEditor("banner")}
            className="hidden text-sm font-medium text-neutral-600 hover:text-brand-700 sm:inline"
          >
            Aviso emergente
          </button>
          <button
            type="button"
            onClick={() => setOpenEditor("password")}
            className="hidden text-sm font-medium text-neutral-600 hover:text-brand-700 sm:inline"
          >
            Cuenta
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={handleLogout} className="text-sm text-neutral-500 hover:text-neutral-800">
            Salir
          </button>
        </div>
      </div>
      <div className="h-[136px]" />

      <Header contact={content.contact} />

      <main>
        <div className="relative">
          <EditButton label="Editar portada" onClick={() => setOpenEditor("hero")} />
          <Hero hero={content.hero} heroImage={content.images.hero} contact={content.contact} />
        </div>

        <div className="relative">
          <EditButton label="Editar Sobre nosotros" onClick={() => setOpenEditor("about")} />
          <AboutUs aboutUs={content.aboutUs} aboutImage={content.images.about} />
        </div>

        <div className="relative">
          <EditButton label="Editar seguros" onClick={() => setOpenEditor("seguros")} />
          <InsuranceProducts seguros={content.seguros} />
        </div>

        <div className="relative">
          <EditButton label="Editar por qué elegirnos" onClick={() => setOpenEditor("why")} />
          <WhyChooseUs whyChooseUs={content.whyChooseUs} />
        </div>

        <div className="relative">
          <EditButton label="Editar contacto" onClick={() => setOpenEditor("contact")} />
          <Contact contact={content.contact} />
        </div>
      </main>

      <Footer contact={content.contact} legal={content.legal} />
      <WhatsappFloatingButton contact={content.contact} />

      <EditDrawer title="Editar portada" open={openEditor === "hero"} onClose={() => setOpenEditor(null)}>
        <div className="space-y-6">
          <HeroEditor hero={content.hero} onChange={(hero) => setContent({ ...content, hero })} />
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Foto</h3>
            <div className="mt-3">
              <ImageUploader
                label="Foto del Hero"
                value={content.images.hero}
                onChange={(hero) => setContent({ ...content, images: { ...content.images, hero } })}
              />
            </div>
          </section>
        </div>
      </EditDrawer>

      <EditDrawer title="Editar Sobre nosotros" open={openEditor === "about"} onClose={() => setOpenEditor(null)}>
        <div className="space-y-6">
          <AboutEditor aboutUs={content.aboutUs} onChange={(aboutUs) => setContent({ ...content, aboutUs })} />
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Foto</h3>
            <div className="mt-3">
              <ImageUploader
                label="Foto de Sobre Nosotros"
                value={content.images.about}
                onChange={(about) => setContent({ ...content, images: { ...content.images, about } })}
              />
            </div>
          </section>
        </div>
      </EditDrawer>

      <EditDrawer title="Editar seguros" open={openEditor === "seguros"} onClose={() => setOpenEditor(null)}>
        <SegurosEditor seguros={content.seguros} onChange={(seguros) => setContent({ ...content, seguros })} />
      </EditDrawer>

      <EditDrawer title="Editar por qué elegirnos" open={openEditor === "why"} onClose={() => setOpenEditor(null)}>
        <WhyChooseUsEditor
          whyChooseUs={content.whyChooseUs}
          onChange={(whyChooseUs) => setContent({ ...content, whyChooseUs })}
        />
      </EditDrawer>

      <EditDrawer title="Editar contacto" open={openEditor === "contact"} onClose={() => setOpenEditor(null)}>
        <ContactLegalEditor
          contact={content.contact}
          legal={content.legal}
          onChangeContact={(contact) => setContent({ ...content, contact })}
          onChangeLegal={(legal) => setContent({ ...content, legal })}
        />
      </EditDrawer>

      <EditDrawer title="Aviso emergente" open={openEditor === "banner"} onClose={() => setOpenEditor(null)}>
        <BannerEditor banner={content.banner} onChange={(banner) => setContent({ ...content, banner })} />
      </EditDrawer>

      <EditDrawer title="Cuenta" open={openEditor === "password"} onClose={() => setOpenEditor(null)}>
        <ChangePasswordEditor />
      </EditDrawer>
    </div>
  );
}
