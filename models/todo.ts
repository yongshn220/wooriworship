import { Timestamp } from "firebase/firestore";

export interface Todo {
    id: string;
    teamId: string;
    title: string;
    completed: boolean;
    completedAt: Timestamp | null;
    completedBy: string | null;     // uid of who checked it off
    assigneeIds: string[];           // empty array = unassigned
    serviceId: string | null;        // null = general todo (MUST be explicit, not absent)
    serviceTitle: string | null;     // denormalized for display (e.g., "Jan 26 Sunday AM")
    dueDate: Timestamp | null;       // date only
    createdBy: string;               // uid of creator
    createdAt: Timestamp;
    updatedAt: Timestamp;
    order: number;                   // for manual ordering
}
