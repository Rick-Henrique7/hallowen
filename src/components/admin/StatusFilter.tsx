export type StatusFilterValue = "all" | "pending" | "sent" | "confirmed";

type StatusFilterProps = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
};

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "sent", label: "Enviados" },
  { value: "confirmed", label: "Confirmados" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="status-filter"
        className="font-sans text-xs uppercase tracking-widest text-parchment/60"
      >
        Status
      </label>
      <select
        id="status-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as StatusFilterValue)}
        className="rounded-sm border border-parchment/20 bg-parchment/10 px-3 py-1.5 font-sans text-sm text-parchment focus:border-ember focus:outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-soot">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
