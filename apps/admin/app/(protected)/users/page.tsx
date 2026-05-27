import { createServerClient } from "@/lib/supabase-server";
import { PageHeader } from "@/components/PageHeader";
import { listUsers } from "./actions";
import { UsersManager } from "./UsersManager";

export default async function UsersPage() {
  const supabase = createServerClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  const users = await listUsers();

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Quem tem acesso ao admin do Kanpai Blue."
      />
      <UsersManager users={users} currentUserId={me?.id ?? null} />
    </section>
  );
}
