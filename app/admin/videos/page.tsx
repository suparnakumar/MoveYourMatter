import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, type, rasa_slug, duration_seconds, active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Videos</h1>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Upload new video</h2>
        <UploadForm />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {!videos?.length ? (
          <p className="px-6 py-10 text-stone-400 text-sm text-center">No videos yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                {["Title", "Type", "Rasa", "Duration", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {videos.map((v) => (
                <tr key={v.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800">{v.title}</td>
                  <td className="px-6 py-4 text-stone-500">{v.type}</td>
                  <td className="px-6 py-4 text-stone-500">{v.rasa_slug ?? "—"}</td>
                  <td className="px-6 py-4 text-stone-500">
                    {v.duration_seconds ? formatDuration(v.duration_seconds) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.active ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-400"
                    }`}>
                      {v.active ? "Active" : "Inactive"}
                    </span>
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
