import { toWhatsappHref } from "@/lib/phone";
import type { SiteContent } from "@/types/content";

export default function WhatsappFloatingButton({ contact }: { contact: SiteContent["contact"] }) {
  return (
    <a
      href={toWhatsappHref(contact.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.732-.866-2.866-1.547-4.005-3.504-.302-.521.302-.484.864-1.61.095-.198.048-.371-.05-.52-.099-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.057 3.146 4.99 4.288 2.932 1.143 2.932.762 3.46.713.529-.05 1.758-.718 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.012 2c-5.514 0-9.988 4.474-9.988 9.988 0 1.763.462 3.42 1.27 4.86L2 22l5.275-1.276a9.93 9.93 0 0 0 4.737 1.207h.004c5.514 0 9.987-4.473 9.987-9.987C21.999 6.474 17.526 2 12.012 2zm0 18.18a8.18 8.18 0 0 1-4.166-1.137l-.299-.177-3.13.757.757-3.156-.193-.31a8.166 8.166 0 0 1-1.249-4.345c0-4.516 3.674-8.19 8.184-8.19 4.51 0 8.183 3.674 8.183 8.19 0 4.516-3.673 8.19-8.183 8.19z" />
      </svg>
    </a>
  );
}
