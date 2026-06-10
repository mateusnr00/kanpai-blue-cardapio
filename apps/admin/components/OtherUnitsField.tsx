"use client";

type Unit = { id: string; shortName: string };

/**
 * Campo opcional pra criar o mesmo item/categoria em outras unidades de uma vez.
 * Renderiza um checkbox por unidade (name="also_unit"). A lógica de duplicação
 * fica no server action (createDish / createCategory).
 */
export function OtherUnitsField({
  units,
  kind,
}: {
  units: Unit[];
  kind: "prato" | "categoria";
}) {
  if (units.length === 0) return null;
  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Criar também em outras unidades
      </legend>
      <p className="mb-3 text-xs text-ink-soft">
        {kind === "prato"
          ? "Cria uma cópia nas unidades marcadas, na categoria de mesmo nome. Se essa categoria não existir na outra unidade, ela é ignorada."
          : "Cria uma cópia desta categoria nas unidades marcadas (quando ainda não existir uma com o mesmo nome lá)."}
      </p>
      <div className="flex flex-wrap gap-4">
        {units.map((u) => (
          <label key={u.id} className="inline-flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="also_unit"
              value={u.id}
              className="h-4 w-4 rounded border-ink-ghost text-accent focus:ring-accent/30"
            />
            {u.shortName}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
