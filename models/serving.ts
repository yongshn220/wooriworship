import { Timestamp } from "@firebase/firestore";

export interface ServingRole {
    id: string;
    teamId: string;
    name: string;
    order: number;
    default_members?: string[];
}

export interface ServingAssignment {
    roleId?: string;       // Existing role reference
    label?: string;        // Manual label (e.g., "Prayer")
    memberIds: string[];
}


export interface ServingItem {
    id: string;
    order: number;
    title: string;
    assignments: ServingAssignment[];
    remarks?: string;
    type: 'FLOW' | 'SUPPORT';
}

export interface ServingSchedule {
    id: string;
    teamId: string;
    date: string | Timestamp; // Stored as Timestamp (UTC) in DB, kept as string for compatibility
    title?: string; // Optional title for the service (e.g. "Christmas Service")
    service_tags: string[]; // List of tag IDs
    worship_roles?: ServingAssignment[]; // New: Separated Worship Team Roles
    items?: ServingItem[]; // New cue-sheet based structure (Strictly Flow)
    templateId?: string; // Track which template was used
    worship_id?: string; // Linked Worship Plan ID
    roles?: { // Keep for backward compatibility (Legacy V1)
        roleId: string;
        memberIds: string[];
    }[];
    note?: string;
}

export interface ServingTemplate {
    id: string;
    teamId: string;
    name: string;
    items: Omit<ServingItem, "id" | "assignments">[];
}
