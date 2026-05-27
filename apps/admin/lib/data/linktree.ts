import { createServerClient } from "@/lib/supabase-server";

export type LinktreeButtonRow = {
  id: string;
  parent_id: string | null;
  label: string;
  href: string | null;
  child_slug: string | null;
  position: number;
  active: boolean;
};

export type LinktreeNode = LinktreeButtonRow & {
  children: LinktreeNode[];
};

export async function listAllButtons(): Promise<LinktreeButtonRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("linktree_buttons")
    .select("id, parent_id, label, href, child_slug, position, active")
    .order("parent_id", { nullsFirst: true })
    .order("position");
  if (error) throw error;
  return (data ?? []) as LinktreeButtonRow[];
}

export function buildTree(rows: LinktreeButtonRow[]): LinktreeNode[] {
  const byId = new Map<string, LinktreeNode>();
  for (const r of rows) byId.set(r.id, { ...r, children: [] });
  const roots: LinktreeNode[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parent_id) {
      const parent = byId.get(r.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }
  for (const list of [roots, ...Array.from(byId.values()).map((n) => n.children)]) {
    list.sort((a, b) => a.position - b.position);
  }
  return roots;
}
