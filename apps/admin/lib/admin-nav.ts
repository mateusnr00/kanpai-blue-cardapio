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
} from "@phosphor-icons/react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof BookOpenText;
  exact: boolean;
  badgeKey: "unreadReviews" | null;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true, badgeKey: null },
  { href: "/cards", label: "Categorias", icon: SquaresFour, exact: false, badgeKey: null },
  { href: "/aviso", label: "Aviso", icon: Megaphone, exact: false, badgeKey: null },
  { href: "/linktree", label: "Linktree", icon: LinkSimple, exact: false, badgeKey: null },
  { href: "/reviews", label: "Avaliações", icon: Star, exact: false, badgeKey: "unreadReviews" },
  { href: "/likes", label: "Curtidas", icon: Heart, exact: false, badgeKey: null },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp, exact: false, badgeKey: null },
  { href: "/comportamento", label: "Comportamento", icon: VideoCamera, exact: false, badgeKey: null },
  { href: "/historico", label: "Histórico", icon: ClockCounterClockwise, exact: false, badgeKey: null },
  { href: "/users", label: "Usuários", icon: Users, exact: false, badgeKey: null },
];
