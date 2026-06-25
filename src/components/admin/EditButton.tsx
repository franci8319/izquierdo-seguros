export default function EditButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-700 shadow-md ring-1 ring-black/5 transition hover:bg-brand-50 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M16.5 3.5 20.5 7.5 8 20H4v-4Z" />
        <path d="M14.5 5.5l4 4" />
      </svg>
    </button>
  );
}
