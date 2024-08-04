import {Timestamp} from "@firebase/firestore";

export interface WorshipSongHeader {
  id: string
  note: string
  selected_music_sheet_ids: Array<string>
}

export interface Worship {
  id?: string
  team_id: string
  title: string
  worship_date: Timestamp
  description: string
  songs: Array<WorshipSongHeader>
  beginning_song: WorshipSongHeader
  ending_song: WorshipSongHeader
  created_by: {
    id: string
    time: Timestamp
  }
  updated_by: {
    id: string
    time: Timestamp
  }
}
