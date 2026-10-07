// ============================================================================
// CARGOS PADRÃO (presets) · Kanpai Blue
// ----------------------------------------------------------------------------
// Cada cargo é só um CONJUNTO PADRÃO de permissões. A autorização real é por
// permissão (hasPermission), nunca por `role === "..."`. Personalizações ficam
// nos overrides individuais, por cima do cargo.
//
// Só inclui cargos que fazem sentido pros módulos que existem hoje. Cargos como
// "Financeiro", "Atendimento (reservas/pedidos)", "Bar", "Cozinha (pedidos)"
// dependem de módulos inexistentes — ficam como pendência, não como preset vazio.
// ============================================================================

import { PERMISSIONS, ALL_PERMISSION_KEYS, type PermissionKey } from "./catalog";

export type RolePreset = {
  slug: string;
  name: string;
  description: string;
  /** Proprietário/admin: acesso total, cargo protegido (não editável/removível). */
  isOwner?: boolean;
  /** Cargo de sistema: não pode ser excluído. */
  system: boolean;
  /** Permissões herdadas. Para o owner, é "tudo" (resolvido em runtime). */
  permissions: PermissionKey[];
};

const P = PERMISSIONS;

export const ROLE_PRESETS: RolePreset[] = [
  {
    slug: "owner",
    name: "Proprietário",
    description: "Acesso total ao painel. Cargo protegido.",
    isOwner: true,
    system: true,
    permissions: [...ALL_PERMISSION_KEYS],
  },
  {
    slug: "manager",
    name: "Gerente",
    description: "Operação ampla: cardápio, categorias, relacionamento e conteúdo. Sem alterar a equipe nem integrações.",
    system: true,
    permissions: [
      P.MENU_VIEW, P.MENU_ITEM_CREATE, P.MENU_ITEM_UPDATE, P.MENU_ITEM_PRICE_UPDATE,
      P.MENU_ITEM_IMAGE_UPDATE, P.MENU_ITEM_STATUS, P.MENU_ITEM_REORDER,
      P.MENU_ITEM_COMPONENTS_UPDATE, P.MENU_ITEM_DELETE,
      P.MENU_CATEGORY_CREATE, P.MENU_CATEGORY_UPDATE, P.MENU_CATEGORY_REORDER,
      P.MENU_CATEGORY_STATUS, P.MENU_CATEGORY_DELETE,
      P.ANNOUNCEMENT_UPDATE, P.LINKTREE_UPDATE, P.QRCODE_MANAGE,
      P.REVIEWS_VIEW, P.REVIEWS_MANAGE, P.CUSTOMERS_VIEW, P.CUSTOMERS_EXPORT,
      P.ANALYTICS_VIEW, P.STAFF_VIEW, P.AUDIT_VIEW,
    ],
  },
  {
    slug: "menu_manager",
    name: "Responsável pelo cardápio",
    description: "Cuida do cardápio: produtos, categorias, fotos e disponibilidade. Preço é opcional (ajuste individual).",
    system: true,
    permissions: [
      P.MENU_VIEW, P.MENU_ITEM_CREATE, P.MENU_ITEM_UPDATE, P.MENU_ITEM_IMAGE_UPDATE,
      P.MENU_ITEM_STATUS, P.MENU_ITEM_REORDER, P.MENU_ITEM_COMPONENTS_UPDATE,
      P.MENU_CATEGORY_CREATE, P.MENU_CATEGORY_UPDATE, P.MENU_CATEGORY_REORDER,
      P.MENU_CATEGORY_STATUS,
      // Sem MENU_ITEM_PRICE_UPDATE por padrão · sem excluir · sem financeiro.
    ],
  },
  {
    slug: "kitchen",
    name: "Cozinha",
    description: "Marca produtos como disponíveis ou indisponíveis durante o serviço. Sem editar preços nem configurações.",
    system: true,
    permissions: [P.MENU_VIEW, P.MENU_ITEM_STATUS],
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Conteúdo e divulgação: avisos, linktree, QR Codes e base de clientes. Sem mexer no cardápio.",
    system: true,
    permissions: [
      P.ANNOUNCEMENT_UPDATE, P.LINKTREE_UPDATE, P.QRCODE_MANAGE,
      P.CUSTOMERS_VIEW, P.CUSTOMERS_EXPORT, P.ANALYTICS_VIEW, P.REVIEWS_VIEW,
    ],
  },
  {
    slug: "relationship",
    name: "Atendimento",
    description: "Cuida do relacionamento: avaliações e base de clientes. Sem acesso ao cardápio ou configurações.",
    system: true,
    permissions: [P.REVIEWS_VIEW, P.REVIEWS_MANAGE, P.CUSTOMERS_VIEW],
  },
  {
    slug: "viewer",
    name: "Visualizador",
    description: "Somente leitura das áreas concedidas. Não modifica nada.",
    system: true,
    permissions: [P.MENU_VIEW, P.REVIEWS_VIEW, P.CUSTOMERS_VIEW, P.ANALYTICS_VIEW, P.AUDIT_VIEW],
  },
];

export const ROLE_BY_SLUG = new Map(ROLE_PRESETS.map((r) => [r.slug, r]));
