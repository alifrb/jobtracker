"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { useSidebar } from "@/context/sidebar";
import Sidebar from "./Sidebar";

type ViewMode = "All" | "DueToday" | "Overdue";

export default function MobileDrawer({
  dueTodayCount,
  overdueCount,
  onSelectView,
  currentView,
}: {
  dueTodayCount: number;
  overdueCount: number;
  onSelectView: (mode: ViewMode) => void;
  currentView: ViewMode;
}) {
  const { isOpenMobile, closeMobile } = useSidebar();

  useEffect(() => {
    if (isOpenMobile) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenMobile]);

  return (
    <Dialog.Root
      open={isOpenMobile}
      onOpenChange={(open) => !open && closeMobile()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-16 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed top-16 bottom-0 left-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out">
          <span className="sr-only">
            <Dialog.Title>Main menu</Dialog.Title>
          </span>
          <span className="sr-only">
            <Dialog.Description>
              Navigate through the main sections
            </Dialog.Description>
          </span>
          <Sidebar
            variant="mobile"
            dueTodayCount={dueTodayCount}
            overdueCount={overdueCount}
            currentView={currentView}
            onSelectView={(m) => {
              onSelectView(m);
              closeMobile();
            }}
            onNavigate={closeMobile}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
