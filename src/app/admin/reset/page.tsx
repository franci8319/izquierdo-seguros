"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PasswordField from "@/components/ui/PasswordField";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: password.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido cambiar la contraseña.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <p className="text-sm text-red-600">
        Enlace inválido. Solicita uno nuevo desde la pantalla de login.
      </p>
    );
  }

  if (done) {
    return (
      <div>
        <p className="text-sm text-neutral-700">Contraseña actualizada. Ya puedes iniciar sesión.</p>
        <a href="/admin/login" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Ir al login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField label="Nueva contraseña" required minLength={8} value={password} onChange={setPassword} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

export default function AdminResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-center text-lg font-semibold text-foreground">Restablecer contraseña</h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-neutral-500">Cargando...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
