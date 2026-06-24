export function toTelHref(displayNumber: string): string {
  return `tel:+34${displayNumber.replace(/\s+/g, "")}`;
}

export function toWhatsappHref(displayNumber: string): string {
  return `https://wa.me/34${displayNumber.replace(/\s+/g, "")}`;
}
