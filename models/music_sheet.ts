import {Timestamp} from "@firebase/firestore";

export type MusicSheet = {
    id?: string
    song_id: string
    key: string
    urls: Array<string>
    created_by: {
      id: string
      timestamp: Timestamp
    }
    updated_by: {
      id: string
      timestamp: Timestamp
    }
}
