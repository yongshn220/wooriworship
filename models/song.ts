export interface Song {
    id: string
    bpm: Number
    created_by: {
        id: string
        time: Date
    }
    details: string
    last_used_time: Date
    lyrics: string
    original: {
        creator: string
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