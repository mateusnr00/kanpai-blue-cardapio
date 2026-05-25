"use client";

import { useState } from "react";

type Props = {
  name: string;
  defaultValue: string;
};

const PRESETS: Array<{ label: string; value: string }> = [
  { label: "Azul Kanpai", value: "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)" },
  { label: "Bege quente", value: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)" },
  { label: "Rosê", value: "linear-gradient(135deg, #E8D4D8 0%, #C9A4A8 100%)" },
  { label: "Verde sereno", value: "linear-gradient(135deg, #C8D4C0 0%, #9AAA8E 100%)" },
];

export function GradientInput({ name, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-16 w-full rounded-xl border border-ink-ghost shadow-inner"
        style={{ background: value || "#fff" }}
      />
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        required
        spellCheck={false}
        placeholder="linear-gradient(135deg, #COR1 0%, #COR2 100%)"
        className="admin-input font-mono text-xs"
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => setValue(p.value)} className="admin-btn-secondary text-xs">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
