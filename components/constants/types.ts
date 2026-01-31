import { SetlistSongHeader } from "@/models/setlist";


export interface ImageFileContainer {
  id: string
  file: File | null
  url: string
  isLoading: boolean
  isUploadedInDatabase: boolean
}

export interface MusicSheetContainer {
  id?: string
  tempId: string
  key: string
  note?: string
  imageFileContainers: Array<ImageFileContainer>
}

export interface WorshipInput {
  title: string
  description: string
  link: string
  date: Date
  worshipSongHeaders: Array<SetlistSongHeader>
  beginningSong: SetlistSongHeader
  endingSong: SetlistSongHeader
  service_tags: string[]
  serving_schedule_id?: string
}
