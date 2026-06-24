# Panel de Administración Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el panel `/admin` (login simple, recuperación de contraseña por email oculto, edición de contenido y banner emergente) descrito en `docs/superpowers/specs/2026-06-24-admin-panel-design.md`, migrando el contenido público a `content/site.json`.

**Architecture:** Next.js híbrido en Vercel (se abandona `output:'export'`): páginas públicas siguen estáticas en build, `/admin` y `/api/admin/*` corren como funciones serverless. Vercel KV guarda el hash de contraseña, tokens de recuperación y contadores de rate-limit. El contenido vive en `content/site.json` en el repo; el panel lo lee/escribe vía la API de Contents de GitHub (commit = redeploy automático).

**Tech Stack:** Next.js (App Router, TS), Tailwind v4, `@vercel/kv`, `resend`, Web Crypto API (sesión), Node `crypto.scrypt` (contraseña), Vitest (solo unit tests de lib puras).

## Global Constraints

- Repo: `franci8319/izquierdo-seguros`, rama `master`. Proyecto Vercel: `franci-8319-1062s-projects/izquierdo-seguros`. Dominio: `izquierdoseguros.es`.
- Gestor de paquetes: **pnpm** siempre, nunca npm/yarn.
- `next.config.ts` deja de tener `output: 'export'` tras este trabajo (sitio pasa a render híbrido).
- Toda ruta de escritura bajo `/api/admin/*` debe rechazar peticiones sin sesión válida (401).
- `RECOVERY_EMAIL` no debe aparecer nunca en código/HTML enviado al cliente — solo en variable de entorno leída en servidor.
- No existe framework de testing en el proyecto: se añade Vitest únicamente para funciones puras de `src/lib/` (auth, session, rate-limit, phone). Nada de tests de componentes ni e2e — verificación manual al final, según la spec.
- Todo el contenido visible de la web pública pasa a venir de `content/site.json`, nunca hardcodeado en componentes.

---

## Task 1: Configurar Vitest para tests de funciones puras

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: comando `pnpm test` (ejecuta `vitest run`), usado por todas las tareas siguientes que añaden tests.

- [ ] **Step 1: Instalar vitest**

Run: `pnpm add -D vitest`

- [ ] **Step 2: Crear configuración**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Añadir script de test**

Edit `package.json`, dentro de `"scripts"` añadir:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verificar que el comando corre (sin tests todavía)**

Run: `pnpm test`
Expected: `No test files found` (sale sin error de configuración) — confirma que vitest arranca.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "test: add vitest for pure-function unit tests"
```

---

## Task 2: Helper de teléfono (puro, con test)

**Files:**
- Create: `src/lib/phone.ts`
- Test: `src/lib/phone.test.ts`

**Interfaces:**
- Produces: `toTelHref(displayNumber: string): string`, `toWhatsappHref(displayNumber: string): string`. Usados por Header, Hero, Contact, Footer, MobileNav.

- [ ] **Step 1: Escribir el test**

```ts
// src/lib/phone.test.ts
import { describe, expect, it } from "vitest";
import { toTelHref, toWhatsappHref } from "./phone";

describe("toTelHref", () => {
  it("quita espacios y antepone +34", () => {
    expect(toTelHref("958 780 348")).toBe("tel:+34958780348");
  });
});

