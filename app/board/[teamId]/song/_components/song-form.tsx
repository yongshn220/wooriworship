'use client'

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {TagMultiSelect} from "@/app/board/[teamId]/song/_components/tag-multi-select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import MultipleImageUploader from "@/app/board/[teamId]/song/_components/multiple-image-uploader";
import {MusicSheetCard} from "@/app/board/[teamId]/song/_components/music-sheet-card";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {SongService, StorageService, TagService} from "@/apis";
import {FormMode} from "@/components/constants/enums";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {auth} from "@/firebase";
import {currentTeamSongIdsAtom, songAtom, songUpdaterAtom} from "@/global-states/song-state";
import useViewportHeight from "@/components/hook/use-viewport-height";
import PdfUploader from "@/app/board/[teamId]/song/_components/pdf-uploader";
import {ImageFileContainer, MusicSheetContainer} from "@/components/constants/types";
import {PlusIcon} from "lucide-react";
import {v4 as uuid} from "uuid";
import {Cross2Icon} from "@radix-ui/react-icons";
import MusicSheetService from "@/apis/MusicSheetService";
import {musicSheetIdsUpdaterAtom, musicSheetsBySongIdAtom, musicSheetUpdaterAtom} from "@/global-states/music-sheet-state";
import {MusicSheet} from "@/models/music_sheet";
import {getAllUrlsFromMusicSheetContainers, getAllUrlsFromSongMusicSheets} from "@/components/helper/helper-functions";


interface Props {
  mode: FormMode
  isOpen: boolean
  setIsOpen: Function
  songId?: string
}
export interface SongInput {
  title: string
  subtitle: string
  author: string
  version: string
  link: string
  tags: Array<string>
  bpm: number | null
  description: string
}

