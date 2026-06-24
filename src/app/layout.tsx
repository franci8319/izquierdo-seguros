import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { business } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  name: business.name,
  image: "https://izquierdoseguros.es/logos/logo-color.png",
  telephone: business.phone.landline,
  email: business.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.province,
    addressCountry: "ES",
  },
  url: "https://izquierdoseguros.es",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://izquierdoseguros.es"),
  title: "Izquierdo Seguros | Correduría de seguros en Dúrcal, Granada",
  description:
    "Correduría de seguros familiar en Dúrcal (Granada). Décadas de experiencia, trato cercano y asesoramiento personalizado en seguros de hogar, auto, vida, salud y decesos.",
  openGraph: {
    title: "Izquierdo Seguros",
    description:
      "Correduría de seguros familiar en Dúrcal (Granada). Trato cercano y asesoramiento personalizado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
