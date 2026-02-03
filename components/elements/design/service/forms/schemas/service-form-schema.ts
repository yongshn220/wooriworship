import { z } from "zod";

export const ServiceAssignmentSchema = z.object({
    roleId: z.string().optional(),
    label: z.string().optional(),
    memberIds: z.array(z.string()),
});

export const ServiceItemSchema = z.object({
    id: z.string(),
    order: z.number(),
    title: z.string(),
    assignments: z.array(ServiceAssignmentSchema),
    remarks: z.string().optional(),
    type: z.enum(['FLOW', 'SUPPORT', 'PRAISE_TEAM']),
});

export const ServiceScheduleSchema = z.object({
    teamId: z.string(),
    date: z.string(), // YYYY-MM-DD
    title: z.string().optional(),
    service_tags: z.array(z.string()),
    items: z.array(ServiceItemSchema),
    templateId: z.string().optional().nullable(),
    setlist_id: z.string().optional().nullable(),
});

export type ServiceSchedulePayload = z.infer<typeof ServiceScheduleSchema>;
