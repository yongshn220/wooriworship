export interface MyAssignment {
    serviceId: string;
    serviceDate: Date;
    serviceTitle: string;
    serviceBadgeLabel: string;
    roles: MyAssignmentRole[];
}

export interface MyAssignmentRole {
    source: 'praise_team' | 'flow';
    roleName: string;
    flowItemTitle?: string;
}
