export interface Song {
  id: string
  bpm: Number
  created_by: {
    id: string
    time: Date
  }
  description: string
  last_used_time: Date
  lyrics: string
  original: {
    author: string
    url: string
  }
  storage_location: Array<string>
  tags: Array<string>
  team_id: string
  title: string
  updated_by: {
    id: string
    time: Date
  }
  version: string
  score: Number
}
