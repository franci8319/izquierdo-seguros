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
    schedule: string;
  };
  legal: {
    razonSocial: string;
    cif: string;
    dgsfpNumber: string;
  };
  images: {
    hero: string;
    about: string;
    segurosBackgroundDesktop: string | null;
    segurosBackgroundMobile: string | null;
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
