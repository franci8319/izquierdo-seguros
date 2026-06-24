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
