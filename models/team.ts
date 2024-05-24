import {Timestamp} from "@firebase/firestore";

export interface Team {
  id: string
  name: string
  create_time: Timestamp
  last_worship_time: Timestamp
  leaders: Array<string>
  users: Array<string>
}
