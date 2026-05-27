"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServerClient } from "@/lib/supabase-server";
import { logAudit } from "@/lib/audit";

export type UserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function listUsers(): Promise<UserRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at ?? "",
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));
}

export async function createUser(input: {
  email: string;
  password: string;
}): Promise<{ error?: string; id?: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email || !email.includes("@")) return { error: "Email invalido." };
  if (password.length < 8) return { error: "Senha precisa ter pelo menos 8 caracteres." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return { error: error.message };

  await logAudit({
    action: "create",
    entityType: "user",
    entityId: data.user.id,
    entityLabel: email,
  });

  revalidatePath("/users");
  return { id: data.user.id };
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  // Nao deixa apagar a si mesmo
  const supabase = createServerClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  if (me?.id === id) {
    return { error: "Voce nao pode excluir o proprio usuario." };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin.auth.admin.getUserById(id);
  const email = existing?.user?.email ?? null;

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  await logAudit({
    action: "delete",
    entityType: "user",
    entityId: id,
    entityLabel: email,
  });

  revalidatePath("/users");
  return {};
}
