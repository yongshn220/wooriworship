import { Timestamp } from "firebase/firestore";
import { SetlistSongHeader } from "@/models/setlist";

export interface Team {
  id?: string
  name: string
  create_time: Timestamp
  last_worship_time: Timestamp
  admins: Array<string>
  users: Array<string>
  option: TeamOption
  service_tags: Array<{
    id: string
    name: string
    order: number
  }>
}

export interface TeamOption {
  setlist: {
    beginning_song: SetlistSongHeader
    ending_song: SetlistSongHeader
  }
  /** @deprecated Use setlist instead */
  worship?: {
    beginning_song: SetlistSongHeader
    ending_song: SetlistSongHeader
  }
}
