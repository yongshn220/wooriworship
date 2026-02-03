import { Timestamp } from "firebase/firestore";

export interface SetlistSongHeader {
  id: string
  note: string
  selected_music_sheet_ids: Array<string>
  // Hydrated Fields
  title?: string
  artist?: string // was subtitle
  key?: string
  keyNote?: string // e.g. "key up", "female key"
}

export interface Setlist {
  id?: string
  team_id: string
  title?: string
  service_tags: string[]
  subtitle?: string
  /** @deprecated Use date field from ServiceEvent instead */
  worship_date: Timestamp // Legacy field name, kept for backwards compatibility
  description: string
  link: string
  serving_schedule_id?: string
  songs: Array<SetlistSongHeader>
  beginning_song: SetlistSongHeader
  ending_song: SetlistSongHeader
  created_by: {
    id: string
    time: Timestamp
  }
  updated_by: {
    id: string
    time: Timestamp
  }
}

