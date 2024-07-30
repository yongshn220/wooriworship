import {Song} from "@/models/song";


export interface ImageFileContainer {
  id: string
  file: File
  url: string
  isLoading: boolean
  isUploadedInDatabase: boolean
}

export interface MusicSheetContainer {
  tempId: string
  key: string
  imageFileContainers: Array<ImageFileContainer>
}

export interface WorshipPlan {
  title: string
  description: string
  date: Date
  worshipSongWrappers: Array<WorshipSongWrapper>
  beginningSongId: string
  endingSongId: string
}

export interface WorshipSongWrapper {
  note: string
  song: Song
  selectedKeys: Array<string>
}


