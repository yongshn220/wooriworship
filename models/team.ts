import { Timestamp } from "@firebase/firestore";
import { WorshipSongHeader } from "@/models/worship";

export interface Team {
  id?: string
  name: string
  create_time: Timestamp
  last_worship_time: Timestamp
  admins: Array<string>
  users: Array<string>
  option: TeamOption
}

export interface TeamOption {
  worship: {
    beginning_song: WorshipSongHeader
    ending_song: WorshipSongHeader
  }
}
