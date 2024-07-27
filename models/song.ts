import {Timestamp} from "@firebase/firestore";

export type Song = {
  id: string
  team_id: string
  title: string
  subtitle: string
  description: string
  tags: Array<string>
  bpm: number
  version: string
  music_sheets: [
    {
      key: string,
      urls: Array<string>
    }
  ],
  lyrics: string
  created_by: {
    id: string
    time: Timestamp
  }
  last_used_time: Timestamp
  updated_by: {
    id: string
    time: Timestamp
  }
  original: {
    author: string
    url: string
  }
}
