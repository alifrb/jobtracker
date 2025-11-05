"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { Job, Status } from "@/types/job";

export function EditJobDialog({
  open,
  job,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  job: Job | null;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Job) => void;
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("Prospect");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (job) {
      setRole(job.role);
      setCompany(job.company);
      setStatus(job.status);
      setLocation(job.location ?? "");
    }
  }, [job]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed z-[90] inset-0 bg-black/50" />
        <Dialog.Content className="fixed z-[100] left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-2 text-gray-800">Edit Job</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-4">
            Update the job details and save your changes.
          </Dialog.Description>

          <form
            className="space-y-3 text-black"
            onSubmit={(e) => {
              e.preventDefault();
              if (!job) return;
              onSave({
                id: job.id,
                role,
                company,
                status,
                location: location || undefined,
              });
              onOpenChange(false);
            }}
          >
            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Role</label>
              <input className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Company</label>
              <input className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option>Prospect</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Location</label>
              <input className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="px-3 py-2 rounded text-white bg-black hover:bg-gray-700">Cancel</button>
              </Dialog.Close>
              <button type="submit" className="px-4 py-2 bg-[#68ff96] text-black rounded hover:bg-[#00ff4e]">Save</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
