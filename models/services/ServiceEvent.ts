import { Timestamp } from "firebase/firestore";
import { WorshipSongHeader } from "@/models/worship";
import { ServingAssignment, ServingItem } from "@/models/serving";

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
    worship_id?: string; // Linked Worship Plan ID

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
    songs: WorshipSongHeader[];
    description?: string; // Worship leader's mentorship/word
    link?: string; // YouTube link

    // Legacy compatibility (optional)
    beginning_song?: WorshipSongHeader;
    ending_song?: WorshipSongHeader;
}

// Path: teams/{teamId}/services/{serviceId}/praise_assignee/main
export interface ServicePraiseAssignee {
    id: string; // usually "main"
    assignee: ServingAssignment[]; // The cast: [{ role: 'Drum', memberIds: ['...'] }]
    note?: string; // "Rehearsal at 2PM"
}

// Path: teams/{teamId}/services/{serviceId}/flows/main
export interface ServiceFlow {
    id: string; // usually "main"
    items: ServingItem[]; // Cue-sheet items
    note?: string; // "Focus on silence during prayer"
}
