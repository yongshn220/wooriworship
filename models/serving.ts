export interface ServingRole {
    id: string;
    teamId: string;
    name: string;
    order: number;
    default_members?: string[];
}

export interface ServingSchedule {
    id: string;
    teamId: string;
    date: string; // YYYY-MM-DD
    roles: {
        roleId: string;
        memberIds: string[];
    }[];
    note?: string;
}
