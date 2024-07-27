import {Timestamp} from "@firebase/firestore";

export interface SongHeader {
  id: string
  note: string
}

export interface Worship {
  id?: string
  team_id: string
  title: string
  worship_date: Timestamp
  description: string
  songs: Array<SongHeader>
  beginning_song_id: string
  ending_song_id: string
  created_by: {
    id: string
    time: Timestamp
  }
  updated_by: {
    id: string
    time: Timestamp
  }
}
