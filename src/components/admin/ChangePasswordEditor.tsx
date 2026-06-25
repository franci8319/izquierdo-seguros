"use client";

import { useState } from "react";
import PasswordField from "@/components/ui/PasswordField";

export default function ChangePasswordEditor() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedNew.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPassword.trim(), newPassword: trimmedNew }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido cambiar la contraseña.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className="mt-4 max-w-sm space-y-4">
        <PasswordField
          label="Contraseña actual"
          required
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordField
          label="Nueva contraseña"
          required
          minLength={8}
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordField
          label="Repetir nueva contraseña"
          required
          minLength={8}
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}
