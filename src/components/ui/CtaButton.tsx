import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "whatsapp";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600",
  secondary:
    "bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 focus-visible:ring-brand-600",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1ebe5b] focus-visible:ring-[#25D366]",
};

type Props = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<typeof Link>, "href">;

export default function CtaButton({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-base ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
