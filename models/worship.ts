import {Timestamp} from "@firebase/firestore";
import {SongInfo} from "@/app/board/[teamId]/plan/_components/new-button";

export interface SongHeader {
  id: string
  note: string
}

export interface Worship {
  id: string
  team_id: string
  title: string
  worship_date: Timestamp
  description: string
  songs: Array<SongHeader>
  created_by: {
    id: string
    time: Date
  }
  updated_by: {
    id: string
    time: Date
  }
}
