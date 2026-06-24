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
