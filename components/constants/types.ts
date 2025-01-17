import {WorshipSongHeader} from "@/models/worship";


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
  imageFileContainers: Array<ImageFileContainer>
}

export interface WorshipInput {
  title: string
  description: string
  link: string
  date: Date
  worshipSongHeaders: Array<WorshipSongHeader>
  beginningSong: WorshipSongHeader
  endingSong: WorshipSongHeader
}
