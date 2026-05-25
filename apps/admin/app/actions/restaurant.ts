"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RESTAURANT_COOKIE } from "@/lib/active-restaurant";

export async function setActiveRestaurant(id: string) {
  // 1 ano
  cookies().set(RESTAURANT_COOKIE, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
