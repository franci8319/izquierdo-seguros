"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Options = {
  /** Selector de los hijos directos a animar en cascada. Si se omite, anima el propio elemento. */
  itemsSelector?: string;
  delay?: number;
  distance?: number;
};

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  { itemsSelector, delay = 0, distance = 20 }: Options = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = itemsSelector
      ? Array.from(el.querySelectorAll(itemsSelector))
      : [el];

    if (reduceMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: distance },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay,
        stagger: targets.length > 1 ? 0.1 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, itemsSelector, delay, distance]);
}
