export type Status =
  | "Prospect"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export type Job = {
  id: string;
  role: string;
  company: string;
  location?: string;
  status: Status;
  /** ISO date like "2025-10-03" (no time) */
  dueDate?: string;
};

export type JobInput = Omit<Job, "id">;
