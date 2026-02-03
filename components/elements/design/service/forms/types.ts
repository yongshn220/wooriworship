import { ServiceFlowItem, ServiceRole, ServiceFormState } from "@/models/services/ServiceEvent";
import { FormMode } from "@/components/constants/enums";

export interface ServiceFormProps {
    teamId: string;
    mode?: FormMode;
    initialData?: ServiceFormState;
}

export interface ServiceFormStateLocal {
    step: number;
    direction: number;
    selectedDate: Date | undefined;
    items: ServiceFlowItem[];
    // Add other state properties strictly
}

// Re-export models for convenience
export type { ServiceFlowItem, ServiceRole, ServiceFormState };
