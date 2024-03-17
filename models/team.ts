export interface Team {
  id: string
  name: string
  create_time: Date
  last_worship_time: Date
  leader_id: string
  users: Array<string>
}