export function SongForm({mode, isOpen, setIsOpen, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const songUpdater = useSetRecoilState(songUpdaterAtom)
  const musicSheetIdsUpdater = useSetRecoilState(musicSheetIdsUpdaterAtom)
  const musicSheetUpdater = useSetRecoilState(musicSheetUpdaterAtom) // todo: need to make it more efficient
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom(teamId))
  const [songInput, setSongInput] = useState<SongInput>({
    title: (mode === FormMode.EDIT)? song?.title?? "" : "",
    subtitle: (mode === FormMode.EDIT)? song?.subtitle?? "" : "",
    author: (mode === FormMode.EDIT)? song?.original.author?? "" : "",
    version: (mode === FormMode.EDIT)? song?.version?? "" : "",
    link: (mode === FormMode.EDIT)? song?.original.url?? "" : "",
    tags: (mode === FormMode.EDIT)? song?.tags?? [] : [],
    bpm: (mode === FormMode.EDIT)? song?.bpm?? null : null,
    description: (mode === FormMode.EDIT)? song?.description?? "" : ""
  })
  const [musicSheetContainers, setMusicSheetContainers] = useState<Array<MusicSheetContainer>>([])
  const [isLoading, setIsLoading] = useState(false)
  const viewportHeight = useViewportHeight();
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (mode === FormMode.EDIT) {
      const _musicSheetContainers: MusicSheetContainer[] = []
      musicSheets?.forEach((musicSheet) => {
        const mContainer: MusicSheetContainer = {
          id: musicSheet?.id,
          tempId: uuid(),
          key: musicSheet?.key,
          imageFileContainers: musicSheet?.urls?.map(url => {
            const iContainer: ImageFileContainer = {id: "", file: null, url: url, isLoading: false, isUploadedInDatabase: true}
            return iContainer
          })
        }
        _musicSheetContainers.push(mContainer)
      })
      setMusicSheetContainers(_musicSheetContainers)
    }
  }, [mode, musicSheets])

  function createValidCheck() {
    if (!authUser?.uid) {
      console.log("error");
      setIsOpen(false)
      setIsLoading(false)
      return false
    }
    return true
  }

  function clearContents() {
    const songInput: SongInput = {title: "", subtitle: "", author: "", version: "", link: "", tags: [], bpm: null, description: ""}
    setSongInput(songInput)
    setMusicSheetContainers([])
  }

  async function handleCreate() {
    setIsLoading(true)
    if (!createValidCheck()) return false

    try {
      const newSongId = await SongService.addNewSong(authUser?.uid, teamId, songInput)
      if (!newSongId) {
        console.log("err:song-form:handleCreate. Fail to create a song")
        toast({description: `Fail to create a song. Please try again.`})
        return
      }

      const uploadedMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      if (await MusicSheetService.addNewMusicSheets(authUser?.uid, newSongId, uploadedMusicSheetContainers) === false) {
        console.log("err:song-form:handleCreate. Fail to create music sheets."); return
      }

      if (await TagService.addNewTags(teamId, songInput.tags) === false) {
        console.log("err:song-form:handleCreate. Fail to create tags")
      }

      toast({
        title: `New Song Created!`,
        description: `${team?.name} - ${songInput.title}`,
      })

      setCurrentTeamSongIds((prev) => ([newSongId, ...prev])) // update song board (locally)
      router.push(getPathSongDetail(teamId, newSongId))
      clearContents()
    }
    catch (e) {리
      console.log("err", e)
      toast({
        description: `Fail to create a song. Please try again.`,
      })
    }
    finally {
      clearContents()
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  function editValidCheck() {
    if (!authUser?.uid|| (song == null || song.id == null)) {
      setIsOpen(false)
      setIsLoading(false)
      toast({
        title: "Fail to edit song",
        description: "Something went wrong. Please try again later."
      })
      return false
    }
    return true
  }

  async function handleEdit() {
    setIsLoading(true)
    if (!editValidCheck()) return false

    try {
      const promises = [];

      // Delete music sheet images if removed.
      const newMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      const urlsToDelete = getRemovedMusicSheetUrls(musicSheets, newMusicSheetContainers)
      promises.push(StorageService.deleteFileByUrls(urlsToDelete))

      // Delete music sheet document if removed.
      const musicSheetIdsToDelete = getRemovedMusicSheetIds(musicSheets, newMusicSheetContainers)
      musicSheetIdsToDelete.forEach(id => {
        promises.push(MusicSheetService.delete(id))
      })

      // Update music sheet
      newMusicSheetContainers.forEach(mContainer => {
        promises.push(MusicSheetService.updateMusicSheet(authUser?.uid, song?.id, mContainer))
      })
      // Update Song and tags
      promises.push(SongService.updateSong(authUser?.uid, song?.id, songInput));
      promises.push(TagService.addNewTags(teamId, songInput?.tags));

      await Promise.all(promises)

      musicSheetIdsUpdater(prev => prev + 1)
      musicSheetUpdater(prev => prev + 1)
      songUpdater(prev => prev + 1)

      toast({title: "Song edited successfully."})
      setIsOpen(false)
      setIsLoading(false)
    }
    catch (e) {
      console.log(e)
    }
    finally {
      clearContents()
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  async function uploadMusicSheetContainers(_musicSheetContainers: MusicSheetContainer[]) {
    const newMusicSheetContainers = []
    for (const mContainer of _musicSheetContainers) {
      const newMContainer = await StorageService.uploadMusicSheetContainer(teamId, mContainer)
      if (!newMContainer) {
        console.log("Song:handleCreate: fail to upload music sheet container."); continue
      }
      newMusicSheetContainers.push(newMContainer)
    }
    return newMusicSheetContainers
  }

  function getRemovedMusicSheetUrls(prevMusicSheets: MusicSheet[], newMusicSheetContainers: MusicSheetContainer[]) {
    const prevUrls = getAllUrlsFromSongMusicSheets(prevMusicSheets)
    const newUrls = getAllUrlsFromMusicSheetContainers(newMusicSheetContainers)
    return prevUrls.filter((pUrl) => !newUrls.includes(pUrl))
  }

  function getRemovedMusicSheetIds(prevMusicSheets: MusicSheet[], newMusicSheetContainers: MusicSheetContainer[]) {
    const prevIds = prevMusicSheets?.map(ms => ms?.id)
    const newIds = newMusicSheetContainers?.map(mContainer => mContainer?.id)
    return prevIds.filter(pId => !newIds.includes(pId))
  }

  function handleAddNewMusicSheet() {
    setMusicSheetContainers((prev) => ([...prev, {
      tempId: uuid(),
      key: "",
      imageFileContainers: []
    }]))
  }

  function setKeyToMusicSheet(tempId: string, key: string) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => (musicSheet?.tempId === tempId)? {...musicSheet, key: key} : musicSheet)]))
  }
  function setImageFileContainersToMusicSheet(tempId: string, imageFileContainers: Array<ImageFileContainer>) {
    setMusicSheetContainers((prev) => ([
        ...prev.map((musicSheet) => ((musicSheet?.tempId === tempId)? {...musicSheet, imageFileContainers} : musicSheet))
      ])
    )
  }
  function removeImageFromMusicSheet(tempId: string, imageFileContainerIndex: number) {
    setMusicSheetContainers((prev) => ([...prev.map((musicSheet) => {
      if (musicSheet.tempId !== tempId) return musicSheet

      const newImageFileContainers = musicSheet.imageFileContainers.filter((_, index) => index !== imageFileContainerIndex)
      return {...musicSheet, imageFileContainers: newImageFileContainers}
    })]))
  }

  function removeMusicSheetContainer(tempId: string) {
    setMusicSheetContainers((prev) => ([...prev.filter(mContainer => mContainer.tempId !== tempId) ]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide top-0 translate-y-0 mt-[50px]" style={{ maxHeight: `${viewportHeight - 100}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode===FormMode.EDIT? "Edit Song" : "Add New Song"}</DialogTitle>
          <DialogDescription>
            {mode===FormMode.EDIT? "Edit song" : "Create and add new song in the song board"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Title</Label>
            <Input
              id="title"
              placeholder="ex) Amazing Grace"
              value={songInput.title}
              onChange={(e) => setSongInput((prev => ({...prev, title: e.target.value})))}
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Sub Title</Label>
            <Input
              id="subtitle"
              placeholder="Sub Title..."
              value={songInput.subtitle}
              onChange={(e) => setSongInput((prev => ({...prev, subtitle: e.target.value})))}
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="ex) Isaiah6tyone"
              value={songInput.author}
              onChange={(e) => setSongInput((prev => ({...prev, author: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="version"
              value={songInput.version}
              onChange={(e) => setSongInput((prev => ({...prev, version: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              placeholder="https://youtube..."
              value={songInput.link}
              onChange={(e) => setSongInput((prev => ({...prev, link: e.target.value})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <TagMultiSelect input={songInput} setInput={setSongInput}/>
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="bpm">BPM</Label>
            <Input
              id="bpm"
              type="number"
              placeholder="ex) 120"
              defaultValue={songInput.bpm ?? ""}
              onChange={(e) => setSongInput((prev => ({...prev, bpm: Number(e.target.value)})))}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              className="h-20"
              placeholder="Write the description"
              value={songInput.description}
              onChange={(e) => setSongInput((prev => ({...prev, description: e.target.value})))}
            />
          </div>
          <div className="w-full flex-start flex-col items-center gap-1.5">
            <Label>
              Music Sheets
            </Label>
            <div className="w-full flex flex-col gap-4">
              {
                musicSheetContainers?.map((musicSheet, index) => (
                  <MusicSheetUploadBox
                    key={index}
                    musicKey={musicSheet.key}
                    setMusicKey={setKeyToMusicSheet}
                    tempId={musicSheet?.tempId}
                    imageFileContainers={musicSheet?.imageFileContainers}
                    handleSetImageFileContainers={setImageFileContainersToMusicSheet}
                    handleRemoveImageFileContainer={removeImageFromMusicSheet}
                    handleRemoveMusicSheetContainer={removeMusicSheetContainer}
                  />
                ))
              }
            </div>
            <div className="w-full flex-center mt-4">
              <div className="flex-center w-10 h-10 bg-blue-500 text-white text-4xl rounded-full hover:bg-blue-400 cursor-pointer" onClick={() => handleAddNewMusicSheet()}>
                <PlusIcon/>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          {
            (mode === FormMode.EDIT)
              ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
              : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MusicSheetUploadBoxProps {
  tempId: string
  musicKey: string
  setMusicKey: Function
  imageFileContainers: Array<ImageFileContainer>
  handleSetImageFileContainers: Function
  handleRemoveImageFileContainer: Function
  handleRemoveMusicSheetContainer: Function
}

function MusicSheetUploadBox({tempId, imageFileContainers, musicKey, setMusicKey, handleSetImageFileContainers, handleRemoveImageFileContainer, handleRemoveMusicSheetContainer}: MusicSheetUploadBoxProps) {
  function updateImageFileContainer(newContainer: ImageFileContainer) {
   console.log(tempId)
    if (imageFileContainers.map((_container) => _container.id).includes(newContainer.id)) {
      const newContainers = imageFileContainers.map((_container) => (_container.id !== newContainer.id)? _container : newContainer)
      handleSetImageFileContainers(tempId, newContainers)
    }
    else {
      handleSetImageFileContainers(tempId, [...imageFileContainers, newContainer])
    }
  }

  return (
    <div className="relative w-full border bg-gray-100 rounded-lg p-2 space-y-4">
      <Cross2Icon className="absolute right-1 top-1 cursor-pointer rounded-full hover:text-blue-500" width={20} height={20} onClick={() => handleRemoveMusicSheetContainer(tempId)}/>
      <div className="flex items-center gap-4">
        <Label htmlFor="key">Key</Label>
        <Input
          id="key"
          placeholder="ex) Em"
          value={musicKey ?? ""}
          onChange={(e) => setMusicKey(tempId, e.target.value)}
          className="bg-white max-w-sm"
        />
      </div>
      {
        imageFileContainers?.length > 0 &&
        <div className="flex-start w-full h-60 aspect-square">
          <div className="flex w-full h-full gap-4 overflow-x-auto">
            {
              imageFileContainers?.map((imageFileContainer, i) => (
                <MusicSheetCard key={i} imageFileContainer={imageFileContainer} index={i} handleRemoveImage={(index: number) => handleRemoveImageFileContainer(tempId, index)}/>
              ))
            }
          </div>
        </div>
      }
      <div className="w-full flex-center">
        <div className="flex gap-4">
          <MultipleImageUploader imageFileContainers={imageFileContainers} updateImageFileContainer={updateImageFileContainer} maxNum={5}>
            <div className="w-32 bg-white px-1 py-2 flex-center  rounded-md shadow-sm border text-sm hover:bg-blue-50 cursor-pointer">Upload Image</div>
          </MultipleImageUploader>
          <PdfUploader updateImageFileContainer={updateImageFileContainer}>
            <div className="w-32 bg-white px-1 py-2 flex-center  rounded-md shadow-sm border text-sm hover:bg-blue-50 cursor-pointer">Upload PDF</div>
          </PdfUploader>
        </div>
      </div>
    </div>
  )
}
