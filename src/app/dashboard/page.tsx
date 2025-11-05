"use client";
import { useEffect, useMemo, useState } from "react";
import type { Job } from "@/types/job";
import Sidebar from "@/components/layout/Sidebar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Topbar from "@/components/layout/Topbar";

/* ---- date helpers (local-safe) ---- */
function toLocalISO(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayLocalISO() {
  return toLocalISO(new Date());
}
function isDueToday(due?: string) {
  if (!due) return false;
  return due === todayLocalISO();
}
function isOverdue(due?: string) {
  if (!due) return false;
  return due < todayLocalISO();
}

type ViewMode = "All" | "DueToday" | "Overdue";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("All");

  // Load jobs from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("jobtracker:v1:jobs");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  }, []);

  const kpis = useMemo(() => {
    const total = jobs.length;
    const byStatus = {
      Prospect: jobs.filter((j) => j.status === "Prospect").length,
      Applied: jobs.filter((j) => j.status === "Applied").length,
      Interview: jobs.filter((j) => j.status === "Interview").length,
      Offer: jobs.filter((j) => j.status === "Offer").length,
      Rejected: jobs.filter((j) => j.status === "Rejected").length,
    } as const;

    const dueToday = jobs.filter((j) => isDueToday(j.dueDate)).length;
    const overdue = jobs.filter((j) => isOverdue(j.dueDate)).length;

    return { total, ...byStatus, dueToday, overdue };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      {/* Topbar fixed height (64px) for consistent sticky offsets */}
      <header className="sticky top-0 z-40 bg-[#0b1220]/0">
        <div className="1 h-16">
          <Topbar title="Dashboard" />
        </div>
      </header>

      {/* Layout: desktop sidebar + main; mobile only uses drawer */}
      <div className="XC flex">
        {/* Desktop Sidebar - rendered directly, handles its own visibility */}
        <Sidebar
          variant="desktop"
          dueTodayCount={kpis.dueToday}
          overdueCount={kpis.overdue}
          onSelectView={(m: ViewMode) => setViewMode(m)}
          currentView={viewMode}
        />

        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Mobile: Drawer */}
          <MobileDrawer
            dueTodayCount={kpis.dueToday}
            overdueCount={kpis.overdue}
            currentView={viewMode}
            onSelectView={(m: ViewMode) => setViewMode(m)}
          />

          <main className="p-4 sm:p-8">
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-gray-500 mb-8">
              Quick overview of your job search.
            </p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI title="Total" value={kpis.total} />
              <KPI title="Prospect" value={kpis.Prospect} />
              <KPI title="Applied" value={kpis.Applied} />
              <KPI title="Interview" value={kpis.Interview} />
              <KPI title="Offer" value={kpis.Offer} />
              <KPI title="Rejected" value={kpis.Rejected} />
              <KPI title="Due Today" value={kpis.dueToday} tone="warn" />
              <KPI title="Overdue" value={kpis.overdue} tone="danger" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---- small KPI card component ---- */
function KPI({
  title,
  value,
  tone,
}: {
  title: string;
  value: number | string;
  tone?: "default" | "warn" | "danger";
}) {
  const toneClasses =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "warn"
      ? "border-yellow-200 bg-yellow-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`border ${toneClasses} rounded-xl p-4 shadow-sm`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
