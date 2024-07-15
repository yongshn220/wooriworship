import {Timestamp} from "@firebase/firestore";

export type SongComment = {
    id: string
    team_id: string
    created_by: {
        id: string
        timestamp: Timestamp
    }
    song_id: string
    comment: string
    last_updated_time: Timestamp
}