describe("toWhatsappHref", () => {
  it("construye una URL wa.me con prefijo 34", () => {
    expect(toWhatsappHref("659 518 748")).toBe("https://wa.me/34659518748");
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './phone'`

- [ ] **Step 3: Implementar**

```ts
// src/lib/phone.ts
export function toTelHref(displayNumber: string): string {
  return `tel:+34${displayNumber.replace(/\s+/g, "")}`;
}

export function toWhatsappHref(displayNumber: string): string {
  return `https://wa.me/34${displayNumber.replace(/\s+/g, "")}`;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/phone.ts src/lib/phone.test.ts
git commit -m "feat: add phone href helpers"
```

---

## Task 3: Tipos de contenido e iconos ampliados

**Files:**
- Modify: `src/components/ui/IconBadge.tsx`
- Create: `src/types/content.ts`
- Delete (al final de esta tarea, ya no se usan): `src/types/seguro.ts`

**Interfaces:**
- Produces: `IconKey` (type), `ICON_OPTIONS: { key: IconKey; label: string }[]` desde `@/components/ui/IconBadge`; `SiteContent`, `SeguroContent`, `WhyChooseUsCard`, `AboutUsStat` desde `@/types/content`. Usados por todas las tareas de migración de componentes y por el editor admin.

- [ ] **Step 1: Reescribir IconBadge.tsx con el tipo exportado, 4 iconos nuevos y la lista de opciones**

```tsx
// src/components/ui/IconBadge.tsx
export type IconKey =
  | "hogar"
  | "auto"
  | "vida"
  | "salud"
  | "decesos"
  | "viaje"
  | "mascotas"
  | "negocio"
  | "ahorro"
  | "telefono"
  | "revision"
  | "estudio"
  | "cercania"
  | "siniestro";

export const ICON_OPTIONS: { key: IconKey; label: string }[] = [
  { key: "hogar", label: "Hogar" },
  { key: "auto", label: "Auto y moto" },
  { key: "vida", label: "Vida" },
  { key: "salud", label: "Salud" },
  { key: "decesos", label: "Decesos" },
  { key: "viaje", label: "Viaje" },
  { key: "mascotas", label: "Mascotas" },
  { key: "negocio", label: "Negocio" },
  { key: "ahorro", label: "Ahorro" },
  { key: "telefono", label: "Teléfono" },
  { key: "revision", label: "Revisión" },
  { key: "estudio", label: "Estudio" },
  { key: "cercania", label: "Cercanía" },
  { key: "siniestro", label: "Siniestro" },
];

const paths: Record<IconKey, React.ReactNode> = {
  hogar: (
    <path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" />
  ),
  auto: (
    <path d="M5 16.5h14M6 16.5V12l1.8-4.2a2 2 0 0 1 1.84-1.3h4.72a2 2 0 0 1 1.84 1.3L18 12v4.5M6 16.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0Zm8.5 0a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0ZM6 12h12" />
  ),
  vida: (
    <path d="M12 20s-7-4.35-9.2-8.6C1.4 8.6 2.9 5.5 6 5.5c2 0 3.3 1.1 4 2.3.7-1.2 2-2.3 4-2.3 3.1 0 4.6 3.1 3.2 5.9C19 15.65 12 20 12 20Z" />
  ),
  salud: <path d="M9 3.5h6v6h6v6h-6v6H9v-6H3v-6h6Z" />,
  decesos: (
    <>
      <path d="M12 3c1.6 1.9 1.6 3.4 0 5-1.6-1.6-1.6-3.1 0-5Z" />
      <path d="M9.5 9h5v10.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V9Z" />
      <path d="M7 21h10" />
    </>
  ),
  viaje: <path d="M21 3 3 10.5l6.5 2.5L12 21l3-7.5L21 3Z" />,
  mascotas: (
    <>
      <circle cx="12" cy="15" r="3.2" />
      <circle cx="7" cy="10" r="1.6" />
      <circle cx="11" cy="7" r="1.6" />
      <circle cx="15" cy="7" r="1.6" />
      <circle cx="17.5" cy="10.5" r="1.6" />
    </>
  ),
  negocio: (
    <>
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <path d="M3 13h18" />
    </>
  ),
  ahorro: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.8c.3-.7 1.2-1.3 2.5-1.3 1.4 0 2.5.7 2.5 1.8s-1 1.6-2.5 1.8c-1.6.2-2.5.8-2.5 1.9 0 1 1.1 1.7 2.5 1.7 1.3 0 2.2-.5 2.5-1.2M12 7v1.4M12 15.6V17" />
    </>
  ),
  telefono: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />
  ),
  revision: (
    <>
      <path d="M7 3v3M17 3v3" />
      <path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M4 10h16" />
      <path d="M9 14.5 11 16.5 15.5 12" />
    </>
  ),
  estudio: (
    <>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M6 6h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  cercania: (
    <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20v-1.5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4V20m1-9.5a4 4 0 0 1 4 4V20" />
  ),
  siniestro: (
    <path d="M12 3 3 7.5v6c0 4.5 4 7.5 9 9 5-1.5 9-4.5 9-9v-6L12 3Zm0 5.5v4m0 3.25h.01" />
  ),
};

export default function IconBadge({
  icon,
  className = "",
  size = "md",
}: {
  icon: IconKey;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconSize = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4.5 w-4.5" : "h-6 w-6";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ${box} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconSize}
        aria-hidden="true"
      >
        {paths[icon]}
      </svg>
    </span>
  );
}
```

- [ ] **Step 2: Crear `src/types/content.ts`**

```ts
// src/types/content.ts
import type { IconKey } from "@/components/ui/IconBadge";

export type SeguroContent = {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
};

export type WhyChooseUsCard = {
  icon: IconKey;
  title: string;
  description: string;
};

export type AboutUsStat = {
  icon: IconKey;
  label: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  aboutUs: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    stats: AboutUsStat[];
  };
  whyChooseUs: {
    heading: string;
    cards: WhyChooseUsCard[];
  };
  seguros: SeguroContent[];
  contact: {
    phoneLandline: string;
    phoneMobile: string;
    whatsappNumber: string;
    address: string;
    email: string;
  };
  legal: {
    razonSocial: string;
    cif: string;
    dgsfpNumber: string;
  };
  images: {
    hero: string;
    about: string;
  };
  banner: {
    enabled: boolean;
    text: string;
    image: string | null;
    ctaText: string | null;
    ctaHref: string | null;
    updatedAt: string;
  };
};
```

- [ ] **Step 3: Eliminar el tipo antiguo ya no usado**

Run: `git rm src/types/seguro.ts`

(Si algún archivo aún lo importa, las tareas siguientes lo corrigen — `IconBadge.tsx` ya no depende de `Seguro["icono"]`.)

- [ ] **Step 4: Verificar que el proyecto compila**

Run: `pnpm exec tsc --noEmit`
Expected: errores únicamente en los archivos que todavía importan `seguros-data.ts`/`constants.ts` con la forma antigua (se resuelven en las tareas 4 y 9-13). Si la única fuente de error son esos imports pendientes, continuar.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: expand icon set and add SiteContent types"
```

---

## Task 4: `content/site.json` migrado + `src/lib/content.ts`

**Files:**
- Create: `content/site.json`
- Create: `src/lib/content.ts`

**Interfaces:**
- Consumes: `SiteContent` desde `@/types/content` (Task 3).
- Produces: `getSiteContent(): SiteContent`, usado por `layout.tsx`, `page.tsx` y todas las secciones públicas.

- [ ] **Step 1: Crear `content/site.json` en la raíz del repo con el contenido real actual migrado**

```json
{
  "hero": {
    "eyebrow": "Agentes de seguros en Dúrcal, Granada",
    "title": "Tu tranquilidad, nuestra prioridad",
    "subtitle": "Décadas acompañando a familias de Dúrcal y la comarca con un trato cercano que ya no es fácil de encontrar. Estudiamos tus necesidades, revisamos tu seguro cada año y te atendemos también fuera de horario en caso de urgencia."
  },
  "aboutUs": {
    "eyebrow": "La familia Izquierdo",
    "heading": "Décadas de confianza, trato de familia",
    "paragraphs": [
      "Somos agentes de seguros, una empresa familiar en Dúrcal (Granada), con décadas de experiencia acompañando a nuestros clientes. En un sector donde cada vez más compañías gestionan pólizas, siniestros y partes de accidente de forma exclusivamente online y automatizada, nosotros seguimos apostando por algo que no pasa de moda: la atención personal.",
      "La familia Izquierdo se caracteriza por su cercanía, su disponibilidad y su compromiso con cada cliente. Atendemos incluso fuera del horario habitual cuando de verdad se nos necesita, porque sabemos que un siniestro o un accidente no avisa. Nuestros clientes valoran, sobre todo, la tranquilidad de tener a una persona de confianza al otro lado del teléfono cuando surge un problema.",
      "Cada año revisamos tus pólizas para intentar mejorar el precio, mantener las mejores condiciones posibles o, al menos, minimizar las subidas — siempre buscando tu beneficio, no el nuestro. Porque nuestro objetivo nunca ha sido solo vender seguros: es construir relaciones duraderas basadas en la confianza, el asesoramiento honesto y el trato personalizado."
    ],
    "stats": [
      { "icon": "cercania", "label": "Trato familiar y cercano" },
      { "icon": "revision", "label": "Revisamos anualmente tu seguro" },
      { "icon": "telefono", "label": "Atención fuera de horario en urgencias" }
    ]
  },
  "whyChooseUs": {
    "heading": "El valor de un trato de confianza",
    "cards": [
      {
        "icon": "revision",
        "title": "Revisamos anualmente tu seguro",
        "description": "Cada año revisamos tu póliza para mejorar el precio o mantener las mejores condiciones, buscando siempre tu beneficio."
      },
      {
        "icon": "telefono",
        "title": "Atención fuera de horario en urgencias",
        "description": "Si tienes una urgencia, te atendemos incluso fuera del horario habitual, porque sabemos que un imprevisto no avisa."
      },
      {
        "icon": "estudio",
        "title": "Estudiamos tus necesidades y ajustamos tus coberturas",
        "description": "Analizamos tu situación para ofrecerte la cobertura justa que necesitas, ni más ni menos."
      },
      {
        "icon": "siniestro",
        "title": "Te acompañamos en cada siniestro",
        "description": "Gestionamos contigo cada parte y cada siniestro, resolviendo tus dudas de forma directa, paso a paso."
      }
    ]
  },
  "seguros": [
    {
      "id": "hogar",
      "title": "Hogar",
      "description": "Protege tu vivienda y tus enseres frente a daños, robo o responsabilidad civil, con la cobertura ajustada a tu casa.",
      "icon": "hogar"
    },
    {
      "id": "auto",
      "title": "Auto y moto",
      "description": "Coberturas a tu medida para coche o moto, con asistencia en carretera y gestión cercana en caso de accidente.",
      "icon": "auto"
    },
    {
      "id": "vida",
      "title": "Vida",
      "description": "Tranquilidad para ti y los tuyos ante cualquier imprevisto, con un asesoramiento honesto sobre la cobertura que necesitas.",
      "icon": "vida"
    },
    {
      "id": "salud",
      "title": "Salud",
      "description": "Acceso a la sanidad privada que mejor se adapta a tu familia, estudiando tus necesidades para ajustar tu cobertura cada año.",
      "icon": "salud"
    },
    {
      "id": "decesos",
      "title": "Decesos",
      "description": "Evita la carga económica y de gestión a tu familia en un momento difícil, con un servicio completo y de confianza.",
      "icon": "decesos"
    }
  ],
  "contact": {
    "phoneLandline": "958 780 348",
    "phoneMobile": "659 518 748",
    "whatsappNumber": "659 518 748",
    "address": "Calle de Balina, 38, Dúrcal (Granada)",
    "email": "info@izquierdoseguros.es"
  },
  "legal": {
    "razonSocial": "",
    "cif": "",
    "dgsfpNumber": ""
  },
  "images": {
    "hero": "/images/hero/hero-familia.jpg",
    "about": "/images/about/equipo-oficina.jpg"
  },
  "banner": {
    "enabled": false,
    "text": "",
    "image": null,
    "ctaText": null,
    "ctaHref": null,
    "updatedAt": "2026-06-24T00:00:00.000Z"
  }
}
```

- [ ] **Step 2: Crear el lector de contenido**

```ts
// src/lib/content.ts
import siteContent from "../../content/site.json";
import type { SiteContent } from "@/types/content";

export function getSiteContent(): SiteContent {
  return siteContent as SiteContent;
}
```

- [ ] **Step 3: Verificar que TypeScript resuelve el import JSON**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos relacionados con `src/lib/content.ts` (los errores restantes son los de componentes aún no migrados, ver tareas 14-19).

- [ ] **Step 4: Commit**

```bash
git add content/site.json src/lib/content.ts
git commit -m "feat: add content/site.json as single source of public content"
```

---

## Task 5: Hashing de contraseña (puro, con test)

**Files:**
- Create: `src/lib/auth.ts`
- Test: `src/lib/auth.test.ts`

**Interfaces:**
- Produces: `hashPassword(password: string): Promise<string>`, `verifyPassword(password: string, stored: string): Promise<boolean>`. Usados por las rutas de login y reset-password (Tasks 11, 12).

- [ ] **Step 1: Escribir el test**

```ts
// src/lib/auth.test.ts
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("hashPassword / verifyPassword", () => {
  it("verifica correctamente la contraseña original", async () => {
    const hash = await hashPassword("mi-contraseña-segura");
    expect(await verifyPassword("mi-contraseña-segura", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("mi-contraseña-segura");
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });

  it("genera hashes distintos para la misma contraseña (salt aleatorio)", async () => {
    const hash1 = await hashPassword("repetida");
    const hash2 = await hashPassword("repetida");
    expect(hash1).not.toBe(hash2);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 3: Implementar**

```ts
// src/lib/auth.ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return derived.length === hash.length && timingSafeEqual(derived, hash);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts
git commit -m "feat: add scrypt-based password hashing"
```

---

## Task 6: Token de sesión firmado (puro, con test, compatible con Edge)

**Files:**
- Create: `src/lib/session.ts`
- Test: `src/lib/session.test.ts`

**Interfaces:**
- Consumes: variable de entorno `SESSION_SECRET`.
- Produces: `createSessionToken(): Promise<string>`, `verifySessionToken(token: string | undefined): Promise<boolean>`, `SESSION_COOKIE_NAME: string`, `SESSION_MAX_AGE: number`. Usados por `middleware.ts`, `require-session.ts` y la ruta de login (Tasks 9, 11).

- [ ] **Step 1: Escribir el test**

```ts
// src/lib/session.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-secret-no-usar-en-produccion";
  vi.useRealTimers();
});

describe("createSessionToken / verifySessionToken", () => {
  it("un token recién creado es válido", async () => {
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rechaza un token manipulado", async () => {
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    const tampered = token.slice(0, -2) + "xx";
    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it("rechaza undefined", async () => {
    const { verifySessionToken } = await import("./session");
    expect(await verifySessionToken(undefined)).toBe(false);
  });

  it("rechaza un token caducado", async () => {
    vi.useFakeTimers();
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000); // +8 dias, TTL es 7
    expect(await verifySessionToken(token)).toBe(false);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './session'`

- [ ] **Step 3: Implementar**

```ts
// src/lib/session.ts
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no configurado");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(padded);
  return new Uint8Array([...str].map((c) => c.charCodeAt(0)));
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const signatureB64 = token.slice(lastDot + 1);
  const match = payload.match(/^admin\.(\d+)$/);
  if (!match) return false;
  const expiresAt = Number(match[1]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  try {
    const key = await getSecretKey();
    const signature = fromBase64Url(signatureB64);
    return await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/session.ts src/lib/session.test.ts
git commit -m "feat: add Edge-compatible signed session tokens"
```

---

## Task 7: Vercel KV + rate limiting (con test mockeado)

**Files:**
- Create: `src/lib/kv.ts`
- Create: `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`

**Interfaces:**
- Produces: `kv` (re-export de `@vercel/kv`) desde `@/lib/kv`; `checkRateLimit(bucket: string, identifier: string): Promise<boolean>` desde `@/lib/rate-limit`. Usados por las rutas de login y forgot-password (Tasks 11, 12).

- [ ] **Step 1: Instalar dependencia**

Run: `pnpm add @vercel/kv`

- [ ] **Step 2: Crear el wrapper**

```ts
// src/lib/kv.ts
import { kv } from "@vercel/kv";

export { kv };
```

- [ ] **Step 3: Escribir el test de rate-limit, mockeando `@/lib/kv`**

```ts
// src/lib/rate-limit.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, number>();

vi.mock("./kv", () => ({
  kv: {
    incr: async (key: string) => {
      const next = (store.get(key) ?? 0) + 1;
      store.set(key, next);
      return next;
    },
    expire: async () => {},
  },
}));

beforeEach(() => {
  store.clear();
});

describe("checkRateLimit", () => {
  it("permite hasta el límite de intentos", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      expect(await checkRateLimit("login", "1.2.3.4")).toBe(true);
    }
  });

  it("bloquea a partir del sexto intento", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("login", "1.2.3.4");
    }
    expect(await checkRateLimit("login", "1.2.3.4")).toBe(false);
  });

  it("no comparte el contador entre identificadores distintos", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("login", "1.2.3.4");
    }
    expect(await checkRateLimit("login", "5.6.7.8")).toBe(true);
  });
});
```

- [ ] **Step 4: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './rate-limit'`

- [ ] **Step 5: Implementar**

```ts
// src/lib/rate-limit.ts
import { kv } from "./kv";

const WINDOW_SECONDS = 600; // 10 minutos
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(bucket: string, identifier: string): Promise<boolean> {
  const key = `ratelimit:${bucket}:${identifier}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS);
  }
  return count <= MAX_ATTEMPTS;
}
```

- [ ] **Step 6: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/kv.ts src/lib/rate-limit.ts src/lib/rate-limit.test.ts
git commit -m "feat: add Vercel KV wrapper and rate limiting"
```

