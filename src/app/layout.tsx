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
      addressLocality: "Dúrcal",
      addressRegion: "Granada",
      postalCode: "18650",
      addressCountry: "ES",
    },
    areaServed: "Dúrcal y comarca (Granada)",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "14:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "16:30",
        closes: "19:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "14:00",
      },
    ],
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
