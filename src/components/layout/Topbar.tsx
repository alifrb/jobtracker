'use client';

import { useSidebar } from '@/context/sidebar';

export default function Topbar({
  title = 'Job Tracker',
  right,
}: {
  title?: string;
  right?: React.ReactNode;
}) {
  const { openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a] text-white flex justify-between items-center h-16 px-4 md:px-8">
      <button
        type="button"
        className="lg:hidden rounded p-2 focus:outline-none focus-visible:ring"
        aria-label="Open menu"
        onClick={openMobile}
      >
        ☰
      </button>

      <div className="font-bold">{title}</div>

      <div className="flex items-center gap-2">
        {right ?? <span className="w-[88px]" />}
      </div>
    </header>
  );
}
