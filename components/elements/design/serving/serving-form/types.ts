import { ServingItem, ServingRole, ServingSchedule } from "@/models/serving";

export interface ServingFormProps {
    teamId: string;
    mode?: "CREATE" | "EDIT";
    initialData?: ServingSchedule;
}

export interface ServingFormState {
    step: number;
    direction: number;
    selectedDate: Date | undefined;
    items: ServingItem[];
    // Add other state properties strictly
}

// Re-export models for convenience
export type { ServingItem, ServingRole, ServingSchedule };
