import { Timestamp } from "firebase/firestore";

export type Notice = {
    id: string
    team_id: string
    created_by: {
        id: string
        time: Timestamp
    }
    title: string
    body: string
    last_updated_time: Timestamp
    file_urls: Array<string>
}
