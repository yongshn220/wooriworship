import { ServingItem, ServingRole, ServingSchedule } from "@/models/serving";
import { FormMode } from "@/components/constants/enums";

export interface ServingFormProps {
    teamId: string;
    mode?: FormMode;
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
