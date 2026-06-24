import IconBadge, { ICON_OPTIONS, type IconKey } from "@/components/ui/IconBadge";

export default function IconPicker({
  value,
  onChange,
}: {
  value: IconKey;
  onChange: (icon: IconKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          title={option.label}
          onClick={() => onChange(option.key)}
          className={`rounded-full p-1 ${
            value === option.key ? "ring-2 ring-brand-600" : "ring-1 ring-transparent hover:ring-neutral-300"
          }`}
        >
          <IconBadge icon={option.key} size="sm" />
        </button>
      ))}
    </div>
  );
}
