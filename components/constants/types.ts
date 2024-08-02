import {Song} from "@/models/song";


export interface ImageFileContainer {
  id: string
  file: File
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

export interface WorshipPlan {
  title: string
  description: string
  date: Date
  worshipSongWrappers: Array<WorshipSongWrapper>
  beginningSong: {
    id: string,
    key: string
  }
  endingSong: {
    id: string,
    key: string,
  }
}

export interface WorshipSongWrapper {
  note: string
  song: Song
  selectedKeys: Array<string>
}

export interface MusicSheetUrlWrapper {
  note: string
  urls: string[]
}
