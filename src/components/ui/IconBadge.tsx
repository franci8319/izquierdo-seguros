import type { Seguro } from "@/types/seguro";

type IconName = Seguro["icono"] | "telefono" | "comparar" | "cercania" | "siniestro";

const paths: Record<IconName, React.ReactNode> = {
  hogar: (
    <path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" />
  ),
  auto: (
    <path d="M5 16.5h14M6 16.5V12l1.8-4.2a2 2 0 0 1 1.84-1.3h4.72a2 2 0 0 1 1.84 1.3L18 12v4.5M6 16.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0Zm8.5 0a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 1 0-3.5 0ZM6 12h12" />
  ),
  vida: (
    <path d="M12 20s-7-4.35-9.2-8.6C1.4 8.6 2.9 5.5 6 5.5c2 0 3.3 1.1 4 2.3.7-1.2 2-2.3 4-2.3 3.1 0 4.6 3.1 3.2 5.9C19 15.65 12 20 12 20Z" />
  ),
  salud: (
    <>
      <path d="M9 3.5h6v6h6v6h-6v6H9v-6H3v-6h6Z" />
    </>
  ),
  decesos: (
    <>
      <path d="M12 3c1.6 1.9 1.6 3.4 0 5-1.6-1.6-1.6-3.1 0-5Z" />
      <path d="M9.5 9h5v10.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V9Z" />
      <path d="M7 21h10" />
    </>
  ),
  telefono: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />
  ),
  comparar: <path d="M7 4v16M17 4v16M3 9h8M13 15h8" />,
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
  icon: IconName;
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
