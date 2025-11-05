"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SidebarContextValue = {
  // Desktop rail
  isOpenDesktop: boolean;
  toggleDesktop: () => void;
  setDesktopOpen: (open: boolean) => void;

  // Mobile drawer
  isOpenMobile: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const LS_KEY = "jobtracker:sidebar-open"; // "1" | "0"

/**
 * Normalize initial desktop open state:
 * - default closed (false)
 * - restore from localStorage if available
 */
function useDesktopOpenState() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw === "1") setIsOpen(true);
      if (raw === "0") setIsOpen(false);
    } catch {
      // ignore
    }
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, isOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const setOpen = useCallback((v: boolean) => setIsOpen(v), []);

  return { isOpen, toggle, setOpen };
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const desktop = useDesktopOpenState();

  // Mobile drawer is ephemeral; no persistence
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const openMobile = useCallback(() => setIsOpenMobile(true), []);
  const closeMobile = useCallback(() => setIsOpenMobile(false), []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isOpenDesktop: desktop.isOpen,
      toggleDesktop: desktop.toggle,
      setDesktopOpen: desktop.setOpen,
      isOpenMobile,
      openMobile,
      closeMobile,
    }),
    [
      desktop.isOpen,
      desktop.toggle,
      desktop.setOpen,
      isOpenMobile,
      openMobile,
      closeMobile,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within <SidebarProvider>");
  }
  return ctx;
}
