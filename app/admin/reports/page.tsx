import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

type ReportRow = {
  id: string;
  name: string | null;
  email: string | null;
  report_type: string;
  message: string;
  created_at: string;
};

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin("/admin/reports");
  const { data } = await supabase
    .from("reports")
    .select("id, name, email, report_type, message, created_at")
    .order("created_at", { ascending: false });

  const reports = (data as ReportRow[] | null) ?? [];
  const feedbackCount = reports.filter((report) => report.report_type === "Website Feedback").length;
  const suggestionCount = reports.filter((report) => report.report_type === "Suggestion").length;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Reports and Feedback"
        description="Monitor incoming bug reports, suggestions, and general site feedback in one management view."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Reports", value: String(reports.length) },
          { label: "Feedback Notes", value: String(feedbackCount) },
          { label: "Suggestions", value: String(suggestionCount) }
        ].map((item) => (
          <div key={item.label} className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-[10px] text-white">{item.label}</p>
            <p className="mt-4 text-2xl font-semibold text-accent">{item.value}</p>
          </div>
        ))}
      </div>

      {!reports.length ? (
        <div className="pixel-border pixel-panel p-6 text-white/80">
          No customer reports yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="pixel-border pixel-panel p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="pixel-heading text-[10px] text-white">{report.report_type}</p>
                  <p className="mt-2 text-sm text-white/70">
                    {report.name || "Anonymous"} {report.email ? `· ${report.email}` : ""}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                  {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/80">{report.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
