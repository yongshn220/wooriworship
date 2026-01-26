import { Timestamp } from "firebase/firestore";
import { WorshipSongHeader } from "@/models/worship";
import { ServingAssignment, ServingItem } from "@/models/serving";

// =============================================================================
// 1. Root Header (Lightweight)
// Path: teams/{teamId}/services/{serviceId}
// =============================================================================
export interface ServiceEvent {
    id: string; // e.g., "2024-05-05_SUNDAY_11AM" or auto-id
    teamId: string;
    date: Timestamp;
    title: string;
    service_tags: string[]; // e.g. ["일요예배", "11시"]

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

// Path: teams/{teamId}/services/{serviceId}/bands/main
export interface ServiceBand {
    id: string; // usually "main"
    roles: ServingAssignment[]; // The cast: [{ role: 'Drum', memberIds: ['...'] }]
    note?: string; // "Rehearsal at 2PM"
}

// Path: teams/{teamId}/services/{serviceId}/flows/main
export interface ServiceFlow {
    id: string; // usually "main"
    items: ServingItem[]; // Cue-sheet items
    note?: string; // "Focus on silence during prayer"
}
