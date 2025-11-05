'use client';

import { SidebarProvider } from "@/context/sidebar";
import { Toaster } from "sonner";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
      <Toaster richColors position="bottom-center" />
    </SidebarProvider>
  );
}
