import {
  BookOpenText,
  SquaresFour,
  ChartLineUp,
  Megaphone,
  Star,
  LinkSimple,
  ClockCounterClockwise,
  Users,
  VideoCamera,
  Heart,
  QrCode,
  GraduationCap,
  AddressBook,
} from "@phosphor-icons/react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof BookOpenText;
  exact: boolean;
  badgeKey: "unreadReviews" | null;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

/** Navegação do admin, agrupada por utilidade (com divisórias na sidebar). */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Conteúdo",
    items: [
      { href: "/", label: "Cardápio", icon: BookOpenText, exact: true, badgeKey: null },
      { href: "/cards", label: "Categorias", icon: SquaresFour, exact: false, badgeKey: null },
      { href: "/aviso", label: "Aviso", icon: Megaphone, exact: false, badgeKey: null },
      { href: "/linktree", label: "Linktree", icon: LinkSimple, exact: false, badgeKey: null },
      { href: "/qrcode", label: "QR Codes", icon: QrCode, exact: false, badgeKey: null },
    ],
  },
  {
    title: "Relacionamento",
    items: [
      { href: "/reviews", label: "Avaliações", icon: Star, exact: false, badgeKey: "unreadReviews" },
      { href: "/clientes", label: "Clientes", icon: AddressBook, exact: false, badgeKey: null },
      { href: "/likes", label: "Curtidas", icon: Heart, exact: false, badgeKey: null },
    ],
  },
  {
    title: "Crescimento",
    items: [
      { href: "/analytics", label: "Analytics", icon: ChartLineUp, exact: false, badgeKey: null },
      { href: "/comportamento", label: "Comportamento", icon: VideoCamera, exact: false, badgeKey: null },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/historico", label: "Histórico", icon: ClockCounterClockwise, exact: false, badgeKey: null },
      { href: "/users", label: "Usuários", icon: Users, exact: false, badgeKey: null },
      { href: "/como-usar", label: "Como usar", icon: GraduationCap, exact: false, badgeKey: null },
    ],
  },
];

/** Lista achatada (compatibilidade com consumidores que não usam grupos). */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
