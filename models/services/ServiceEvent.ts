import { Timestamp } from "firebase/firestore";
import { SetlistSongHeader } from "@/models/setlist";

// =============================================================================
// Core Types (Migrated from serving.ts)
// =============================================================================

/**
 * Team's role definition for praise team assignments
 * Stored in: teams/{teamId}/praise_team_roles/{roleId}
 */
export interface ServiceRole {
    id: string;
    teamId: string;
    name: string;
    order: number;
    default_members?: string[];
}

/**
 * Assignment of members to a role or custom label
 * Used in ServicePraiseTeam and ServiceFlowItem
 */
export interface ServiceAssignment {
    roleId?: string;       // Reference to ServiceRole
    label?: string;        // Manual label (e.g., "Prayer")
    memberIds: string[];
}

/**
 * A single item in the service flow/cue-sheet
 */
export interface ServiceFlowItem {
    id: string;
    order: number;
    title: string;
    assignments: ServiceAssignment[];
    remarks?: string;
    type: 'FLOW' | 'SUPPORT';
}

/**
 * Template for service flow items
 * Stored in: teams/{teamId}/service_flow_templates/{templateId}
 * Now includes assignments for member presets
 */
export interface ServiceFlowTemplate {
    id: string;
    teamId: string;
    name: string;
    items: Omit<ServiceFlowItem, "id">[];  // Includes assignments for member presets
}

// =============================================================================
// 1. Root Header (Lightweight)
// Path: teams/{teamId}/services/{serviceId}
// =============================================================================
export interface ServiceEvent {
    id: string; // Auto-ID (UUID)
    teamId: string;
    date: Timestamp;
    title: string;
    tagId?: string; // Optimized single tag reference
    // service_tags?: string[]; // Multiple tags support (Deprecated: use tagId)
    setlist_id?: string; // Linked Setlist ID

    // Preview Summary (Optional, for board card performance)
    summary?: {
        songCount?: number;
    };

    created_at: Timestamp;
    updated_at: Timestamp;
    last_updated_by?: string;
}

// =============================================================================
// 2. Sub-Collections (Details)
// =============================================================================

// Path: teams/{teamId}/services/{serviceId}/setlists/main
export interface ServiceSetlist {
    id: string; // usually "main"
    songs: SetlistSongHeader[];
    description?: string; // Worship leader's mentorship/word
    link?: string; // YouTube link

    // Legacy compatibility (optional)
    beginning_song?: SetlistSongHeader;
    ending_song?: SetlistSongHeader;
}

// Path: teams/{teamId}/services/{serviceId}/praise_team/main
export interface ServicePraiseTeam {
    id: string; // usually "main"
    assignments: ServiceAssignment[]; // The cast: [{ roleId: 'drum', memberIds: ['...'] }]
    note?: string; // "Rehearsal at 2PM"
}

// Path: teams/{teamId}/services/{serviceId}/flows/main
export interface ServiceFlow {
    id: string; // usually "main"
    items: ServiceFlowItem[]; // Cue-sheet items
    note?: string; // "Focus on silence during prayer"
}

// =============================================================================
// 3. Form State Type (Composite for UI/Form usage)
// =============================================================================

/**
 * Composite type used for form state and UI display.
 * Combines ServiceEvent header with sub-collection data.
 */
export interface ServiceFormState {
    id: string;
    teamId: string;
    date: string | Timestamp; // Stored as Timestamp (UTC) in DB, kept as string for form compatibility
    title?: string;
    service_tags: string[]; // List of tag IDs (for form, single tagId is preferred in ServiceEvent)
    praise_team?: ServiceAssignment[]; // Praise team role assignments
    items?: ServiceFlowItem[]; // Service flow/cue-sheet items
    templateId?: string; // Track which template was used
    setlist_id?: string; // Linked Setlist ID
    roles?: { // Legacy V1 compatibility
        roleId: string;
        memberIds: string[];
    }[];
    note?: string;
}

