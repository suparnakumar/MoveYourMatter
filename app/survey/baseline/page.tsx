import { Suspense } from "react";
import SurveyClient from "./SurveyClient";

export default async function SurveyBaselinePage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string; type?: string; return?: string }>;
}) {
  const { cohort, type, return: returnTo } = await searchParams;
  const surveyType = type === "post" ? "post" : "pre";

  return (
    <Suspense>
      <SurveyClient cohortId={cohort ?? ""} surveyType={surveyType} returnTo={returnTo} />
    </Suspense>
  );
}
