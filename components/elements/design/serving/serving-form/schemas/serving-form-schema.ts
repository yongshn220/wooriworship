import { z } from "zod";

export const ServingAssignmentSchema = z.object({
    roleId: z.string().optional(),
    label: z.string().optional(),
    memberIds: z.array(z.string()),
});

export const ServingItemSchema = z.object({
    id: z.string(),
    order: z.number(),
    title: z.string(),
    assignments: z.array(ServingAssignmentSchema),
    remarks: z.string().optional(),
    type: z.enum(['FLOW', 'SUPPORT', 'WORSHIP_TEAM']),
});

export const ServingScheduleSchema = z.object({
    teamId: z.string(),
    date: z.string(), // YYYY-MM-DD
    title: z.string().optional(),
    service_tags: z.array(z.string()),
    items: z.array(ServingItemSchema),
    templateId: z.string().optional().nullable(),
    worship_id: z.string().optional().nullable(),
});

export type ServingSchedulePayload = z.infer<typeof ServingScheduleSchema>;
