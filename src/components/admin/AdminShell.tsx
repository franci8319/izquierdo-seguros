"use client";

import { useRouter } from "next/navigation";

export default function AdminShell({
  children,
  onSave,
  saving,
  saveError,
  savedAt,
}: {
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saveError: string | null;
  savedAt: number | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <div
        className="fixed inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: "url(/images/patterns/seguros-bg-mobile.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "320px",
        }}
      />
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">Panel de administración</h1>
        <div className="flex items-center gap-4">
          {saveError && <span className="text-sm text-red-600">{saveError}</span>}
          {!saveError && savedAt && (
            <span className="text-sm text-green-600">Guardado. Se publicará en ~1 minuto.</span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={handleLogout} className="text-sm text-neutral-500 hover:text-neutral-800">
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="relative z-0 mx-auto max-w-4xl space-y-10 px-6 py-10">{children}</main>
    </div>
  );
}
