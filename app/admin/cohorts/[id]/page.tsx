export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddMemberForm from "./AddMemberForm";
import EditWhatsappLink from "./EditWhatsappLink";
import RemoveMemberButton from "./RemoveMemberButton";
import NotifyMembersButton from "./NotifyMembersButton";

export default async function AdminCohortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, start_date, whatsapp_link, active")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  const { data: memberRows } = await supabase
    .from("cohort_members")
    .select("id, user_id, created_at")
    .eq("cohort_id", id)
    .order("created_at");

  // Look up user details via service role — bypasses profiles RLS
  type MemberInfo = { id: string; full_name: string | null; email: string | null; phone: string | null };
  let memberInfo: MemberInfo[] = [];

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && memberRows?.length) {
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await admin.auth.admin.listUsers();
    if (data) {
      const ids = new Set(memberRows.map((m) => m.user_id));
      memberInfo = data.users
        .filter((u) => ids.has(u.id))
        .map((u) => ({
          id: u.id,
          full_name: u.user_metadata?.full_name ?? null,
          email: u.email ?? null,
          phone: u.user_metadata?.phone ?? null,
        }));
    }
  }

  const members = (memberRows ?? []).map((m) => ({
    ...m,
    info: memberInfo.find((u) => u.id === m.user_id) ?? null,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link href="/admin/cohorts" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">← Cohorts</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">{cohort.name}</h1>
        <div className="flex items-center gap-3">
          <NotifyMembersButton cohortId={id} />
          <Link
            href={`/admin/cohorts/${id}/schedule`}
            className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            Edit schedule →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
          <p className="text-xs text-stone-400 mb-1">Start date</p>
          <p className="font-medium text-stone-800">{cohort.start_date}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
          <p className="text-xs text-stone-400 mb-1">Members</p>
          <p className="font-medium text-stone-800">{members.length}</p>
        </div>
        <EditWhatsappLink cohortId={id} current={cohort.whatsapp_link} />
      </div>

      {/* Add member */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Add member</h2>
        <AddMemberForm cohortId={id} cohortName={cohort.name} whatsappLink={cohort.whatsapp_link} />
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Members</p>
        </div>
        {!members.length ? (
          <p className="px-6 py-8 text-stone-400 text-sm text-center">No members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100">
              <tr>
                {["Name", "Email", "Phone", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-6 py-4 font-medium text-stone-800">{m.info?.full_name ?? "—"}</td>
                  <td className="px-6 py-4 text-stone-500">{m.info?.email ?? "—"}</td>
                  <td className="px-6 py-4 text-stone-500">{m.info?.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-stone-400">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <RemoveMemberButton membershipId={m.id} memberName={m.info?.full_name ?? m.info?.email ?? "this member"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
