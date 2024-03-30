export interface Team {
  id: string
  name: string
  create_time: Date
  last_worship_time: Date
  leaders: Array<string>
  users: Array<string>
}
