'use client'

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { MenuIcon, DoorOpenIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { getPathEditPlan, getPathPlan } from "@/components/util/helper/routes";
import { Button } from "@/components/ui/button";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { worshipLiveOptionsAtom } from "../_states/worship-detail-states";
import {
    MultipleSheetsViewSelect
} from "./multiple-sheets-view-select";
import { WorshipViewPageModeSelect } from "./worship-view-page-mode-select";
import { useState } from "react";
import { currentTeamWorshipIdsAtom, worshipAtom } from "@/global-states/worship-state";
import { WorshipService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";


interface Props {
    teamId: string,
    worshipId: string,
}

export function WorshipLiveMenu({ teamId, worshipId }: Props) {
    const [preference, prefSetter] = useUserPreferences()
    const [option, setOption] = useRecoilState(worshipLiveOptionsAtom)
    const router = useRouter()

    // Migrated from MenuButton
    const worship = useRecoilValue(worshipAtom(worshipId))
    const setCurrentWorshipIds = useSetRecoilState(currentTeamWorshipIdsAtom(teamId))
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    function handleExit() {
        router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
    }

    function toggleShowNoteOption() {
        setOption((prev) => ({ ...prev, showSongNote: !prev.showSongNote }))
        prefSetter.worshipLiveShowSongNote(!preference.worshipLive.showSongNote)
    }

    function toggleShowSongNumberOption() {
        setOption((prev) => ({ ...prev, showSongNumber: !prev.showSongNumber }))
        prefSetter.worshipLiveShowSongNumber(!preference.worshipLive.showSongNumber)
    }

    // Admin Actions
    function handleEditWorship() {
        router.push(getPathEditPlan(teamId, worshipId))
    }

    function handleDeleteWorship() {
        try {
            if (!worshipId) return Promise.resolve(false)

            WorshipService.deleteWorship(worshipId).then(isSuccess => {
                if (isSuccess) {
                    setCurrentWorshipIds(prev => prev.filter(_id => _id !== worshipId))
                    const title = worship?.title || "Worship"
                    toast({ title: `[${title}] is deleted successfully.` })
                }
                else {
                    toast({ title: "Something went wrong. Please try again later." })
                }
            })
            return Promise.resolve(true)
        }
        catch {
            console.log("error");
            return Promise.resolve(false)
        }
        finally {
            // Navigate back to plan list
            router.replace(getPathPlan(teamId))
        }
    }

    return (
        <div className="absolute top-2 right-2 bottom-10">
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                title={`Delete Worship`}
                description={`This will permanently delete [${worship?.title || "this worship"}]. This action cannot be undone.`}
                onDeleteHandler={handleDeleteWorship}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <div className="p-2 rounded-full hover:bg-black/5 cursor-pointer">
                        <MenuIcon />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="mr-4 p-2 space-y-2">
                    <div className="flex-between cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-sm" onClick={() => toggleShowNoteOption()}>
                        <Label>Show Song Note</Label>
                        <Switch className="data-[state=checked]:bg-blue-500" checked={option.showSongNote} />
                    </div>
                    <div className="flex-between cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-sm" onClick={() => toggleShowSongNumberOption()}>
                        <Label>Show Song Number</Label>
                        <Switch className="data-[state=checked]:bg-blue-500" checked={option.showSongNumber} />
                    </div>
                    <Separator />
                    {/* <div className="flex-between py-2 px-2 rounded-sm">
            <Label className="w-full">Multiple Sheets View</Label>
            <MultipleSheetsViewSelect/>
          </div> */}
                    <div className="flex-between py-2 px-2 rounded-sm">
                        <Label className="w-full">Page Mode</Label>
                        <WorshipViewPageModeSelect />
                    </div>
                    <Separator />
                    <Button disabled variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2">
                        <SquarePenIcon className="mr-3 w-5 h-5" />
                        <Label>Notating Mode</Label>
                    </Button>
                    <Separator />
                    {/* Admin Actions */}
                    <Button variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2" onClick={handleEditWorship}>
                        <SquarePenIcon className="mr-3 w-5 h-5" />
                        <Label>Edit Worship</Label>
                    </Button>
                    <Button variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2Icon className="mr-3 w-5 h-5" />
                        <Label>Delete Worship</Label>
                    </Button>
                    <Separator />
                    <Button variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2"
                        onClick={handleExit}>
                        <DoorOpenIcon className="mr-3 w-5 h-5" />
                        <Label>Exit Worship</Label>
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}
