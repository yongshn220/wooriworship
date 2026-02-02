import { Timestamp } from "firebase/firestore";

export type MusicSheet = {
  id?: string
  song_id: string
  key: string
  note?: string
  urls: Array<string>
  // Note: MusicSheet collection uses 'timestamp' field name (see MusicSheetApi.ts)
  // This differs from Song which uses 'time'
  // Field names correspond to actual Firestore document fields
  created_by: {
    id: string
    timestamp: Timestamp
  }
  updated_by: {
    id: string
    timestamp: Timestamp
  }
}
