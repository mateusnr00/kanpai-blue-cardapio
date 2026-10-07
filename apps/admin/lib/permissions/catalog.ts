// ============================================================================
// CATÁLOGO DE PERMISSÕES · Kanpai Blue admin
// ----------------------------------------------------------------------------
// Fonte única de verdade das permission keys. Nada de strings soltas pelo
// projeto. Só cobre MÓDULOS QUE EXISTEM hoje no painel — reservas, pedidos,
// delivery, financeiro, estoque etc. NÃO entram porque esses módulos não
// existem (entram como pendência no relatório, não como código fantasma).
//
// Cada permissão tem label + descrição HUMANA. A UI nunca mostra a key crua
// (ex.: "menu.item.price.update") — mostra "Alterar preços".
// ============================================================================

export const PERMISSIONS = {
  // Cardápio · produtos
  MENU_VIEW: "menu.view",
  MENU_ITEM_CREATE: "menu.item.create",
  MENU_ITEM_UPDATE: "menu.item.update",
  MENU_ITEM_PRICE_UPDATE: "menu.item.price.update",
  MENU_ITEM_IMAGE_UPDATE: "menu.item.image.update",
  MENU_ITEM_STATUS: "menu.item.status",
  MENU_ITEM_REORDER: "menu.item.reorder",
  MENU_ITEM_DELETE: "menu.item.delete",
  MENU_ITEM_COMPONENTS_UPDATE: "menu.item.components.update",

  // Cardápio · categorias
  MENU_CATEGORY_CREATE: "menu.category.create",
  MENU_CATEGORY_UPDATE: "menu.category.update",
  MENU_CATEGORY_REORDER: "menu.category.reorder",
  MENU_CATEGORY_STATUS: "menu.category.status",
  MENU_CATEGORY_DELETE: "menu.category.delete",

  // Avisos
  ANNOUNCEMENT_UPDATE: "announcement.update",

  // Linktree & QR Codes
  LINKTREE_UPDATE: "linktree.update",
  QRCODE_MANAGE: "qrcode.manage",

  // Relacionamento
  REVIEWS_VIEW: "reviews.view",
  REVIEWS_MANAGE: "reviews.manage",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_EXPORT: "customers.export",

  // Crescimento (analytics, comportamento, curtidas — só leitura)
  ANALYTICS_VIEW: "analytics.view",

  // Configurações & integrações (pixels)
  SETTINGS_UPDATE: "settings.update",
  INTEGRATIONS_UPDATE: "integrations.update",

  // Equipe
  STAFF_VIEW: "staff.view",
  STAFF_INVITE: "staff.invite",
  STAFF_UPDATE: "staff.update",
  STAFF_ROLE_UPDATE: "staff.role.update",
  STAFF_PERMISSION_UPDATE: "staff.permission.update",
  STAFF_DISABLE: "staff.disable",
  STAFF_REMOVE: "staff.remove",

  // Auditoria
  AUDIT_VIEW: "audit.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type PermissionDef = {
  key: PermissionKey;
  label: string;
  description: string;
  /** Marca ações sensíveis → exigem confirmação na UI e são sempre auditadas. */
  sensitive?: boolean;
};

export type PermissionModule = {
  slug: string;
  /** Nome humano do módulo (como aparece no editor). */
  label: string;
  /** Rota principal do módulo no admin (pra route guards). */
  href: string;
  permissions: PermissionDef[];
};

