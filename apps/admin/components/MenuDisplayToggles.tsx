"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleDisplayFlag, type DisplayFlag } from "@/app/(protected)/cards/display-actions";

type Props = {
  initial: Record<DisplayFlag, boolean>;
};

const ITEMS: Array<{
  flag: DisplayFlag;
  label: string;
  hint: string;
}> = [
  {
    flag: "show_category_eyebrow",
    label: 'Mostrar "Categoria 01" acima do nome',
    hint: 'Pequeno texto cinza em caixa-alta logo acima do título da categoria.',
  },
  {
    flag: "show_category_subtitle",
    label: "Mostrar subtítulo da categoria",
    hint: 'Linha abaixo do título com itemCount + detalhe (ex.: "2 menus, principal experiência da casa").',
  },
  {
    flag: "show_home_footer_count",
    label: 'Mostrar "03 categorias" no rodapé da home',
    hint: "Contador no canto direito do rodapé da home do restaurante.",
  },
  {
    flag: "show_category_footer_count",
    label: 'Mostrar "X pratos" no rodapé da categoria',
    hint: "Contador no canto direito do rodapé de cada página de categoria.",
  },
  {
    flag: "show_category_footer_position",
    label: 'Mostrar "17 / 03" no rodapé da categoria',
    hint: "Número da categoria atual / total no canto esquerdo do rodapé.",
  },
];

export function MenuDisplayToggles({ initial }: Props) {
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onToggle(flag: DisplayFlag, next: boolean) {
    const prev = values[flag];
    setValues((v) => ({ ...v, [flag]: next }));
    startTransition(async () => {
      const res = await toggleDisplayFlag(flag, next);
      if (res?.error) {
        setValues((v) => ({ ...v, [flag]: prev }));
        toast.error(res.error);
      } else {
        toast.success(next ? "Visível no site" : "Oculto no site");
      }
    });
  }

  return (
    <div className="admin-card flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-sm font-semibold text-ink">Aparência do cardápio</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Liga/desliga elementos do site público desta unidade. Salva ao clicar.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-ink-ghost/60">
        {ITEMS.map((it) => (
          <li key={it.flag} className="flex items-start gap-4 py-3 first:pt-1 last:pb-1">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{it.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{it.hint}</p>
            </div>
            <Switch
              checked={values[it.flag]}
              disabled={pending}
              onChange={(v) => onToggle(it.flag, v)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-ink" : "bg-ink-ghost"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
