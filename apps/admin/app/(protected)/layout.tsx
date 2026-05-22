import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { AdminHeader } from "@/components/AdminHeader";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email ?? null} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
