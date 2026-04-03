import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "./AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top nav — desktop only */}
      <div className="hidden md:block">
        <AppNav variant="top" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AppNav variant="bottom" />
      </div>
    </div>
  );
}
