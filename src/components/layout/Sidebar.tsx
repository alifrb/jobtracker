"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/sidebar";
import {
  Menu,
  ChevronLeft,
  LayoutGrid,
  CalendarClock,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

export type ViewMode = "All" | "DueToday" | "Overdue";

export type SidebarProps = {
  dueTodayCount: number;
  overdueCount: number;
  onSelectView: (mode: ViewMode) => void;
  currentView: ViewMode;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function Sidebar({
  dueTodayCount,
  overdueCount,
  onSelectView,
  currentView,
  variant = "desktop",
  onNavigate,
}: SidebarProps) {
  return variant === "desktop" ? (
    <DesktopRail
      dueTodayCount={dueTodayCount}
      overdueCount={overdueCount}
      onSelectView={onSelectView}
      currentView={currentView}
      onNavigate={onNavigate}
    />
  ) : (
    <MobilePanel
      dueTodayCount={dueTodayCount}
      overdueCount={overdueCount}
      onSelectView={onSelectView}
      currentView={currentView}
      onNavigate={onNavigate}
    />
  );
}

/* ---------------- Desktop (Collapsible rail) ---------------- */

function DesktopRail({
  dueTodayCount,
  overdueCount,
  onSelectView,
  currentView,
  onNavigate,
}: Omit<SidebarProps, "variant">) {
  const pathname = usePathname();
  const { isOpenDesktop, toggleDesktop } = useSidebar();

  return (
    <Collapsible.Root open={isOpenDesktop} onOpenChange={toggleDesktop} asChild>
      <aside
        className={`A hidden lg:flex flex-col border-r bg-[#98DED9] transition-all duration-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto ${
          isOpenDesktop ? "w-60" : "w-24"
        }`}
        aria-expanded={isOpenDesktop}
      >
        {/* Header / Toggle */}
        <div className="h-14 flex items-center justify-between px-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring"
            onClick={toggleDesktop}
            aria-label="Toggle sidebar"
          >
            {isOpenDesktop ? <ChevronLeft size={18} /> : <Menu size={18} />}
            {isOpenDesktop && (
              <span className="text-sm font-semibold">Menu</span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2">
          <NavItem
            href="/"
            label="Job Tracker"
            icon={<Briefcase size={18} />}
            active={pathname === "/"}
            open={isOpenDesktop}
            onNavigate={onNavigate}
          />
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutGrid size={18} />}
            active={pathname.startsWith("/dashboard")}
            open={isOpenDesktop}
            onNavigate={onNavigate}
          />
        </nav>

        {/* Today Overview */}
        <OverviewSection
          open={isOpenDesktop}
          dueTodayCount={dueTodayCount}
          overdueCount={overdueCount}
          onSelectView={onSelectView}
          currentView={currentView}
          onNavigate={onNavigate}
        />

        {/* Footer / Version */}
        <div className="px-2 py-2 text-[11px] text-slate-400">
          {isOpenDesktop ? "v0.1" : "v"}
        </div>
      </aside>
    </Collapsible.Root>
  );
}

/* ---------------- Mobile (panel used inside Drawer) ---------------- */

function MobilePanel({
  dueTodayCount,
  overdueCount,
  onSelectView,
  currentView,
  onNavigate,
}: Omit<SidebarProps, "variant">) {
  const pathname = usePathname();

  return (
    <div
      className="h-full w-64 bg-[#98DED9] flex flex-col border-r"
      role="dialog"
      aria-label="Navigation"
    >
      {/* Header – همان استایل دسکتاپ ولی برای بستن Drawer */}
      <div className="h-14 flex items-center justify-between px-2">
        <button
          type="button"
          className="111 text-black flex w-full items-center gap-2 rounded p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring"
          onClick={onNavigate}
          aria-label="Close sidebar"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-semibold">Menu</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2">
        <NavItem
          href="/"
          label="Job Tracker"
          icon={<Briefcase size={18} />}
          active={pathname === "/"}
          open={true}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/dashboard"
          label="Dashboard"
          icon={<LayoutGrid size={18} />}
          active={pathname.startsWith("/dashboard")}
          open={true}
          onNavigate={onNavigate}
        />
      </nav>

      {/* Today Overview */}
      <OverviewSection
        open={true}
        dueTodayCount={dueTodayCount}
        overdueCount={overdueCount}
        onSelectView={onSelectView}
        currentView={currentView}
        onNavigate={onNavigate}
      />

      <div className="px-2 py-2 text-[11px] text-slate-400">v0.1</div>
    </div>
  );
}

/* ---------------- Shared subcomponents ---------------- */

function NavItem({
  href,
  label,
  icon,
  active,
  open,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded px-2 py-2 text-sm mb-1 transition-colors ${
        active ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-800"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="shrink-0">{icon}</span>
      <span className={`truncate ${open ? "inline" : "hidden"}`}>{label}</span>
      {!open && <span className="sr-only">{label}</span>}
    </Link>
  );
}

function OverviewSection({
  open,
  dueTodayCount,
  overdueCount,
  onSelectView,
  currentView,
  onNavigate,
}: {
  open: boolean;
  dueTodayCount: number;
  overdueCount: number;
  onSelectView: (mode: ViewMode) => void;
  currentView: ViewMode;
  onNavigate?: () => void;
}) {
  const isDueActive = currentView === "DueToday";
  const isOverActive = currentView === "Overdue";

  return (
    <div className="px-2 pb-3">
      <div
        className={`text-xs font-medium text-slate-500 ${
          open ? "px-2" : "px-0"
        } mb-2`}
      >
        {open ? "Today Overview" : "T"}
      </div>

      <div className="space-y-1" aria-live="polite" aria-atomic="true">
        <MetricRow
          label="Due Today"
          value={dueTodayCount}
          open={open}
          active={isDueActive}
          icon={<CalendarClock size={16} />}
          onClick={() => {
            onSelectView(isDueActive ? "All" : "DueToday"); // ⬅️ toggle
            onNavigate?.();
          }}
        />
        <MetricRow
          label="Overdue"
          value={overdueCount}
          open={open}
          active={isOverActive}
          danger
          icon={<AlertTriangle size={16} />}
          onClick={() => {
            onSelectView(isOverActive ? "All" : "Overdue"); // ⬅️ toggle
            onNavigate?.();
          }}
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  open,
  danger = false,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  value: number;
  open: boolean;
  danger?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  const base = danger
    ? "bg-red-50 hover:bg-red-100"
    : "bg-slate-50 hover:bg-slate-100";
  const ring = active ? "ring-1 ring-slate-300" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`222 w-full flex items-center justify-between rounded-md px-2 py-2  text-gray-700 text-sm transition ${base} ${ring}`}
    >
      <span className="flex items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <span className={`${open ? "inline" : "hidden"}`}>{label}</span>
        {!open && <span className="sr-only">{label}</span>}
      </span>
      <span
        className={`text-sm font-semibold ${
          danger ? "text-red-600" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </button>
  );
}
