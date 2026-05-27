import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/AdminSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileTopBar } from "@/components/MobileTopBar";
import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";
import { countUnreadReviews } from "@/lib/data/reviews";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activeRestaurant = getActiveRestaurantId();
  const [restaurants, unreadReviews] = await Promise.all([
    listRestaurants(),
    countUnreadReviews(activeRestaurant),
  ]);

  return (
    <div className="flex min-h-screen bg-bg-app">
      <AdminSidebar
        email={user.email ?? null}
        activeRestaurant={activeRestaurant}
        restaurants={restaurants}
        unreadReviews={unreadReviews}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          email={user.email ?? null}
          activeRestaurant={activeRestaurant}
          restaurants={restaurants}
          unreadReviews={unreadReviews}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-20 sm:px-6 md:pb-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <BottomNav unreadReviews={unreadReviews} />
      </div>
    </div>
  );
}
