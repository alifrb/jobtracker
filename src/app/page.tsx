"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Trash, Pencil } from "lucide-react";
import { toast } from "sonner";

import type { Job, JobInput, Status } from "@/types/job";
import Sidebar from "@/components/layout/Sidebar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Topbar from "@/components/layout/Topbar";
import { AddJobDialog } from "@/components/AddJobDialog";
import { EditJobDialog } from "@/components/EditJobDialog";

const STORAGE_KEY = "jobtracker:v1:jobs";
const VIEW_MODES = ["All", "DueToday", "Overdue"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

/* date utils */
function toLocalISO(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDaysLocal(base: Date, n: number) {
  const nd = new Date(base);
  nd.setDate(nd.getDate() + n);
  return toLocalISO(nd);
}
function todayLocalISO() {
  return toLocalISO(new Date());
}
function isDueToday(due?: string) {
  return due === todayLocalISO();
}
function isOverdue(due?: string) {
  return !!due && due < todayLocalISO();
}

/* JobCard */
function JobCard({
  job,
  onDelete,
  onEdit,
}: {
  job: Job;
  onDelete: (job: Job) => void;
  onEdit: (job: Job) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: job.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const soon =
    job.dueDate &&
    job.dueDate >= todayLocalISO() &&
    job.dueDate <= addDaysLocal(new Date(), 2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-[#fff] rounded p-2 bg-[#fff] hover:bg-[#f1f5f9] shadow transition-shadow ${
        isDragging ? "opacity-70" : ""
      } ${soon ? "ring-1 ring-yellow-400" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing font-semibold text-gray-800 select-none"
      >
        {job.role}
      </div>
      <div className="text-sm text-gray-600">{job.company}</div>
      <div className="text-xs text-gray-400 mb-1">
        {job.location ?? "—"} · {job.status}
      </div>

      {job.dueDate && (
        <div
          className={`inline-block mb-2 px-2 py-0.5 text-xs rounded-full ${
            isOverdue(job.dueDate)
              ? "bg-red-100 text-red-700"
              : isDueToday(job.dueDate)
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-700"
          }`}
        >
          Due {job.dueDate}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Edit job"
          title="Edit"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => onEdit(job)}
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          aria-label="Delete job"
          title="Delete"
          className="text-red-500 hover:text-red-600"
          onClick={() => onDelete(job)}
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}

/* Column */
function Column({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`
        snap-start shrink-0
        min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]
        bg-[#F6F6F6] border border-[#c5c5c5] rounded p-2
        flex flex-col min-h-0 transition
        ${isOver ? "ring-2 ring-sky-500 bg-sky-50" : ""}
      `}
    >
      <header className="sticky top-0 z-10 px-2 py-2 bg-[#F6F6F6]/95 backdrop-blur border-b border-[#c5c5c5]">
        <h2 className="font-medium text-black">{status}</h2>
      </header>
      <div className="p-1 space-y-3 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
        {children}
      </div>
    </section>
  );
}

/* Page */
export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      role: "Frontend Developer",
      company: "Company XYZ",
      status: "Prospect",
      location: "Montréal",
      dueDate: "2025-10-01",
    },
    {
      id: "2",
      role: "UI Engineer",
      company: "Company ABC",
      status: "Prospect",
      location: "Remote",
      dueDate: todayLocalISO(),
    },
    {
      id: "3",
      role: "React Engineer",
      company: "Company DDD",
      status: "Rejected",
      location: "Remote",
      dueDate: "2025-12-01",
    },
  ]);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [viewMode, setViewMode] = useState<ViewMode>("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleAddJob(input: JobInput) {
    const newJob: Job = { id: Date.now().toString(), ...input };
    setJobs((prev) => [...prev, newJob]);
  }
  function handleDelete(job: Job) {
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    toast("Job deleted", {
      description: `${job.role} @ ${job.company}`,
      action: {
        label: "Undo",
        onClick: () => {
          setJobs((prev) => [job, ...prev]);
          toast.success("Restored", {
            description: `${job.role} @ ${job.company}`,
          });
        },
      },
      duration: 3000,
    });
  }
  function handleEdit(job: Job) {
    setEditJob(job);
  }
  function handleUpdateJob(updated: Job) {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }

  const filteredJobs = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchesSearch =
        j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  let viewFiltered = filteredJobs;
  if (viewMode === "DueToday")
    viewFiltered = filteredJobs.filter((j) => isDueToday(j.dueDate));
  else if (viewMode === "Overdue")
    viewFiltered = filteredJobs.filter((j) => isOverdue(j.dueDate));

  const dueTodayCount = jobs.filter((j) => isDueToday(j.dueDate)).length;
  const overdueCount = jobs.filter((j) => isOverdue(j.dueDate)).length;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) setJobs(data);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const grouped = useMemo(() => {
    const g: Record<Status, Job[]> = {
      Prospect: [],
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };
    for (const j of viewFiltered) g[j.status].push(j);
    return g;
  }, [viewFiltered]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      {/* Topbar fixed height (64px) for consistent sticky offsets */}
      <header className="sticky top-0 z-40 bg-[#0b1220]/0">
        <div className="h-16">
          <Topbar
            title="Job Tracker"
            right={<AddJobDialog onSave={handleAddJob} />}
          />
        </div>
      </header>

      {/* Layout: desktop sidebar + main; mobile only uses drawer */}
      <div className="flex">
        <div className="flex-none">
          <Sidebar
            variant="desktop"
            dueTodayCount={dueTodayCount}
            overdueCount={overdueCount}
            onSelectView={(m: ViewMode) => setViewMode(m)}
            currentView={viewMode}
          />
        </div>

        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Mobile: Drawer trigger & panel */}
          <div className="block lg:hidden px-4">
            <MobileDrawer
              dueTodayCount={dueTodayCount}
              overdueCount={overdueCount}
              currentView={viewMode}
              onSelectView={(m: ViewMode) => setViewMode(m)}
            />
          </div>

          <main className="p-4 sm:p-8">
            <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-800 bg-clip-text text-transparent leading-tight text-center sm:text-left">
              JobTracker
            </h1>

            <p className="mt-2 sm:mt-3 text-base sm:text-lg font-medium text-slate-700 leading-relaxed text-center sm:text-left">
              <span className="text-emerald-600 font-semibold block sm:inline">
                Track every application.
              </span>
              <span className="text-green-700 block sm:inline">
                Stay organized.
              </span>
              <span className="text-emerald-800 font-bold underline decoration-green-500 decoration-2 underline-offset-4 block sm:inline">
                Get hired faster.
              </span>
            </p>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 my-5">
              <input
                type="text"
                placeholder="Search by role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border border-[#68ff96] rounded-xl px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-[#00a933]"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as Status | "All")
                }
                className="text-sm border w-full sm:w-72 border-[#68ff96] focus:border-[#00a933] rounded-xl px-4 py-2"
              >
                <option value="All">All statuses</option>
                <option value="Prospect">Prospect</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Board: horizontal scroll only */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={({ active, over }) => {
                if (!over) return;
                const jobId = String(active.id);
                const newStatus = over.id as Status;
                setJobs((prev) =>
                  prev.map((j) => {
                    if (j.id !== jobId) return j;
                    if (j.status === newStatus) return j;
                    let newDue: string | undefined;
                    switch (newStatus) {
                      case "Applied":
                        newDue = addDaysLocal(new Date(), 5);
                        break;
                      case "Interview":
                        newDue = addDaysLocal(new Date(), 2);
                        break;
                      case "Offer":
                        newDue = addDaysLocal(new Date(), 7);
                        break;
                      case "Prospect":
                        newDue = addDaysLocal(new Date(), 3);
                        break;
                      case "Rejected":
                        newDue = undefined;
                        break;
                    }
                    return { ...j, status: newStatus, dueDate: newDue };
                  })
                );
              }}
            >
              <div className="mt-5 w-full overflow-x-auto overflow-y-hidden bg-inherit touch-pan-x overscroll-x-contain pb-3 pr-10">
                <div className="flex w-max gap-4 px-1 pr-6 items-stretch min-h-0 snap-x snap-mandatory">
                  {(Object.keys(grouped) as Status[]).map((status) => (
                    <Column key={status} status={status}>
                      {grouped[status].length ? (
                        grouped[status].map((j) => (
                          <JobCard
                            key={j.id}
                            job={j}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                          />
                        ))
                      ) : (
                        <div className="text-sm text-gray-300 text-center italic py-4">
                          No jobs here
                        </div>
                      )}
                    </Column>
                  ))}
                </div>
              </div>
            </DndContext>
          </main>
        </div>
      </div>

      {/* Edit dialog */}
      <EditJobDialog
        open={!!editJob}
        job={editJob}
        onOpenChange={(open) => !open && setEditJob(null)}
        onSave={handleUpdateJob}
      />
    </div>
  );
}
