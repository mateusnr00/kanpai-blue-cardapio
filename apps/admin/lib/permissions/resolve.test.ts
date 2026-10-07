import { describe, it, expect } from "vitest";
import { can, sourceOf, isActive, type Membership } from "./resolve";
import { PERMISSIONS } from "./catalog";

const P = PERMISSIONS;

/** Helper pra montar um membership de cargo com overrides. */
function member(
  rolePermissions: string[],
  overrides: Record<string, "allow" | "deny"> = {},
  opts: { status?: "active" | "disabled"; isOwner?: boolean } = {},
): Membership {
  return {
    status: opts.status ?? "active",
    isOwner: opts.isOwner ?? false,
    rolePermissions,
    overrides,
  };
}

describe("resolvedor de permissões", () => {
  it("permissão básica: cargo tem update → edita descrição", () => {
    const m = member([P.MENU_ITEM_UPDATE]);
    expect(can(P.MENU_ITEM_UPDATE, m)).toBe(true);
    expect(sourceOf(P.MENU_ITEM_UPDATE, m)).toBe("role");
  });

  it("preço bloqueado: tem update mas não tem price → preço negado", () => {
    const m = member([P.MENU_ITEM_UPDATE]);
    expect(can(P.MENU_ITEM_UPDATE, m)).toBe(true);
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(false);
    expect(sourceOf(P.MENU_ITEM_PRICE_UPDATE, m)).toBe("default_deny");
  });

  it("herança: cargo Gerente possui a permissão → permitido", () => {
    const m = member([P.MENU_ITEM_PRICE_UPDATE]);
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(true);
  });

  it("allow individual: cargo não tem, usuário recebe ALLOW → permitido", () => {
    const m = member([], { [P.MENU_ITEM_PRICE_UPDATE]: "allow" });
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(true);
    expect(sourceOf(P.MENU_ITEM_PRICE_UPDATE, m)).toBe("override_allow");
  });

  it("deny individual: cargo tem, usuário recebe DENY → negado (DENY vence)", () => {
    const m = member([P.MENU_ITEM_PRICE_UPDATE], { [P.MENU_ITEM_PRICE_UPDATE]: "deny" });
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(false);
    expect(sourceOf(P.MENU_ITEM_PRICE_UPDATE, m)).toBe("override_deny");
  });

  it("default deny: sem cargo e sem override → negado", () => {
    const m = member([]);
    expect(can(P.STAFF_REMOVE, m)).toBe(false);
    expect(sourceOf(P.STAFF_REMOVE, m)).toBe("default_deny");
  });

  it("funcionário desativado: nega tudo, mesmo com permissão no cargo", () => {
    const m = member([P.MENU_ITEM_UPDATE], {}, { status: "disabled" });
    expect(can(P.MENU_ITEM_UPDATE, m)).toBe(false);
    expect(isActive(m)).toBe(false);
    expect(sourceOf(P.MENU_ITEM_UPDATE, m)).toBe("disabled");
  });

  it("owner ativo: permite tudo", () => {
    const m = member([], {}, { isOwner: true });
    expect(can(P.STAFF_REMOVE, m)).toBe(true);
    expect(can(P.INTEGRATIONS_UPDATE, m)).toBe(true);
    expect(sourceOf(P.STAFF_REMOVE, m)).toBe("owner");
  });

  it("owner desativado: suspenso vence o owner → nega tudo", () => {
    const m = member([], {}, { isOwner: true, status: "disabled" });
    expect(can(P.STAFF_REMOVE, m)).toBe(false);
  });

  it("grandfather: admin legado (sem vínculo) → acesso total", () => {
    const m: Membership = null;
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(true);
    expect(can(P.STAFF_REMOVE, m)).toBe(true);
    expect(isActive(m)).toBe(true);
    expect(sourceOf(P.MENU_ITEM_PRICE_UPDATE, m)).toBe("legacy");
  });

  it("DENY vence ALLOW no mesmo override é impossível (1 efeito por key), mas DENY individual vence cargo", () => {
    const m = member([P.MENU_ITEM_UPDATE, P.MENU_ITEM_PRICE_UPDATE], {
      [P.MENU_ITEM_PRICE_UPDATE]: "deny",
    });
    expect(can(P.MENU_ITEM_UPDATE, m)).toBe(true);
    expect(can(P.MENU_ITEM_PRICE_UPDATE, m)).toBe(false);
  });
});
