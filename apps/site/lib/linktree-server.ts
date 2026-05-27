import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase-server";
import { tags } from "./cache-tags";

export type LinktreeButton = {
  id: string;
  parentId: string | null;
  label: string;
  href: string | null;
  childSlug: string | null;
  position: number;
  active: boolean;
};

async function fetchAllImpl(): Promise<LinktreeButton[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("linktree_buttons")
    .select("id, parent_id, label, href, child_slug, position, active")
    .order("parent_id", { nullsFirst: true })
    .order("position");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    label: r.label,
    href: r.href,
    childSlug: r.child_slug,
    position: r.position,
    active: r.active,
  }));
}

const fetchAllCached = unstable_cache(fetchAllImpl, ["linktree:all"], {
  tags: [tags.linktree()],
  revalidate: 86400,
});

export async function getRootButtons(): Promise<LinktreeButton[]> {
  const all = await fetchAllCached();
  return all.filter((b) => b.parentId === null && b.active).sort((a, b) => a.position - b.position);
}

export async function getSubLinktree(
  slug: string,
): Promise<{ root: LinktreeButton; children: LinktreeButton[] } | null> {
  const all = await fetchAllCached();
  const root = all.find((b) => b.childSlug === slug && b.active);
  if (!root) return null;
  const children = all
    .filter((b) => b.parentId === root.id && b.active)
    .sort((a, b) => a.position - b.position);
  return { root, children };
}