---

## Task 8: Cliente de la API de GitHub Contents

**Files:**
- Create: `src/lib/github.ts`

**Interfaces:**
- Consumes: variable de entorno `GITHUB_TOKEN`.
- Produces: `getFile(path: string): Promise<{ content: string; sha: string }>`, `putFile(path: string, textContent: string, sha: string | undefined, message: string): Promise<{ sha: string }>`, `putFileBase64(path: string, base64Content: string, sha: string | undefined, message: string): Promise<{ sha: string }>`, clase `GithubConflictError`. Usados por las rutas de contenido e imágenes (Tasks 13, 14). No lleva test unitario (depende de red real); se verifica manualmente en la Task 25.

- [ ] **Step 1: Implementar**

```ts
// src/lib/github.ts
const REPO_OWNER = "franci8319";
const REPO_NAME = "izquierdo-seguros";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export class GithubConflictError extends Error {}

function githubHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub getFile failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function putFileBase64(
  path: string,
  base64Content: string,
  sha: string | undefined,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64Content, sha, branch: BRANCH }),
  });
  if (res.status === 409) {
    throw new GithubConflictError(`Conflicto de sha al guardar ${path}`);
  }
  if (!res.ok) {
    throw new Error(`GitHub putFile failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function putFile(
  path: string,
  textContent: string,
  sha: string | undefined,
  message: string
): Promise<{ sha: string }> {
  return putFileBase64(path, Buffer.from(textContent, "utf-8").toString("base64"), sha, message);
}
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos en `src/lib/github.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub Contents API client"
```

---

## Task 9: Middleware de páginas + guard de sesión para API

**Files:**
- Create: `src/lib/require-session.ts`
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `verifySessionToken`, `SESSION_COOKIE_NAME` desde `@/lib/session` (Task 6).
- Produces: `requireSession(request: NextRequest): Promise<NextResponse | null>` (devuelve `null` si hay sesión válida, o una respuesta 401 si no). Usado por todas las rutas de API de Tasks 11-14.

- [ ] **Step 1: Crear el guard de sesión para rutas de API**

```ts
// src/lib/require-session.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function requireSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}
```

- [ ] **Step 2: Crear el middleware que protege las páginas `/admin/**`**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Solo protege las PÁGINAS de /admin (redirige a login).
// Las rutas /api/admin/* validan su propia sesión via requireSession,
// porque deben devolver 401 JSON en vez de redirigir.
export const config = {
  matcher: ["/admin/:path*"],
};

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos en estos dos archivos.

