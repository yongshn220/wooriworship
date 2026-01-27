import { Timestamp } from "firebase/firestore";

export interface Invitation {
  id: string
  invite_date: Timestamp
  invitation_status: Number
  receiver_email: string
  response_date: Date
  sender_id: string
  team_id: string
}
