import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import type { SiteContent } from "@/types/content";

export default function ContactLegalEditor({
  contact,
  legal,
  onChangeContact,
  onChangeLegal,
}: {
  contact: SiteContent["contact"];
  legal: SiteContent["legal"];
  onChangeContact: (contact: SiteContent["contact"]) => void;
  onChangeLegal: (legal: SiteContent["legal"]) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Contacto y datos legales</h2>
      <div className="mt-4 space-y-4">
        <TextField
          label="Teléfono fijo"
          value={contact.phoneLandline}
          onChange={(phoneLandline) => onChangeContact({ ...contact, phoneLandline })}
        />
        <TextField
          label="Móvil"
          value={contact.phoneMobile}
          onChange={(phoneMobile) => onChangeContact({ ...contact, phoneMobile })}
        />
        <TextField
          label="Número de WhatsApp"
          value={contact.whatsappNumber}
          onChange={(whatsappNumber) => onChangeContact({ ...contact, whatsappNumber })}
        />
        <TextField
          label="Dirección"
          value={contact.address}
          onChange={(address) => onChangeContact({ ...contact, address })}
        />
        <TextField label="Email" value={contact.email} onChange={(email) => onChangeContact({ ...contact, email })} />
        <TextAreaField
          label="Horario de oficina"
          rows={3}
          value={contact.schedule}
          onChange={(schedule) => onChangeContact({ ...contact, schedule })}
        />
        <hr className="border-neutral-200" />
        <TextField
          label="Razón social"
          value={legal.razonSocial}
          onChange={(razonSocial) => onChangeLegal({ ...legal, razonSocial })}
        />
        <TextField label="CIF" value={legal.cif} onChange={(cif) => onChangeLegal({ ...legal, cif })} />
        <TextField
          label="Nº de registro DGSFP"
          value={legal.dgsfpNumber}
          onChange={(dgsfpNumber) => onChangeLegal({ ...legal, dgsfpNumber })}
        />
      </div>
    </section>
  );
}
