export interface Song {
  id: string
  team_id: string
  title: string
  description: string
  tags: Array<string>
  bpm: number
  version: string
  original: {
    author: string
    url: string
  }
  lyrics: string
  storage_location: Array<string>
  created_by: {
    id: string
    time: Date
  }
  last_used_time: Date
  updated_by: {
    id: string
    time: Date
  }
  key: string
}
