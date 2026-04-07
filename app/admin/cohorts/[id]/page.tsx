import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddMemberForm from "./AddMemberForm";

export default async function AdminCohortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, start_date, whatsapp_link, active")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  const { data: members } = await supabase
    .from("cohort_members")
    .select("id, user_id, created_at, profiles ( display_name, phone )")
    .eq("cohort_id", id)
    .order("created_at");

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link href="/admin/cohorts" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">← Cohorts</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">{cohort.name}</h1>
        <Link
          href={`/admin/cohorts/${id}/schedule`}
          className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          Edit schedule →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
          <p className="text-xs text-stone-400 mb-1">Start date</p>
          <p className="font-medium text-stone-800">{cohort.start_date}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
          <p className="text-xs text-stone-400 mb-1">Members</p>
          <p className="font-medium text-stone-800">{members?.length ?? 0}</p>
        </div>
        {cohort.whatsapp_link && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
            <p className="text-xs text-stone-400 mb-1">WhatsApp</p>
            <a href={cohort.whatsapp_link} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-teal-700 hover:underline">
              Group link ↗
            </a>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Add member</h2>
        <AddMemberForm cohortId={id} />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Members</p>
        </div>
        {!members?.length ? (
          <p className="px-6 py-8 text-stone-400 text-sm text-center">No members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100">
              <tr>
                {["Name", "Phone", "User ID", "Joined"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {members.map((m) => {
                const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                return (
                  <tr key={m.id}>
                    <td className="px-6 py-4 font-medium text-stone-800">{profile?.display_name ?? "—"}</td>
                    <td className="px-6 py-4 text-stone-500">{profile?.phone ?? "—"}</td>
                    <td className="px-6 py-4 text-stone-400 font-mono text-xs">{m.user_id}</td>
                    <td className="px-6 py-4 text-stone-400">{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
