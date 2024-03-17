export interface User {
    id: string
    name: string
    email: string
    created_time: Date
    last_logged_in_time: Date
    teams: Array<string>
  }