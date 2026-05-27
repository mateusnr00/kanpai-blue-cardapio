"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { tags } from "@/lib/cache-tags";
import { revalidateLinktreeOnSite } from "@/lib/trigger-site-revalidate";

function invalidate() {
  revalidateTag(tags.linktree());
  revalidatePath("/linktree");
  revalidateLinktreeOnSite();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export type ButtonInput = {
  label: string;
  /** Tipo: link direto OU sub-linktree OU disabled */
  kind: "link" | "subtree" | "disabled";
  href?: string;
  childSlug?: string;
  parentId: string | null;
  active: boolean;
};

export async function createButton(input: ButtonInput): Promise<{ error?: string }> {
  const label = input.label.trim();
  if (!label) return { error: "Label obrigatorio." };

  const supabase = createServerClient();

  // Calcula proxima position
  let q = supabase
    .from("linktree_buttons")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  q = input.parentId ? q.eq("parent_id", input.parentId) : q.is("parent_id", null);
  const { data: max } = await q.maybeSingle();
  const position = (max?.position ?? -1) + 1;

  let href: string | null = null;
  let child_slug: string | null = null;
  if (input.kind === "link" && input.href) {
    href = input.href.trim();
  } else if (input.kind === "subtree") {
    const slug = (input.childSlug && input.childSlug.trim()) || slugify(label);
    if (!slug) return { error: "Slug invalido." };
    child_slug = slug;
  }

  const { error } = await supabase.from("linktree_buttons").insert({
    label,
    position,
    active: input.active,
    parent_id: input.parentId,
    href,
    child_slug,
  });
  if (error) return { error: error.message };

  invalidate();
  return {};
}

export async function updateButton(
  id: string,
  input: Omit<ButtonInput, "parentId">,
): Promise<{ error?: string }> {
  const label = input.label.trim();
  if (!label) return { error: "Label obrigatorio." };

  let href: string | null = null;
  let child_slug: string | null = null;
  if (input.kind === "link" && input.href) {
    href = input.href.trim();
  } else if (input.kind === "subtree") {
    const slug = (input.childSlug && input.childSlug.trim()) || slugify(label);
    if (!slug) return { error: "Slug invalido." };
    child_slug = slug;
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("linktree_buttons")
    .update({ label, active: input.active, href, child_slug })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return {};
}

export async function deleteButton(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient();
  // ON DELETE CASCADE remove os filhos automaticamente
  const { error } = await supabase.from("linktree_buttons").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate();
  return {};
}

export async function reorderButtons(
  parentId: string | null,
  orderedIds: string[],
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const updates = orderedIds.map((id, i) =>
    supabase.from("linktree_buttons").update({ position: i }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  invalidate();
  return {};
}

export async function toggleButtonActive(
  id: string,
  active: boolean,
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("linktree_buttons").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  invalidate();
  return {};
}
