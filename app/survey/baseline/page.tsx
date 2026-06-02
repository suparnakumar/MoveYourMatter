import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import SurveyClient from "./SurveyClient";

export default async function SurveyBaselinePage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string; type?: string }>;
}) {
  const { cohort, type } = await searchParams;
  const surveyType = type === "post" ? "post" : "pre";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const next = `/survey/baseline?cohort=${cohort ?? ""}&type=${surveyType}`;
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  // Auto-enroll in the cohort if not already a member
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (cohort && serviceKey) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: existing } = await admin
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", user.id)
      .eq("cohort_id", cohort)
      .maybeSingle();

    if (!existing) {
      // Verify the cohort exists before inserting
      const { data: cohortRow } = await admin
        .from("cohorts")
        .select("id")
        .eq("id", cohort)
        .maybeSingle();

      if (cohortRow) {
        await admin.from("cohort_members").insert({
          cohort_id: cohort,
          user_id: user.id,
        });
      }
    }
  }

  const userEmail = user.email ?? "";
  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    "";

  return (
    <Suspense>
      <SurveyClient
        cohortId={cohort ?? ""}
        surveyType={surveyType}
        userEmail={userEmail}
        userName={userName}
      />
    </Suspense>
  );
}
