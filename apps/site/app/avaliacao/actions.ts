"use server";

import { createServerClient } from "@/lib/supabase-server";

export type SubmitReviewResult = { ok: true } | { error: string };

function clampRating(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n);
}

function textOrNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  const restaurantId = textOrNull(formData.get("restaurant_id"));
  const overall = clampRating(formData.get("overall"));
  if (!restaurantId) return { error: "Escolha o restaurante." };
  if (!overall) return { error: "Dê uma nota geral." };

  const supabase = createServerClient();
  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurantId,
    overall,
    food: clampRating(formData.get("food")),
    ambience: clampRating(formData.get("ambience")),
    service: clampRating(formData.get("service")),
    waiter_name: textOrNull(formData.get("waiter_name")),
    comment: textOrNull(formData.get("comment")),
    contact_name: textOrNull(formData.get("contact_name")),
    contact_email: textOrNull(formData.get("contact_email")),
    contact_phone: textOrNull(formData.get("contact_phone")),
  });
  if (error) return { error: error.message };
  return { ok: true };
}
