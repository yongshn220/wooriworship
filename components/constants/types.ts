

export interface ImageFileContainer {
  id: string
  file: File
  url: string
  isLoading: boolean
}

export interface MusicSheetContainer {
  tempId: string
  key: string
  imageFileContainers: Array<ImageFileContainer>
}
