'use client'

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/components/ui/use-toast";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {teamAtom} from "@/global-states/teamState";
import {SongService, StorageService, TagService} from "@/apis";
import {FormMode} from "@/components/constants/enums";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/util/helper/routes";
import {auth} from "@/firebase";
import {currentTeamSongIdsAtom, songAtom, songUpdaterAtom} from "@/global-states/song-state";
import {ImageFileContainer, MusicSheetContainer} from "@/components/constants/types";
import {v4 as uuid} from "uuid";
import MusicSheetService from "@/apis/MusicSheetService";
import {musicSheetIdsUpdaterAtom, musicSheetsBySongIdAtom, musicSheetUpdaterAtom} from "@/global-states/music-sheet-state";
import {MusicSheet} from "@/models/music_sheet";
import {getAllUrlsFromMusicSheetContainers, getAllUrlsFromSongMusicSheets} from "@/components/util/helper/helper-functions";
import {TagMultiSelect} from "@/app/board/[teamId]/(song)/song-board/_components/tag-multi-select";
import {LinkIcon, PlusIcon, X} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MusicSheetUploaderBox} from "@/components/elements/design/song/song-form/music-sheet-uploader-box";
import {BaseForm} from "@/components/elements/util/form/base-form";


interface Props {
  mode: FormMode
  teamId: string
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

export function SongForm({mode, teamId, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const songUpdater = useSetRecoilState(songUpdaterAtom)
  const musicSheetIdsUpdater = useSetRecoilState(musicSheetIdsUpdaterAtom)
  const musicSheetUpdater = useSetRecoilState(musicSheetUpdaterAtom) // todo: need to make it more efficient
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const authUser = auth.currentUser
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
      const newSongId = await SongService.addNewSong(authUser?.uid, teamId, songInput, musicSheetContainers)
      if (!newSongId) {
        console.log("err:song-board-form:handleCreate. Fail to create a song-board")
        toast({description: `Fail to create a song. Please try again.`})
        return
      }

      const uploadedMusicSheetContainers = await uploadMusicSheetContainers(musicSheetContainers)
      if (await MusicSheetService.addNewMusicSheets(authUser?.uid, newSongId, uploadedMusicSheetContainers) === false) {
        console.log("err:song-board-form:handleCreate. Fail to create music sheets."); return
      }

      if (await TagService.addNewTags(teamId, songInput.tags) === false) {
        console.log("err:song-board-form:handleCreate. Fail to create tags")
      }

      toast({
        title: `New Song Created!`,
        description: `${team?.name} - ${songInput.title}`,
      })

      setCurrentTeamSongIds((prev) => ([newSongId, ...prev])) // update song-board board (locally)
      router.push(getPathSongDetail(teamId, newSongId))
      clearContents()
    }
    catch (e) {
      console.log("err", e)
      toast({
        description: `Fail to create a song. Please try again.`,
      })
    }
    finally {
      clearContents()
      setIsLoading(false)
    }
  }

