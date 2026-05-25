"use client";

const BADGES = [
  "Vegetariano",
  "Frutos do mar",
  "Contém leite",
  "Contém glúten",
  "Uva",
  "Picante",
  "Com álcool",
  "Sem álcool",
  "Não compartilhável",
];

type Props = {
  initial: string[];
};

export function BadgeCheckboxes({ initial }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.map((b) => {
        const checked = initial.includes(b);
        return (
          <label
            key={b}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              checked
                ? "border-accent bg-accent-soft text-accent"
                : "border-ink-ghost bg-bg-surface text-ink-secondary hover:border-ink-faint"
            }`}
          >
            <input
              type="checkbox"
              name="badges"
              value={b}
              defaultChecked={checked}
              className="h-3.5 w-3.5 rounded border-ink-ghost text-accent focus:ring-accent/30"
            />
            <span>{b}</span>
          </label>
        );
      })}
    </div>
  );
}
