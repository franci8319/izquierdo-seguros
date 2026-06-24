"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function RevealOnScroll({
  children,
  className = "",
  itemsSelector,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  itemsSelector?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { itemsSelector, delay });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
