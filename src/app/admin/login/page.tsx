"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PasswordField from "@/components/ui/PasswordField";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido iniciar sesión.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleForgotPassword() {
    setLoading(true);
    setError(null);
    await fetch("/api/admin/forgot-password", { method: "POST" });
    setLoading(false);
    setForgotSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <Image
          src="/logos/logo-color.png"
          alt="Izquierdo Seguros"
          width={242}
          height={100}
          className="mx-auto h-12 w-auto"
        />
        <h1 className="mt-6 text-center text-lg font-semibold text-foreground">
          Panel de administración
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordField label="Contraseña" required value={password} onChange={setPassword} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {forgotSent ? (
            <p className="text-neutral-600">
              Si la cuenta existe, te hemos enviado un enlace de recuperación.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-brand-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
