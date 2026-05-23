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
            className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-faint bg-bg-card px-3 py-1.5"
          >
            <input
              type="checkbox"
              name="badges"
              value={b}
              defaultChecked={checked}
              className="h-3 w-3"
            />
            <span className="text-xs">{b}</span>
          </label>
        );
      })}
    </div>
  );
}
