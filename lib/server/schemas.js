import { z } from "zod";

export const STATUS_IDS = ["wishlist", "applied", "interview", "offer", "rejected"];

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(100),
  role: z.string().trim().min(1, "Role is required").max(120),
  location: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(500).optional().default(""),
  status: z.enum(STATUS_IDS).optional().default("wishlist"),
  jobDescription: z.string().max(8000).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().trim().max(40)).max(30).optional().default([]),
  matchScore: z.number().min(0).max(100).nullable().optional().default(null),
});

export const profileSchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  headline: z.string().trim().max(120).optional().default(""),
  skills: z.array(z.string().trim().max(40)).max(40).optional().default([]),
  summary: z.string().trim().max(1200).optional().default(""),
});

export const aiSchema = z.object({
  action: z.enum(["analyze", "coverLetter", "interviewPrep"]),
  jobDescription: z
    .string()
    .trim()
    .min(40, "Paste the job description first (at least a few lines).")
    .max(8000),
  company: z.string().max(100).optional().default(""),
  role: z.string().max(120).optional().default(""),
});
