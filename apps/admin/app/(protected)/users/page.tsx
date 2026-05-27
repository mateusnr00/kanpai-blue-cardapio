import { createServerClient } from "@/lib/supabase-server";
import { PageHeader } from "@/components/PageHeader";
import { listUsers, type UserRow } from "./actions";
import { UsersManager } from "./UsersManager";

export default async function UsersPage() {
  const supabase = createServerClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  let users: UserRow[] = [];
  let error: string | null = null;
  try {
    users = await listUsers();
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Quem tem acesso ao admin do Kanpai Blue."
      />
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Não foi possível carregar usuários.</p>
          <p className="mt-1 text-xs">{error}</p>
          <p className="mt-2 text-xs">
            Verifique se <code>SUPABASE_SERVICE_ROLE_KEY</code> está configurada nas variáveis de ambiente do admin (Vercel).
          </p>
        </div>
      ) : (
        <UsersManager users={users} currentUserId={me?.id ?? null} />
      )}
    </section>
  );
}
