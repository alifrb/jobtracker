"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { JobInput, Status } from "@/types/job";

function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`; // YYYY-MM-DD (local)
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function AddJobDialog({
  onSave,
}: {
  onSave: (input: JobInput) => void;
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("Prospect");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState<string>(
    toLocalISO(addDays(new Date(), 5))
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) setDueDate(toLocalISO(addDays(new Date(), 5)));
      }}
    >
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-[#68ff96] text-black rounded hover:bg-[#00ff4e]">
          + Add Job
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed z-[90] inset-0 bg-black/50" />
        <Dialog.Content className="fixed z-[100] left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-2 text-black">
            Add New Job
          </Dialog.Title>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const finalDueDate =
                dueDate || toLocalISO(addDays(new Date(), 5));
              onSave({
                role,
                company,
                location,
                status,
                dueDate: finalDueDate,
              });
              setOpen(false);
            }}
          >
            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Role</label>
              <input
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
                placeholder="Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Company</label>
              <input
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option>Applied</option>
                <option>Prospect</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Location</label>
              <input
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
                placeholder="Montréal or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-y-1 text-black">
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#68ff96] rounded px-3 py-2 focus:outline-none focus:border-[#00a933]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-2 rounded text-white bg-black hover:bg-gray-700"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 bg-[#68ff96] text-black rounded hover:bg-[#00ff4e]"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
