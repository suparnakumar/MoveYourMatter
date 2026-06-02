import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
