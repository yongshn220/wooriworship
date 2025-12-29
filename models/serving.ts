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
    type: 'FLOW' | 'SUPPORT' | 'WORSHIP_TEAM';
}

export interface ServingSchedule {
    id: string;
    teamId: string;
    date: string; // YYYY-MM-DD
    title?: string; // Optional title for the service (e.g. "Christmas Service")
    tags: string[]; // List of tag IDs or names
    items?: ServingItem[]; // New cue-sheet based structure
    templateId?: string; // Track which template was used
    worshipId?: string; // Linked Worship Plan ID
    roles?: { // Keep for backward compatibility
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