- [ ] **Step 4: Commit**

```bash
git add src/lib/require-session.ts src/middleware.ts
git commit -m "feat: protect /admin pages and add API session guard"
```

---

## Task 10: Rutas de login y logout

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`

**Interfaces:**
- Consumes: `kv` (Task 7), `verifyPassword` (Task 5), `createSessionToken`/`SESSION_COOKIE_NAME`/`SESSION_MAX_AGE` (Task 6), `checkRateLimit` (Task 7).
- Produces: `POST /api/admin/login` (body `{ password: string }` → cookie de sesión), `POST /api/admin/logout` (borra la cookie). Usados por la página de login del panel (Task 21).

- [ ] **Step 1: Implementar login**

```ts
// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit("login", ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const storedHash = await kv.get<string>("admin:passwordHash");
  if (!storedHash || !(await verifyPassword(password, storedHash))) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
```

- [ ] **Step 2: Implementar logout**

```ts
// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos en estas dos rutas.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/login/route.ts src/app/api/admin/logout/route.ts
git commit -m "feat: add admin login and logout API routes"
```

---

## Task 11: Rutas de recuperación de contraseña

**Files:**
- Create: `src/app/api/admin/forgot-password/route.ts`
- Create: `src/app/api/admin/reset-password/route.ts`

**Interfaces:**
- Consumes: `kv` (Task 7), `checkRateLimit` (Task 7), `hashPassword` (Task 5), variables de entorno `RESEND_API_KEY` y `RECOVERY_EMAIL`.
- Produces: `POST /api/admin/forgot-password` (sin body, envía email), `POST /api/admin/reset-password` (body `{ token: string; password: string }`). Usados por las páginas `/admin/login` y `/admin/reset` (Task 21).

- [ ] **Step 1: Instalar dependencia de email**

Run: `pnpm add resend`

- [ ] **Step 2: Implementar forgot-password**

```ts
// src/app/api/admin/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { kv } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit("forgot", ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const token = randomBytes(24).toString("hex");
  await kv.set(`reset:${token}`, { createdAt: Date.now() }, { ex: 60 * 30 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resetUrl = `https://izquierdoseguros.es/admin/reset?token=${token}`;
  await resend.emails.send({
    from: "Izquierdo Seguros <onboarding@resend.dev>",
    to: process.env.RECOVERY_EMAIL as string,
    subject: "Recuperar contraseña del panel",
    html: `<p>Para fijar una nueva contraseña del panel, abre este enlace (caduca en 30 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Implementar reset-password**

```ts
// src/app/api/admin/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;

  if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Datos inválidos. La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const tokenData = await kv.get(`reset:${token}`);
  if (!tokenData) {
    return NextResponse.json({ error: "El enlace ha caducado o no es válido." }, { status: 400 });
  }

  const newHash = await hashPassword(password);
  await kv.set("admin:passwordHash", newHash);
  await kv.del(`reset:${token}`);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos en estas dos rutas.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/app/api/admin/forgot-password/route.ts src/app/api/admin/reset-password/route.ts
git commit -m "feat: add password recovery API routes"
```

---

## Task 12: Rutas de contenido (GET/POST) y subida de imágenes

**Files:**
- Create: `src/app/api/admin/content/route.ts`
- Create: `src/app/api/admin/upload-image/route.ts`

**Interfaces:**
- Consumes: `requireSession` (Task 9), `getFile`/`putFile`/`putFileBase64`/`GithubConflictError` (Task 8).
- Produces: `GET /api/admin/content` → `{ content: SiteContent; sha: string }`; `POST /api/admin/content` (body `{ content, sha }`) → `{ ok: true; sha: string }` o 409 en conflicto; `POST /api/admin/upload-image` (FormData con campo `file`) → `{ ok: true; path: string }`. Usados por el editor del panel (Tasks 22-24).

- [ ] **Step 1: Implementar la ruta de contenido**

```ts
// src/app/api/admin/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile, GithubConflictError } from "@/lib/github";
import { requireSession } from "@/lib/require-session";

const CONTENT_PATH = "content/site.json";

export async function GET(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const { content, sha } = await getFile(CONTENT_PATH);
  return NextResponse.json({ content: JSON.parse(content), sha });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body?.content || typeof body.sha !== "string") {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  try {
    const result = await putFile(
      CONTENT_PATH,
      JSON.stringify(body.content, null, 2),
      body.sha,
      "Actualizar contenido desde el panel admin"
    );
    return NextResponse.json({ ok: true, sha: result.sha });
  } catch (error) {
    if (error instanceof GithubConflictError) {
      return NextResponse.json(
        { error: "Alguien guardó otro cambio mientras editabas. Recarga para ver la última versión." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo guardar el cambio. Inténtalo de nuevo." }, { status: 502 });
  }
}
```

- [ ] **Step 2: Implementar la subida de imágenes**

```ts
// src/app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { putFileBase64 } from "@/lib/github";
import { requireSession } from "@/lib/require-session";

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-").toLowerCase();
  const repoPath = `public/images/uploads/${timestamp}-${safeName}`;
  const publicPath = `/images/uploads/${timestamp}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await putFileBase64(
    repoPath,
    buffer.toString("base64"),
    undefined,
    `Subir imagen ${safeName} desde el panel admin`
  );

  return NextResponse.json({ ok: true, path: publicPath });
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores nuevos en estas dos rutas.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/content/route.ts src/app/api/admin/upload-image/route.ts
git commit -m "feat: add content read/write and image upload API routes"
```

---

## Task 13: Quitar export estático, migrar `layout.tsx`/`page.tsx` y añadir el banner modal

**Files:**
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/BannerModal.tsx`

**Interfaces:**
- Consumes: `getSiteContent` (Task 4).
- Produces: `<BannerModal banner={SiteContent["banner"]} />`, consumido solo por `page.tsx` en esta tarea.

- [ ] **Step 1: Quitar `output: 'export'`**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: Crear el modal de aviso**

```tsx
// src/components/BannerModal.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/types/content";

const STORAGE_KEY = "izquierdo-banner-seen";

export default function BannerModal({ banner }: { banner: SiteContent["banner"] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!banner.enabled) return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (seen !== banner.updatedAt) {
      setOpen(true);
    }
  }, [banner.enabled, banner.updatedAt]);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, banner.updatedAt);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          aria-label="Cerrar aviso"
          onClick={close}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {banner.image && (
          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl">
            <Image src={banner.image} alt="" fill className="object-cover" />
          </div>
        )}
        <p className="pr-6 text-base leading-relaxed text-neutral-800">{banner.text}</p>
        {banner.ctaText && banner.ctaHref && (
          <a
            href={banner.ctaHref}
            onClick={close}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {banner.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Migrar `layout.tsx` para leer el contacto desde el contenido**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { getSiteContent } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://izquierdoseguros.es"),
  title: "Izquierdo Seguros | Agentes de seguros en Dúrcal, Granada",
  description:
    "Agentes de seguros, empresa familiar en Dúrcal (Granada). Décadas de experiencia, trato cercano y asesoramiento personalizado en seguros de hogar, auto, vida, salud y decesos.",
  openGraph: {
    title: "Izquierdo Seguros",
    description:
      "Agentes de seguros, empresa familiar en Dúrcal (Granada). Trato cercano y asesoramiento personalizado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getSiteContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: "Izquierdo Seguros",
    image: "https://izquierdoseguros.es/logos/logo-color.png",
    telephone: content.contact.phoneLandline,
    email: content.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: content.contact.address,
      addressCountry: "ES",
    },
    url: "https://izquierdoseguros.es",
  };

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Migrar `page.tsx` para pasar el contenido a cada sección**

```tsx
// src/app/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import InsuranceProducts from "@/components/sections/InsuranceProducts";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Contact from "@/components/sections/Contact";
import BannerModal from "@/components/BannerModal";
import { getSiteContent } from "@/lib/content";

export default function Home() {
  const content = getSiteContent();

  return (
    <>
      <BannerModal banner={content.banner} />
      <Header contact={content.contact} />
      <main>
        <Hero hero={content.hero} heroImage={content.images.hero} contact={content.contact} />
        <AboutUs aboutUs={content.aboutUs} aboutImage={content.images.about} />
        <InsuranceProducts seguros={content.seguros} />
        <WhyChooseUs whyChooseUs={content.whyChooseUs} />
        <Contact contact={content.contact} />
      </main>
      <Footer contact={content.contact} legal={content.legal} />
    </>
  );
}
```

(Esta tarea deja `Header`, `Hero`, `AboutUs`, `InsuranceProducts`, `WhyChooseUs`, `Contact`, `Footer` con tipos de props nuevos que aún no existen — se implementan en las Tasks 14-16. `pnpm exec tsc --noEmit` mostrará errores de props en esos componentes hasta completarlas; es esperado en este punto.)

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/app/layout.tsx src/app/page.tsx src/components/BannerModal.tsx
git commit -m "feat: switch to hybrid rendering and wire content into page.tsx"
```

---

## Task 14: Migrar `Header` y `MobileNav`

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/MobileNav.tsx`

**Interfaces:**
- Consumes: `SiteContent["contact"]` (Task 3), `toTelHref` (Task 2).
- Produces: `<Header contact={...} />`, `<MobileNav contact={...} />` — ya consumidos por `page.tsx` (Task 13).

- [ ] **Step 1: Migrar `Header.tsx`**

```tsx
// src/components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import CtaButton from "@/components/ui/CtaButton";
import MobileNav from "./MobileNav";
import { toTelHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function Header({ contact }: { contact: SiteContent["contact"] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-white/0"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#hero" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logos/logo-color.png"
            alt="Izquierdo Seguros"
            width={242}
            height={100}
            className="h-14 w-auto sm:h-16"
            priority
          />
        </a>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <CtaButton href={toTelHref(contact.phoneLandline)}>Llamar ahora</CtaButton>
        </div>

        <MobileNav contact={contact} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Migrar `MobileNav.tsx`**

```tsx
// src/components/layout/MobileNav.tsx
"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/nav-links";
import CtaButton from "@/components/ui/CtaButton";
import { toTelHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function MobileNav({ contact }: { contact: SiteContent["contact"] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-0 top-20 z-40 border-t border-neutral-200 bg-white px-6 py-6 shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-neutral-800 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <CtaButton href={toTelHref(contact.phoneLandline)} className="mt-4 w-full">
            Llamar ahora
          </CtaButton>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores en `Header.tsx`/`MobileNav.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/MobileNav.tsx
git commit -m "feat: migrate Header and MobileNav to content props"
```

---

## Task 15: Migrar `Hero` y `AboutUs`

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/AboutUs.tsx`

**Interfaces:**
- Consumes: `SiteContent["hero"]`, `SiteContent["aboutUs"]`, `SiteContent["contact"]` (Task 3), `toTelHref` (Task 2), `IconBadge` (Task 3).
- Produces: `<Hero hero={...} heroImage={...} contact={...} />`, `<AboutUs aboutUs={...} aboutImage={...} />` — ya consumidos por `page.tsx` (Task 13).

- [ ] **Step 1: Migrar `Hero.tsx`**

```tsx
// src/components/sections/Hero.tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import CtaButton from "@/components/ui/CtaButton";
import { toTelHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

type Props = {
  hero: SiteContent["hero"];
  heroImage: string;
  contact: SiteContent["contact"];
};

export default function Hero({ hero, heroImage, contact }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll<HTMLElement>("[data-hero-anim]");

    if (reduceMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12, delay: 0.1 }
    );
  }, []);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative overflow-hidden bg-white pt-32 pb-16 sm:pt-40 sm:pb-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p data-hero-anim className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            {hero.eyebrow}
          </p>
          <h1
            data-hero-anim
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <p data-hero-anim className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            {hero.subtitle}
          </p>
          <div data-hero-anim className="mt-8 flex flex-wrap gap-4">
            <CtaButton href={toTelHref(contact.phoneLandline)}>Llamar ahora</CtaButton>
            <CtaButton href="#seguros" variant="secondary">
              Ver nuestros seguros
            </CtaButton>
          </div>
        </div>

        <div data-hero-anim className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-xl">
          <Image src={heroImage} alt="Vivienda asegurada por Izquierdo Seguros" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />
          <div className="absolute inset-0 bg-brand-700/20 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Migrar `AboutUs.tsx`**

```tsx
// src/components/sections/AboutUs.tsx
import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import type { SiteContent } from "@/types/content";

export default function AboutUs({
  aboutUs,
  aboutImage,
}: {
  aboutUs: SiteContent["aboutUs"];
  aboutImage: string;
}) {
  return (
    <section id="sobre-nosotros" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealOnScroll className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-md">
            <Image src={aboutImage} alt="Oficina de Izquierdo Seguros en Dúrcal" fill className="object-cover" />
          </RevealOnScroll>

          <RevealOnScroll>
            <SectionHeading eyebrow={aboutUs.eyebrow} title={aboutUs.heading} />
            <div className="mt-6 space-y-4">
              {aboutUs.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="text-base leading-relaxed text-neutral-600">
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {aboutUs.stats.map((stat) => (
                <li key={stat.label} className="flex items-start gap-3">
                  <IconBadge icon={stat.icon} size="sm" />
                  <span className="text-sm font-medium text-neutral-800">{stat.label}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores en `Hero.tsx`/`AboutUs.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx src/components/sections/AboutUs.tsx
git commit -m "feat: migrate Hero and AboutUs to content props"
```

---

## Task 16: Migrar `InsuranceProducts`, `WhyChooseUs` y `SeguroCard`

**Files:**
- Modify: `src/components/sections/InsuranceProducts.tsx`
- Modify: `src/components/sections/WhyChooseUs.tsx`
- Modify: `src/components/ui/SeguroCard.tsx`

**Interfaces:**
- Consumes: `SeguroContent`, `WhyChooseUsCard` (Task 3).
- Produces: `<InsuranceProducts seguros={...} />`, `<WhyChooseUs whyChooseUs={...} />` — ya consumidos por `page.tsx` (Task 13).

- [ ] **Step 1: Migrar `SeguroCard.tsx`**

```tsx
// src/components/ui/SeguroCard.tsx
import type { SeguroContent } from "@/types/content";
import IconBadge from "./IconBadge";

export default function SeguroCard({ seguro }: { seguro: SeguroContent }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <IconBadge icon={seguro.icon} />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{seguro.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{seguro.description}</p>
      <a
        href="#contacto"
        className="mt-4 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Pedir información
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Migrar `InsuranceProducts.tsx`**

```tsx
// src/components/sections/InsuranceProducts.tsx
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import SeguroCard from "@/components/ui/SeguroCard";
import type { SeguroContent } from "@/types/content";

export default function InsuranceProducts({ seguros }: { seguros: SeguroContent[] }) {
  return (
    <section id="seguros" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Nuestros seguros"
          title="Seguros pensados para tu día a día"
          description="Estudiamos tus necesidades y revisamos tu póliza cada año para ajustar tu cobertura, con el mismo trato cercano de siempre."
          align="center"
        />

        <RevealOnScroll
          itemsSelector="[data-card]"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {seguros.map((seguro) => (
            <div data-card key={seguro.id}>
              <SeguroCard seguro={seguro} />
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Migrar `WhyChooseUs.tsx`**

```tsx
// src/components/sections/WhyChooseUs.tsx
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import type { SiteContent } from "@/types/content";

export default function WhyChooseUs({ whyChooseUs }: { whyChooseUs: SiteContent["whyChooseUs"] }) {
  return (
    <section id="por-que-elegirnos" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Por qué elegirnos" title={whyChooseUs.heading} align="center" />

        <RevealOnScroll itemsSelector="[data-ventaja]" className="mt-12 grid gap-8 sm:grid-cols-2">
          {whyChooseUs.cards.map((card) => (
            <div data-ventaja key={card.title} className="flex items-start gap-4">
              <IconBadge icon={card.icon} />
              <div>
                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{card.description}</p>
              </div>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores en estos tres archivos.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/InsuranceProducts.tsx src/components/sections/WhyChooseUs.tsx src/components/ui/SeguroCard.tsx
git commit -m "feat: migrate InsuranceProducts, WhyChooseUs and SeguroCard to content props"
```

---

## Task 17: Migrar `Contact` y `Footer`

**Files:**
- Modify: `src/components/sections/Contact.tsx`
- Modify: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `SiteContent["contact"]`, `SiteContent["legal"]` (Task 3), `toTelHref`/`toWhatsappHref` (Task 2).
- Produces: `<Contact contact={...} />`, `<Footer contact={...} legal={...} />` — ya consumidos por `page.tsx` (Task 13).

- [ ] **Step 1: Migrar `Contact.tsx`**

```tsx
// src/components/sections/Contact.tsx
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import CtaButton from "@/components/ui/CtaButton";
import IconBadge from "@/components/ui/IconBadge";
import { toTelHref, toWhatsappHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function Contact({ contact }: { contact: SiteContent["contact"] }) {
  return (
    <section id="contacto" className="bg-brand-900 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos sin compromiso"
          description="Cuéntanos qué necesitas y te asesoramos de forma honesta y directa, como siempre."
          align="center"
          light
        />

        <RevealOnScroll className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <IconBadge icon="telefono" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Teléfono fijo</p>
                <a href={toTelHref(contact.phoneLandline)} className="text-lg font-medium hover:text-white/80">
                  {contact.phoneLandline}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IconBadge icon="telefono" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Móvil y WhatsApp</p>
                <a href={toTelHref(contact.phoneMobile)} className="text-lg font-medium hover:text-white/80">
                  {contact.phoneMobile}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IconBadge icon="cercania" />
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase">Dirección</p>
                <p className="text-lg font-medium">{contact.address}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <CtaButton href={toTelHref(contact.phoneLandline)}>Llamar ahora</CtaButton>
              <CtaButton href={toWhatsappHref(contact.whatsappNumber)} variant="whatsapp">
                Escribir por WhatsApp
              </CtaButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-lg">
            <iframe
              title="Ubicación de Izquierdo Seguros en Dúrcal"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
              className="h-80 w-full border-0 lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Migrar `Footer.tsx`**

```tsx
// src/components/layout/Footer.tsx
import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import { toTelHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function Footer({
  contact,
  legal,
}: {
  contact: SiteContent["contact"];
  legal: SiteContent["legal"];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Image
              src="/logos/logo-blanco.png"
              alt="Izquierdo Seguros"
              width={242}
              height={100}
              className="h-14 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Agentes de seguros, empresa familiar en Dúrcal (Granada). Trato
              cercano, décadas de experiencia.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>{contact.address}</li>
              <li>
                <a href={toTelHref(contact.phoneLandline)} className="hover:text-white">
                  {contact.phoneLandline}
                </a>
              </li>
              <li>
                <a href={toTelHref(contact.phoneMobile)} className="hover:text-white">
                  {contact.phoneMobile} (WhatsApp)
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          <p>© {year} Izquierdo Seguros. Todos los derechos reservados.</p>
          {legal.razonSocial && (
            <p className="mt-1">
              {legal.razonSocial} — CIF {legal.cif} — Nº registro DGSFP {legal.dgsfpNumber}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores en `Contact.tsx`/`Footer.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Contact.tsx src/components/layout/Footer.tsx
git commit -m "feat: migrate Contact and Footer to content props"
```

---

## Task 18: Limpieza de archivos obsoletos y verificación completa de la migración

**Files:**
- Delete: `src/lib/constants.ts`
- Delete: `src/lib/seguros-data.ts`

**Interfaces:**
- No produce ninguna interfaz nueva; verifica que nada del proyecto sigue dependiendo de los archivos eliminados.

- [ ] **Step 1: Confirmar que ya no hay referencias a los ficheros antiguos**

Run: `grep -rn "lib/constants\|lib/seguros-data" src/ --include="*.tsx" --include="*.ts"`
Expected: sin resultados (todas las migraciones de las Tasks 13-17 ya quitaron estos imports).

- [ ] **Step 2: Eliminar los ficheros**

```bash
git rm src/lib/constants.ts src/lib/seguros-data.ts
```

- [ ] **Step 3: Verificar tipos y build completos**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

Run: `pnpm build`
Expected: build correcto (ya sin `output: 'export'`, por lo que ya no se genera `out/`; Next compila las rutas estáticas y las de `/admin`/`/api/admin` como dinámicas).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove constants.ts and seguros-data.ts now superseded by content/site.json"
```

---

## Task 19: Páginas públicas `/admin/login` y `/admin/reset`

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/reset/page.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/login`, `POST /api/admin/forgot-password`, `POST /api/admin/reset-password` (Tasks 10, 11).
- Produces: ninguna interfaz nueva para otras tareas (son los puntos de entrada finales del flujo de auth).

- [ ] **Step 1: Crear la página de login**

```tsx
// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

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
```

- [ ] **Step 2: Crear la página de restablecimiento**

```tsx
// src/app/admin/reset/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

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
      body: JSON.stringify({ token, password }),
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
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </div>
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
```

- [ ] **Step 3: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores en estas dos páginas.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx src/app/admin/reset/page.tsx
git commit -m "feat: add admin login and password reset pages"
```

---

## Task 20: Campos reutilizables, `AdminShell`, página principal del editor, `HeroEditor` y `AboutEditor`

**Files:**
- Create: `src/components/admin/TextField.tsx`
- Create: `src/components/admin/TextAreaField.tsx`
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/components/admin/HeroEditor.tsx`
- Create: `src/components/admin/AboutEditor.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `SiteContent` (Task 3), `GET`/`POST /api/admin/content` (Task 12), `POST /api/admin/logout` (Task 10).
- Produces: `TextField`, `TextAreaField` (reutilizados por las Tasks 21-22); `<AdminShell onSave saving saveError savedAt>` (reutilizado por esta misma página, ya completa en esta tarea); estado `content`/`setContent` en `admin/page.tsx`, al que las Tasks 21-22 añaden más secciones de edición.

- [ ] **Step 1: Crear los campos reutilizables**

```tsx
// src/components/admin/TextField.tsx
export default function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
    </label>
  );
}
```

```tsx
// src/components/admin/TextAreaField.tsx
export default function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
    </label>
  );
}
```

- [ ] **Step 2: Crear `AdminShell`**

```tsx
// src/components/admin/AdminShell.tsx
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
    <div className="min-h-screen bg-neutral-50">
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
      <main className="mx-auto max-w-4xl space-y-10 px-6 py-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Crear `HeroEditor`**

```tsx
// src/components/admin/HeroEditor.tsx
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { SiteContent } from "@/types/content";

export default function HeroEditor({
  hero,
  onChange,
}: {
  hero: SiteContent["hero"];
  onChange: (hero: SiteContent["hero"]) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Portada (Hero)</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Texto pequeño superior"
          value={hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...hero, eyebrow })}
        />
        <TextField label="Titular" value={hero.title} onChange={(title) => onChange({ ...hero, title })} />
        <TextAreaField
          label="Subtítulo"
          value={hero.subtitle}
          onChange={(subtitle) => onChange({ ...hero, subtitle })}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Crear `AboutEditor`**

```tsx
// src/components/admin/AboutEditor.tsx
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { SiteContent } from "@/types/content";

export default function AboutEditor({
  aboutUs,
  onChange,
}: {
  aboutUs: SiteContent["aboutUs"];
  onChange: (aboutUs: SiteContent["aboutUs"]) => void;
}) {
  function updateParagraph(index: number, value: string) {
    const paragraphs = [...aboutUs.paragraphs];
    paragraphs[index] = value;
    onChange({ ...aboutUs, paragraphs });
  }

  function updateStatLabel(index: number, label: string) {
    const stats = aboutUs.stats.map((stat, i) => (i === index ? { ...stat, label } : stat));
    onChange({ ...aboutUs, stats });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Sobre nosotros</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Texto pequeño superior"
          value={aboutUs.eyebrow}
          onChange={(eyebrow) => onChange({ ...aboutUs, eyebrow })}
        />
        <TextField label="Título" value={aboutUs.heading} onChange={(heading) => onChange({ ...aboutUs, heading })} />
        {aboutUs.paragraphs.map((paragraph, index) => (
          <TextAreaField
            key={index}
            label={`Párrafo ${index + 1}`}
            value={paragraph}
            onChange={(value) => updateParagraph(index, value)}
          />
        ))}
        <div>
          <span className="block text-sm font-medium text-neutral-700">Frases destacadas</span>
          <div className="mt-2 space-y-2">
            {aboutUs.stats.map((stat, index) => (
              <input
                key={index}
                type="text"
                value={stat.label}
                onChange={(e) => updateStatLabel(index, e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Crear `src/app/admin/page.tsx`**

```tsx
// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/types/content";
import AdminShell from "@/components/admin/AdminShell";
import HeroEditor from "@/components/admin/HeroEditor";
import AboutEditor from "@/components/admin/AboutEditor";

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
    </AdminShell>
  );
}
```

- [ ] **Step 6: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/TextField.tsx src/components/admin/TextAreaField.tsx src/components/admin/AdminShell.tsx src/components/admin/HeroEditor.tsx src/components/admin/AboutEditor.tsx src/app/admin/page.tsx
git commit -m "feat: add admin editor shell with Hero and AboutUs sections"
```

---

## Task 21: `IconPicker`, `WhyChooseUsEditor` y `SegurosEditor`

**Files:**
- Create: `src/components/admin/IconPicker.tsx`
- Create: `src/components/admin/WhyChooseUsEditor.tsx`
- Create: `src/components/admin/SegurosEditor.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `ICON_OPTIONS`, `IconKey`, `IconBadge` (Task 3), `TextField`/`TextAreaField` (Task 20).
- Produces: `<IconPicker value={IconKey} onChange={(icon: IconKey) => void} />` reutilizado por `SegurosEditor` y `WhyChooseUsEditor`.

- [ ] **Step 1: Crear `IconPicker`**

```tsx
// src/components/admin/IconPicker.tsx
import IconBadge, { ICON_OPTIONS, type IconKey } from "@/components/ui/IconBadge";

export default function IconPicker({
  value,
  onChange,
}: {
  value: IconKey;
  onChange: (icon: IconKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          title={option.label}
          onClick={() => onChange(option.key)}
          className={`rounded-full p-1 ${
            value === option.key ? "ring-2 ring-brand-600" : "ring-1 ring-transparent hover:ring-neutral-300"
          }`}
        >
          <IconBadge icon={option.key} size="sm" />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Crear `WhyChooseUsEditor`**

```tsx
// src/components/admin/WhyChooseUsEditor.tsx
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import IconPicker from "./IconPicker";
import type { SiteContent } from "@/types/content";

export default function WhyChooseUsEditor({
  whyChooseUs,
  onChange,
}: {
  whyChooseUs: SiteContent["whyChooseUs"];
  onChange: (whyChooseUs: SiteContent["whyChooseUs"]) => void;
}) {
  function updateCard(index: number, patch: Partial<SiteContent["whyChooseUs"]["cards"][number]>) {
    const cards = whyChooseUs.cards.map((card, i) => (i === index ? { ...card, ...patch } : card));
    onChange({ ...whyChooseUs, cards });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Por qué elegirnos</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Título de la sección"
          value={whyChooseUs.heading}
          onChange={(heading) => onChange({ ...whyChooseUs, heading })}
        />
        {whyChooseUs.cards.map((card, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <IconPicker value={card.icon} onChange={(icon) => updateCard(index, { icon })} />
            <TextField label="Título" value={card.title} onChange={(title) => updateCard(index, { title })} />
            <TextAreaField
              label="Descripción"
              rows={2}
              value={card.description}
              onChange={(description) => updateCard(index, { description })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Crear `SegurosEditor`**

```tsx
// src/components/admin/SegurosEditor.tsx
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import IconPicker from "./IconPicker";
import type { SeguroContent } from "@/types/content";

export default function SegurosEditor({
  seguros,
  onChange,
}: {
  seguros: SeguroContent[];
  onChange: (seguros: SeguroContent[]) => void;
}) {
  function updateSeguro(index: number, patch: Partial<SeguroContent>) {
    onChange(seguros.map((seguro, i) => (i === index ? { ...seguro, ...patch } : seguro)));
  }

  function addSeguro() {
    onChange([
      ...seguros,
      { id: `seguro-${Date.now()}`, title: "Nuevo seguro", description: "", icon: "hogar" },
    ]);
  }

  function removeSeguro(index: number) {
    onChange(seguros.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Seguros</h2>
        <button type="button" onClick={addSeguro} className="text-sm font-semibold text-brand-600 hover:underline">
          + Añadir seguro
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {seguros.map((seguro, index) => (
          <div key={seguro.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <IconPicker value={seguro.icon} onChange={(icon) => updateSeguro(index, { icon })} />
              <button type="button" onClick={() => removeSeguro(index)} className="text-sm text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
            <TextField label="Título" value={seguro.title} onChange={(title) => updateSeguro(index, { title })} />
            <TextAreaField
              label="Descripción"
              rows={2}
              value={seguro.description}
              onChange={(description) => updateSeguro(index, { description })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Añadir ambas secciones a `src/app/admin/page.tsx`**

En `src/app/admin/page.tsx`, añadir los imports:

```tsx
import WhyChooseUsEditor from "@/components/admin/WhyChooseUsEditor";
import SegurosEditor from "@/components/admin/SegurosEditor";
```

Y dentro de `<AdminShell>`, justo después de `<AboutEditor ... />`, añadir:

```tsx
      <SegurosEditor seguros={content.seguros} onChange={(seguros) => setContent({ ...content, seguros })} />
      <WhyChooseUsEditor
        whyChooseUs={content.whyChooseUs}
        onChange={(whyChooseUs) => setContent({ ...content, whyChooseUs })}
      />
```

- [ ] **Step 5: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/IconPicker.tsx src/components/admin/WhyChooseUsEditor.tsx src/components/admin/SegurosEditor.tsx src/app/admin/page.tsx
git commit -m "feat: add icon picker, seguros editor and why-choose-us editor"
```

---

## Task 22: `ImageUploader`, `ContactLegalEditor`, `BannerEditor` y montaje final del panel

**Files:**
- Create: `src/components/admin/ImageUploader.tsx`
- Create: `src/components/admin/ContactLegalEditor.tsx`
- Create: `src/components/admin/BannerEditor.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `POST /api/admin/upload-image` (Task 12), `TextField`/`TextAreaField` (Task 20).
- Produces: ninguna interfaz nueva para otras tareas — esta tarea completa el editor.

- [ ] **Step 1: Crear `ImageUploader`**

```tsx
// src/components/admin/ImageUploader.tsx
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
```

- [ ] **Step 2: Crear `ContactLegalEditor`**

```tsx
// src/components/admin/ContactLegalEditor.tsx
import TextField from "./TextField";
import type { SiteContent } from "@/types/content";

export default function ContactLegalEditor({
  contact,
  legal,
  onChangeContact,
  onChangeLegal,
}: {
  contact: SiteContent["contact"];
  legal: SiteContent["legal"];
  onChangeContact: (contact: SiteContent["contact"]) => void;
  onChangeLegal: (legal: SiteContent["legal"]) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Contacto y datos legales</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Teléfono fijo"
          value={contact.phoneLandline}
          onChange={(phoneLandline) => onChangeContact({ ...contact, phoneLandline })}
        />
        <TextField
          label="Móvil"
          value={contact.phoneMobile}
          onChange={(phoneMobile) => onChangeContact({ ...contact, phoneMobile })}
        />
        <TextField
          label="Número de WhatsApp"
          value={contact.whatsappNumber}
          onChange={(whatsappNumber) => onChangeContact({ ...contact, whatsappNumber })}
        />
        <TextField
          label="Dirección"
          value={contact.address}
          onChange={(address) => onChangeContact({ ...contact, address })}
        />
        <TextField label="Email" value={contact.email} onChange={(email) => onChangeContact({ ...contact, email })} />
        <hr className="border-neutral-200" />
        <TextField
          label="Razón social"
          value={legal.razonSocial}
          onChange={(razonSocial) => onChangeLegal({ ...legal, razonSocial })}
        />
        <TextField label="CIF" value={legal.cif} onChange={(cif) => onChangeLegal({ ...legal, cif })} />
        <TextField
          label="Nº de registro DGSFP"
          value={legal.dgsfpNumber}
          onChange={(dgsfpNumber) => onChangeLegal({ ...legal, dgsfpNumber })}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Crear `BannerEditor`**

```tsx
// src/components/admin/BannerEditor.tsx
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import ImageUploader from "./ImageUploader";
import type { SiteContent } from "@/types/content";

export default function BannerEditor({
  banner,
  onChange,
}: {
  banner: SiteContent["banner"];
  onChange: (banner: SiteContent["banner"]) => void;
}) {
  function update(patch: Partial<SiteContent["banner"]>) {
    onChange({ ...banner, ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Aviso emergente</h2>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={banner.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
          Activado
        </label>
      </div>
      <div className="mt-4 space-y-4">
        <TextAreaField label="Texto del aviso" rows={3} value={banner.text} onChange={(text) => update({ text })} />
        <ImageUploader label="Imagen (opcional)" value={banner.image} onChange={(image) => update({ image })} />
        <TextField
          label="Texto del botón (opcional)"
          value={banner.ctaText ?? ""}
          onChange={(ctaText) => update({ ctaText: ctaText || null })}
        />
        <TextField
          label="Enlace del botón (opcional, ej. #contacto)"
          value={banner.ctaHref ?? ""}
          onChange={(ctaHref) => update({ ctaHref: ctaHref || null })}
        />
      </div>
    </section>
  );
}
```

Nota: cada cambio en el banner actualiza `updatedAt` — es intencional (cualquier edición invalida el "ya visto" guardado en `localStorage` de los visitantes, como define la spec).

- [ ] **Step 4: Montar las secciones finales en `src/app/admin/page.tsx`**

Añadir los imports:

```tsx
import ImageUploader from "@/components/admin/ImageUploader";
import ContactLegalEditor from "@/components/admin/ContactLegalEditor";
import BannerEditor from "@/components/admin/BannerEditor";
```

Y dentro de `<AdminShell>`, después de `<WhyChooseUsEditor ... />`, añadir:

```tsx
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
        </div>
      </section>

      <ContactLegalEditor
        contact={content.contact}
        legal={content.legal}
        onChangeContact={(contact) => setContent({ ...content, contact })}
        onChangeLegal={(legal) => setContent({ ...content, legal })}
      />

      <BannerEditor banner={content.banner} onChange={(banner) => setContent({ ...content, banner })} />
```

- [ ] **Step 5: Verificar que compila**

Run: `pnpm exec tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/ImageUploader.tsx src/components/admin/ContactLegalEditor.tsx src/components/admin/BannerEditor.tsx src/app/admin/page.tsx
git commit -m "feat: add image uploads, contact/legal editor and banner editor"
```

---

## Task 23: Aprovisionar KV/variables de entorno, fijar contraseña inicial y desplegar

**Files:**
- Create (temporal, no se commitea): `scripts/set-initial-password.mjs`

**Interfaces:** ninguna — tarea de infraestructura y despliegue final.

- [ ] **Step 1: Crear el almacén Vercel KV y enlazarlo al proyecto**

En el dashboard de Vercel → proyecto `izquierdo-seguros` → pestaña Storage → Create Database → KV → conectar al proyecto (todos los entornos). Esto inyecta automáticamente `KV_REST_API_URL`, `KV_REST_API_TOKEN` (y variantes) como variables de entorno del proyecto.

Verificar:

Run: `vercel env ls`
Expected: aparecen `KV_REST_API_URL` y `KV_REST_API_TOKEN` (entre otras) en la lista.

- [ ] **Step 2: Añadir el resto de variables de entorno**

```bash
vercel env add SESSION_SECRET production
# pegar el valor generado con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add GITHUB_TOKEN production
# pegar un fine-grained PAT de GitHub con permiso "Contents: write"
# limitado al repo franci8319/izquierdo-seguros

vercel env add RECOVERY_EMAIL production
# vitoizquierdo@gmail.com

vercel env add RESEND_API_KEY production
# clave de la cuenta de Resend (resend.com), plan gratuito válido para este volumen
```

Repetir cada `vercel env add` también para `preview` y `development` si se quiere probar el flujo completo fuera de producción.

- [ ] **Step 3: Descargar las variables localmente para poder fijar la contraseña inicial**

Run: `vercel env pull .env.local`
Expected: crea `.env.local` con las variables (ya está en `.gitignore` por defecto de `create-next-app`, no se commitea).

- [ ] **Step 4: Crear el script temporal que fija el hash de la contraseña inicial en KV**

```js
// scripts/set-initial-password.mjs
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { kv } from "@vercel/kv";

const scrypt = promisify(scryptCallback);

const password = process.argv[2];
if (!password) {
  console.error("Uso: node --env-file=.env.local scripts/set-initial-password.mjs <contraseña>");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
const hash = `${salt.toString("hex")}:${derived.toString("hex")}`;

await kv.set("admin:passwordHash", hash);
console.log("Contraseña inicial guardada en Vercel KV.");
```

- [ ] **Step 5: Ejecutarlo con una contraseña inicial robusta y borrarlo**

Run: `node --env-file=.env.local scripts/set-initial-password.mjs "<contraseña-inicial-elegida>"`
Expected: `Contraseña inicial guardada en Vercel KV.`

Run: `rm scripts/set-initial-password.mjs`

(Este script nunca se commitea — solo existe en el disco local durante este paso.)

- [ ] **Step 6: Build local final**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: build correcto, sin errores de tipos.

- [ ] **Step 7: Push y despliegue**

```bash
git push
vercel --prod --yes
```

(El push a `master` ya dispara un deploy automático por la integración GitHub→Vercel; `vercel --prod` adicional asegura un deploy inmediato sin esperar el webhook.)

- [ ] **Step 8: Verificación manual en producción (según la spec)**

1. Ir a `https://izquierdoseguros.es/admin` sin sesión → debe redirigir a `/admin/login`.
2. Probar login con contraseña incorrecta varias veces → debe bloquear tras el 6º intento (429).
3. Login con la contraseña inicial correcta → debe entrar al panel y cargar el contenido actual.
4. Pulsar "¿Olvidaste tu contraseña?" → confirmar que llega el email a `vitoizquierdo@gmail.com` con el enlace, que el enlace funciona y que fijar una nueva contraseña permite volver a entrar con ella.
5. Editar el titular del Hero, guardar, esperar ~1 minuto y comprobar en `https://izquierdoseguros.es` que el cambio se ve.
6. Añadir un seguro nuevo con un icono distinto, guardar y comprobar que aparece en la web pública.
7. Subir una imagen nueva para "Sobre nosotros" y comprobar que sustituye a la anterior en la web pública.
8. Activar el banner con texto e imagen, guardar, abrir la web en una ventana de incógnito → debe aparecer el modal una vez; recargar → no debe volver a aparecer; editar el texto del banner y guardar → debe volver a aparecer en una nueva carga.
9. Desactivar el banner, guardar, recargar la web pública → el modal no debe aparecer.
10. Llamar a `POST https://izquierdoseguros.es/api/admin/content` sin cookie de sesión (ej. con `curl`) → debe devolver 401.

- [ ] **Step 9: Commit final de housekeeping si quedara algo pendiente**

Run: `git status --short`
Expected: árbol de trabajo limpio (todo ya commiteado en las tareas anteriores).

