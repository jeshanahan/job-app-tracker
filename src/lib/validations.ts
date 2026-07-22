import { z } from "zod";

export const applicationStatuses = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export const interviewTypes = [
  "PHONE",
  "VIDEO",
  "ONSITE",
  "TECHNICAL",
] as const;

export const documentTypes = ["RESUME", "COVER_LETTER", "OTHER"] as const;

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(applicationStatuses).optional(),
  notes: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  appliedDate: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export const contactSchema = z.object({
  applicationId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().optional(),
  notes: z.string().optional(),
});

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.string().min(1, "Date/time is required"),
  type: z.enum(interviewTypes).optional(),
  notes: z.string().optional(),
});

export const followUpSchema = z.object({
  applicationId: z.string().min(1),
  dueDate: z.string().min(1, "Due date is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
});

export const updateFollowUpSchema = followUpSchema.partial().extend({
  applicationId: z.string().min(1).optional(),
});
