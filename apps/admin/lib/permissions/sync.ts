import "server-only";
import { createAdminClient } from "@/lib/supabase-admin";
import { ROLE_PRESETS } from "./roles";

/**
 * Garante que os cargos-preset e suas permissões existam no banco, a partir de
 * lib/permissions/roles.ts (fonte única de verdade). Idempotente.
 * - roles: upsert (sem apagar cargos extras que o usuário tenha criado).
 * - role_permissions: sincroniza o conjunto exato de cada cargo de sistema.
 * Falha de infra (tabela inexistente) é engolida — o painel segue em grandfather.
 */
export async function ensureRolesSeeded(): Promise<void> {
  try {
    const admin = createAdminClient();

    // 1. Upsert dos cargos.
    const roleRows = ROLE_PRESETS.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      is_owner: !!r.isOwner,
      is_system: r.system,
    }));
    const { error: upsertErr } = await admin.from("roles").upsert(roleRows, { onConflict: "slug" });
    if (upsertErr) return; // tabela provavelmente não existe ainda

    // 2. Sincroniza role_permissions de cada cargo de sistema.
    for (const preset of ROLE_PRESETS) {
      // owner não precisa de linhas: o resolvedor concede tudo por is_owner.
      if (preset.isOwner) continue;
      const desired = new Set<string>(preset.permissions);

      const { data: existing } = await admin
        .from("role_permissions")
        .select("permission_key")
        .eq("role_slug", preset.slug);
      const have = new Set((existing ?? []).map((r) => r.permission_key));

      const toAdd = [...desired].filter((k) => !have.has(k)).map((k) => ({ role_slug: preset.slug, permission_key: k }));
      const toRemove = [...have].filter((k) => !desired.has(k));

      if (toAdd.length) await admin.from("role_permissions").insert(toAdd);
      if (toRemove.length) {
        await admin
          .from("role_permissions")
          .delete()
          .eq("role_slug", preset.slug)
          .in("permission_key", toRemove);
      }
    }
  } catch {
    // silencioso — grandfather garante acesso enquanto não migrado.
  }
}
