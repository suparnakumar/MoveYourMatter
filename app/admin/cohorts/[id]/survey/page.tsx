export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import CopyButton from "./CopyButton";

export default async function AdminSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return <p className="p-8 text-rose-600">Server misconfigured.</p>;

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: rows } = await admin
    .from("brain_health_surveys")
    .select("*")
    .eq("cohort_id", id)
    .order("submitted_at");

  const pre = (rows ?? []).filter((r) => r.survey_type === "pre");
  const post = (rows ?? []).filter((r) => r.survey_type === "post");

  function avg(arr: number[]): number | null {
    if (!arr.length) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  const preAvg = {
    overall: avg(pre.map((r) => r.overall_score)),
    energyFocus: avg(pre.map((r) => r.energy_focus_score)),
    memoryCognition: avg(pre.map((r) => r.memory_cognition_score)),
    moodResilience: avg(pre.map((r) => r.mood_resilience_score)),
    sleepBody: avg(pre.map((r) => r.sleep_body_score)),
  };

  const postAvg = {
    overall: avg(post.map((r) => r.overall_score)),
    energyFocus: avg(post.map((r) => r.energy_focus_score)),
    memoryCognition: avg(post.map((r) => r.memory_cognition_score)),
    moodResilience: avg(post.map((r) => r.mood_resilience_score)),
    sleepBody: avg(post.map((r) => r.sleep_body_score)),
  };

  const surveyUrl = `https://moveyourmatter.com/survey/baseline?cohort=${id}&type=pre`;

  return (
    <div>
      <div className="mb-1">
        <Link href={`/admin/cohorts/${id}`} className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← {cohort.name}
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Brain Health Survey</h1>
        <div className="flex items-center gap-3 text-sm text-stone-400">
          <span>{pre.length} pre</span>
          <span>·</span>
          <span>{post.length} post</span>
        </div>
      </div>

      {/* Survey link to share */}
      <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-6">
        <p className="text-xs text-stone-400 mb-2">Share this link with members</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm text-stone-700 bg-stone-50 px-3 py-2 rounded-xl overflow-x-auto">
            {surveyUrl}
          </code>
          <CopyButton text={surveyUrl} />
        </div>
      </div>

      {/* Aggregate */}
      {pre.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-5">
            Cohort Averages
          </p>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: "Overall", pre: preAvg.overall, post: postAvg.overall },
              { label: "Energy & Focus", pre: preAvg.energyFocus, post: postAvg.energyFocus },
              { label: "Memory & Cognition", pre: preAvg.memoryCognition, post: postAvg.memoryCognition },
              { label: "Mood & Resilience", pre: preAvg.moodResilience, post: postAvg.moodResilience },
              { label: "Sleep & Body", pre: preAvg.sleepBody, post: postAvg.sleepBody },
            ].map(({ label, pre: p, post: o }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-stone-900">{p ?? "–"}</p>
                {o != null && p != null && (
                  <p className={`text-sm font-semibold ${o > p ? "text-teal-600" : o < p ? "text-rose-500" : "text-stone-400"}`}>
                    → {o}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual responses */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Responses</p>
        </div>
        {!pre.length ? (
          <p className="px-6 py-8 text-stone-400 text-sm text-center">No survey responses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr>
                  {["Name", "Email", "Overall", "Energy", "Memory", "Mood", "Sleep", "Goals", "Obstacles", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {pre.map((r) => {
                  const postRow = post.find((p) => p.member_email === r.member_email);
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-stone-800 whitespace-nowrap">{r.member_name}</td>
                      <td className="px-4 py-3 text-stone-500">{r.member_email}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-teal-700">{r.overall_score}</span>
                        {postRow && (
                          <span className={`ml-1 text-xs font-semibold ${postRow.overall_score > r.overall_score ? "text-teal-600" : "text-rose-500"}`}>
                            → {postRow.overall_score}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{r.energy_focus_score}</td>
                      <td className="px-4 py-3 text-stone-600">{r.memory_cognition_score}</td>
                      <td className="px-4 py-3 text-stone-600">{r.mood_resilience_score}</td>
                      <td className="px-4 py-3 text-stone-600">{r.sleep_body_score}</td>
                      <td className="px-4 py-3 text-stone-400 text-xs max-w-xs truncate">
                        {(r.q10_cognitive_goals ?? []).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs max-w-xs truncate">
                        {r.q12_biggest_obstacle || "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                        {new Date(r.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
