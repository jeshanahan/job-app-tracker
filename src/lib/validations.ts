import { z } from "zod";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]).optional(),
  notes: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});