// ----------------------------------------------------------------------------
// Agrupamento por MÓDULO — é como o editor de permissões se organiza.
// ----------------------------------------------------------------------------
export const PERMISSION_MODULES: PermissionModule[] = [
  {
    slug: "menu",
    label: "Cardápio",
    href: "/",
    permissions: [
      { key: PERMISSIONS.MENU_VIEW, label: "Ver cardápio", description: "Visualizar produtos e categorias no painel." },
      { key: PERMISSIONS.MENU_ITEM_CREATE, label: "Criar produtos", description: "Adicionar novos itens ao cardápio." },
      { key: PERMISSIONS.MENU_ITEM_UPDATE, label: "Editar produtos", description: "Alterar nome, descrição e informações — exceto o preço." },
      { key: PERMISSIONS.MENU_ITEM_PRICE_UPDATE, label: "Alterar preços", description: "Modificar o preço dos produtos.", sensitive: true },
      { key: PERMISSIONS.MENU_ITEM_IMAGE_UPDATE, label: "Alterar imagens", description: "Adicionar, trocar ou remover fotos dos produtos." },
      { key: PERMISSIONS.MENU_ITEM_STATUS, label: "Alterar disponibilidade", description: "Marcar produtos como disponíveis ou indisponíveis." },
      { key: PERMISSIONS.MENU_ITEM_REORDER, label: "Reordenar produtos", description: "Mudar a ordem dos itens dentro da categoria." },
      { key: PERMISSIONS.MENU_ITEM_COMPONENTS_UPDATE, label: "Montar menus e combinados", description: "Vincular entradas, principais e sobremesas dentro de um menu." },
      { key: PERMISSIONS.MENU_ITEM_DELETE, label: "Excluir produtos", description: "Remover itens do cardápio permanentemente.", sensitive: true },
    ],
  },
  {
    slug: "categories",
    label: "Categorias",
    href: "/cards",
    permissions: [
      { key: PERMISSIONS.MENU_CATEGORY_CREATE, label: "Criar categorias", description: "Adicionar novas seções ao cardápio." },
      { key: PERMISSIONS.MENU_CATEGORY_UPDATE, label: "Editar categorias", description: "Alterar nome, foto e configuração das seções." },
      { key: PERMISSIONS.MENU_CATEGORY_REORDER, label: "Reordenar categorias", description: "Mudar a ordem das seções na home." },
      { key: PERMISSIONS.MENU_CATEGORY_STATUS, label: "Ativar/desativar categorias", description: "Mostrar ou esconder seções inteiras do cardápio." },
      { key: PERMISSIONS.MENU_CATEGORY_DELETE, label: "Excluir categorias", description: "Remover seções permanentemente.", sensitive: true },
    ],
  },
  {
    slug: "announcements",
    label: "Avisos",
    href: "/aviso",
    permissions: [
      { key: PERMISSIONS.ANNOUNCEMENT_UPDATE, label: "Gerenciar avisos", description: "Criar, editar e programar os avisos do cardápio." },
    ],
  },
  {
    slug: "linktree",
    label: "Linktree & QR Codes",
    href: "/linktree",
    permissions: [
      { key: PERMISSIONS.LINKTREE_UPDATE, label: "Editar linktree", description: "Gerenciar os links e o design da página de links." },
      { key: PERMISSIONS.QRCODE_MANAGE, label: "Gerenciar QR Codes", description: "Criar e editar os QR Codes." },
    ],
  },
  {
    slug: "relationship",
    label: "Relacionamento",
    href: "/reviews",
    permissions: [
      { key: PERMISSIONS.REVIEWS_VIEW, label: "Ver avaliações", description: "Visualizar o feedback dos clientes." },
      { key: PERMISSIONS.REVIEWS_MANAGE, label: "Gerenciar avaliações", description: "Marcar como lida e organizar as avaliações." },
      { key: PERMISSIONS.CUSTOMERS_VIEW, label: "Ver clientes", description: "Acessar a base de clientes (CRM)." },
      { key: PERMISSIONS.CUSTOMERS_EXPORT, label: "Exportar clientes", description: "Baixar a lista de clientes em CSV.", sensitive: true },
    ],
  },
  {
    slug: "growth",
    label: "Analytics",
    href: "/analytics",
    permissions: [
      { key: PERMISSIONS.ANALYTICS_VIEW, label: "Ver analytics", description: "Acessar métricas, comportamento e curtidas." },
    ],
  },
  {
    slug: "settings",
    label: "Configurações",
    href: "/configuracoes",
    permissions: [
      { key: PERMISSIONS.SETTINGS_UPDATE, label: "Editar configurações", description: "Alterar as configurações gerais do site." },
      { key: PERMISSIONS.INTEGRATIONS_UPDATE, label: "Editar integrações", description: "Configurar pixels e ferramentas de analytics (Meta, Google, TikTok).", sensitive: true },
    ],
  },
  {
    slug: "staff",
    label: "Equipe",
    href: "/equipe",
    permissions: [
      { key: PERMISSIONS.STAFF_VIEW, label: "Ver equipe", description: "Visualizar os membros da equipe e seus acessos." },
      { key: PERMISSIONS.STAFF_INVITE, label: "Adicionar funcionário", description: "Convidar novas pessoas para o painel.", sensitive: true },
      { key: PERMISSIONS.STAFF_UPDATE, label: "Editar funcionário", description: "Alterar dados de um membro da equipe." },
      { key: PERMISSIONS.STAFF_ROLE_UPDATE, label: "Alterar cargos", description: "Mudar o cargo de um membro da equipe.", sensitive: true },
      { key: PERMISSIONS.STAFF_PERMISSION_UPDATE, label: "Alterar permissões", description: "Personalizar permissões individuais.", sensitive: true },
      { key: PERMISSIONS.STAFF_DISABLE, label: "Desativar acesso", description: "Suspender o acesso de um membro (reversível).", sensitive: true },
      { key: PERMISSIONS.STAFF_REMOVE, label: "Remover funcionário", description: "Remover um membro da equipe permanentemente.", sensitive: true },
    ],
  },
  {
    slug: "audit",
    label: "Histórico",
    href: "/historico",
    permissions: [
      { key: PERMISSIONS.AUDIT_VIEW, label: "Ver histórico", description: "Acessar o histórico de atividades do painel." },
    ],
  },
];

/** Todas as keys, achatadas. */
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key),
);

const DEF_BY_KEY = new Map<string, PermissionDef>(
  PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => [p.key, p] as const)),
);

export function permissionDef(key: string): PermissionDef | undefined {
  return DEF_BY_KEY.get(key);
}

export function isValidPermission(key: string): key is PermissionKey {
  return DEF_BY_KEY.has(key);
}
