/**
 * @deprecated This file is deprecated. Import from '@/models/services/ServiceEvent' instead.
 * This file re-exports types for backwards compatibility during migration.
 */

// Re-export new types with old names for backwards compatibility
export type {
    ServiceRole as ServingRole,
    ServiceAssignment as ServingAssignment,
    ServiceFlowItem as ServingItem,
    ServiceFlowTemplate as ServingTemplate,
    ServiceFormState as ServingSchedule,
    // Also export new names
    ServiceRole,
    ServiceAssignment,
    ServiceFlowItem,
    ServiceFlowTemplate,
    ServiceFormState,
} from './services/ServiceEvent';
