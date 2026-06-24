"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import { business } from "@/lib/constants";
import CtaButton from "@/components/ui/CtaButton";
import MobileNav from "./MobileNav";

export default function Header() {
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
          <CtaButton href={business.phone.landlineHref}>Llamar ahora</CtaButton>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
