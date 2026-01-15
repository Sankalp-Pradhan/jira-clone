import { z } from "zod";
import { TaskStatus } from "./types";

// API schema - accepts string dates from JSON
export const createTasksSchema = z.object({
    name: z.string().min(1, "Required"),
    status: z.enum(TaskStatus),
    workspaceId: z.string().min(1, "Required"),
    projectId: z.string().min(1, "Required"),
    dueDate: z.string(),
    assigneeId: z.string().trim().min(1, "Required"),
    description: z.string().nullish(),
})

// Form schema - uses Date objects for react-hook-form
export const createTasksFormSchema = z.object({
    name: z.string().min(1, "Required"),
    status: z.enum(TaskStatus),
    workspaceId: z.string().min(1, "Required"),
    projectId: z.string().min(1, "Required"),
    dueDate: z.date(),
    assigneeId: z.string().trim().min(1, "Required"),
    description: z.string().nullish(),
})