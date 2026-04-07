import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import NewCohortForm from "./NewCohortForm";

export default async function AdminCohortsPage() {
  const supabase = await createClient();
  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, name, start_date, active, whatsapp_link")
    .order("start_date", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Cohorts</h1>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Create new cohort</h2>
        <NewCohortForm />
      </div>

      <div className="space-y-3">
        {!cohorts?.length ? (
          <p className="text-stone-400 text-sm text-center py-10">No cohorts yet.</p>
        ) : (
          cohorts.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-stone-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">{c.name}</p>
                <p className="text-sm text-stone-400 mt-0.5">Starts {c.start_date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.active ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-400"
                }`}>
                  {c.active ? "Active" : "Inactive"}
                </span>
                <Link
                  href={`/admin/cohorts/${c.id}`}
                  className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
