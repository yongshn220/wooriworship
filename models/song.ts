import { Timestamp } from "firebase/firestore";

export type Song = {
  id?: string
  team_id: string
  title: string
  subtitle: string
  description: string
  tags: Array<string>
  keys: Array<string>
  // Note: Song collection uses 'time' field name (see SongApi.ts)
  // This differs from MusicSheet which uses 'timestamp'
  // Field names correspond to actual Firestore document fields
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