  function editValidCheck() {
    if (!authUser?.uid|| (song == null || song.id == null)) {
      setIsLoading(false)
      toast({
        title: "Fail to edit song-board",
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
      promises.push(SongService.updateSong(authUser?.uid, song?.id, songInput, musicSheetContainers));
      promises.push(TagService.addNewTags(teamId, songInput?.tags));

      await Promise.all(promises)

      musicSheetIdsUpdater(prev => prev + 1)
      musicSheetUpdater(prev => prev + 1)
      songUpdater(prev => prev + 1)

      toast({title: "Song edited successfully."})
      setIsLoading(false)
      router.push(getPathSongDetail(teamId, songId))
    }
    catch (e) {
      console.log(e)
    }
    finally {
      clearContents()
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

  function addImageFileContainerToMusicSheet(tempId: string, imageFileContainer: ImageFileContainer) {
    setMusicSheetContainers((prev) => {
      const result: Array<MusicSheetContainer> = []
      prev.forEach((_musicSheet) => {
        if (_musicSheet?.tempId === tempId) {
          const newMusicSheet = {..._musicSheet}
          newMusicSheet.imageFileContainers = [...newMusicSheet?.imageFileContainers.filter((iContainer) => iContainer?.id !== imageFileContainer?.id), imageFileContainer]
          result.push(newMusicSheet)
        }
        else {
          result.push(_musicSheet)
        }
      })
      return result
    })
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
    <BaseForm title={mode===FormMode.EDIT? "Edit Song" : "Add New Song"} description="Enter the details of your song below">
      <div className="w-full">
        <div className="w-full space-y-6">
          <div className="w-full gap-1.5">
            <Label className="w-full" htmlFor="name">Title</Label>
            <Input
              id="title"
              placeholder="Enter song title"
              value={songInput.title}
              onChange={(e) => setSongInput((prev => ({...prev, title: e.target.value})))}
              className="relative w-full bg-white"
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name">Sub Title</Label>
            <Input
              id="subtitle"
              placeholder="Enter subtitle (optional)"
              value={songInput.subtitle}
              onChange={(e) => setSongInput((prev => ({...prev, subtitle: e.target.value})))}
              className="bg-white"
              autoFocus={false}
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={songInput.author}
              onChange={(e) => setSongInput((prev => ({...prev, author: e.target.value})))}
              className="bg-white"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="Enter version">Version</Label>
            <Input
              id="version"
              placeholder="version"
              value={songInput.version}
              onChange={(e) => setSongInput((prev => ({...prev, version: e.target.value})))}
              className="bg-white"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="link">Link</Label>
            <div className="w-full relative">
              <Input
                id="link"
                placeholder="https://youtube.com/..."
                value={songInput.link}
                onChange={(e) => setSongInput((prev => ({...prev, link: e.target.value})))}
                className="w-full pl-9"
              />
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
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
              className="bg-white"
            />
          </div>
          <div className="flex-start flex-col items-center gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              className="h-20 bg-white text-base"
              placeholder="Enter song description"
              value={songInput.description}
              onChange={(e) => setSongInput((prev => ({...prev, description: e.target.value})))}
            />
          </div>
          <div className="w-full flex-start flex-col items-center gap-1.5">
            <div className="flex flex-between w-full justify-between">
              <h2 className="text-lg font-semibold">Music Sheets</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddNewMusicSheet}>
                <PlusIcon className="h-4 w-4 mr-2"/>
                Add Sheet
              </Button>
            </div>
            <div className="w-full flex flex-col space-y-4 rounded-lg border p-4">
              <>
                {
                  musicSheetContainers?.map((musicSheet, index) => (
                    <MusicSheetUploaderBox
                        key={index}
                        index={index}
                        musicKey={musicSheet.key}
                        setMusicKey={setKeyToMusicSheet}
                        tempId={musicSheet?.tempId}
                        imageFileContainers={musicSheet?.imageFileContainers}
                        handleSetImageFileContainers={setImageFileContainersToMusicSheet}
                        handleAddImageFileContainer={addImageFileContainerToMusicSheet}
                        handleRemoveImageFileContainer={removeImageFromMusicSheet}
                        handleRemoveMusicSheetContainer={removeMusicSheetContainer}
                      />
                  ))
                }
              </>
              <div className="w-full flex-center">
                <div
                  className="group w-full flex-center h-28 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer"
                  onClick={() => handleAddNewMusicSheet()}>
                  <p className="text-gray-400 group-hover:text-gray-500">click to add sheet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex-end my-10">
          <div>
            {
              (mode === FormMode.EDIT)
                ? <Button type="submit" onClick={handleEdit}>{isLoading ? "Saving..." : "Save"}</Button>
                : <Button type="submit" onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
            }
          </div>
        </div>
      </div>
    </BaseForm>
  )
}
