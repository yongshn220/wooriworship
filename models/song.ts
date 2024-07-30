import {Timestamp} from "@firebase/firestore";

export type SongMusicSheet = {
  key: string
  urls: Array<string>
}

export type Song = {
  id?: string
  team_id: string
  title: string
  subtitle: string
  description: string
  tags: Array<string>
  bpm: number
  version: string
  music_sheets: Array<SongMusicSheet>,
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
