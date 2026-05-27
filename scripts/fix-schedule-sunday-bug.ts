/**
 * Limpa items com schedule_off_days = [0] que foram salvos sem o usuario
 * ter marcado Domingo (bug do parseScheduleFromForm: Number("") === 0).
 *
 * Heuristica: qualquer prato/categoria que tenha SOMENTE [0] em
 * schedule_off_days E sem data de inicio/fim provavelmente nao quis
 * marcar nada — vamos zerar pra array vazio.
 *
 * Se o usuario marcou Dom de propósito, ele provavelmente tambem definiu
 * data ou marcou outros dias junto. Esse caso preserva.
 */

import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  for (const table of ["categories", "dishes"] as const) {
    // Pega tudo, filtra em memoria pra ser explicito
    const { data, error } = await supabase
      .from(table)
      .select("id, schedule_start, schedule_end, schedule_off_days");
    if (error) throw error;

    const targets = (data ?? []).filter((row) => {
      const offDays = row.schedule_off_days as number[] | null;
      return (
        Array.isArray(offDays) &&
        offDays.length === 1 &&
        offDays[0] === 0 &&
        !row.schedule_start &&
        !row.schedule_end
      );
    });

    console.log(`${table}: ${targets.length} linhas com [0] suspeito (sem datas)`);

    for (const row of targets) {
      const { error: upErr } = await supabase
        .from(table)
        .update({ schedule_off_days: [] })
        .eq("id", row.id);
      if (upErr) console.warn(`  ! ${row.id}: ${upErr.message}`);
    }
    if (targets.length > 0) {
      console.log(`  ${targets.length} corrigidas pra []`);
    }
  }

  console.log("\nFeito.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
