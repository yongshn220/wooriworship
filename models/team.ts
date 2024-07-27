import {Timestamp} from "@firebase/firestore";

export interface Team {
  id?: string
  name: string
  create_time: Timestamp
  last_worship_time: Timestamp
  leaders: Array<string>
  users: Array<string>
  option: TeamOption
}

export interface TeamOption {
  worship: {
    beginning_song_id: string
    ending_song_id: string
  }
}
