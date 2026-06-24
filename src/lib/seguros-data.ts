import type { Seguro } from "@/types/seguro";

export const segurosData: Seguro[] = [
  {
    id: "hogar",
    titulo: "Hogar",
    descripcion:
      "Protege tu vivienda y tus enseres frente a daños, robo o responsabilidad civil, con la cobertura ajustada a tu casa.",
    icono: "hogar",
  },
  {
    id: "auto",
    titulo: "Auto y moto",
    descripcion:
      "Coberturas a tu medida para coche o moto, con asistencia en carretera y gestión cercana en caso de accidente.",
    icono: "auto",
  },
  {
    id: "vida",
    titulo: "Vida",
    descripcion:
      "Tranquilidad para ti y los tuyos ante cualquier imprevisto, con un asesoramiento honesto sobre la cobertura que necesitas.",
    icono: "vida",
  },
  {
    id: "salud",
    titulo: "Salud",
    descripcion:
      "Acceso a la sanidad privada que mejor se adapta a tu familia, comparando entre varias aseguradoras para encontrar tu mejor opción.",
    icono: "salud",
  },
  {
    id: "decesos",
    titulo: "Decesos",
    descripcion:
      "Evita la carga económica y de gestión a tu familia en un momento difícil, con un servicio completo y de confianza.",
    icono: "decesos",
  },
];
