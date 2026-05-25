import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { AdminNavbar } from "@/components/AdminNavbar";
import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [restaurants] = await Promise.all([listRestaurants()]);
  const activeRestaurant = getActiveRestaurantId();

  return (
    <div className="flex min-h-screen flex-col bg-bg-app">
      <AdminNavbar
        email={user.email ?? null}
        activeRestaurant={activeRestaurant}
        restaurants={restaurants}
      />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
