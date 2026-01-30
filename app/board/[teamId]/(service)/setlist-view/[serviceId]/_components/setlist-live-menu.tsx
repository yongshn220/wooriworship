'use client'

import { useRecoilState } from "recoil";
import { MenuIcon, DoorOpenIcon, SquarePenIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { getPathServing } from "@/components/util/helper/routes";
import { Button } from "@/components/ui/button";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { setlistLiveOptionsAtom } from "../_states/setlist-view-states";
import { MultipleSheetsViewSelect } from "./multiple-sheets-view-select";
import { SetlistViewPageModeSelect } from "./setlist-view-page-mode-select";


interface Props {
    teamId: string,
    serviceId: string,
}

export function SetlistLiveMenu({ teamId, serviceId }: Props) {
    const [preference, prefSetter] = useUserPreferences()
    const [option, setOption] = useRecoilState(setlistLiveOptionsAtom)
    const router = useRouter()

    function handleExit() {
        router.replace(getPathServing(teamId))
    }

    function toggleShowNoteOption() {
        setOption((prev) => ({ ...prev, showSongNote: !prev.showSongNote }))
        prefSetter.setlistLiveShowSongNote(!preference.setlistLive.showSongNote)
    }

    function toggleShowSongNumberOption() {
        setOption((prev) => ({ ...prev, showSongNumber: !prev.showSongNumber }))
        prefSetter.setlistLiveShowSongNumber(!preference.setlistLive.showSongNumber)
    }

    return (
        <div className="absolute top-2 right-2 bottom-10">
            <Popover>
                <PopoverTrigger asChild>
                    <div className="p-2 rounded-full hover:bg-muted cursor-pointer">
                        <MenuIcon />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="mr-4 p-2 space-y-2">
                    <div className="flex-between cursor-pointer hover:bg-muted py-2 px-2 rounded-sm" onClick={() => toggleShowNoteOption()}>
                        <Label>Show Song Note</Label>
                        <Switch className="data-[state=checked]:bg-primary" checked={option.showSongNote} />
                    </div>
                    <div className="flex-between cursor-pointer hover:bg-muted py-2 px-2 rounded-sm" onClick={() => toggleShowSongNumberOption()}>
                        <Label>Show Song Number</Label>
                        <Switch className="data-[state=checked]:bg-primary" checked={option.showSongNumber} />
                    </div>
                    <Separator />
                    <div className="flex-between py-2 px-2 rounded-sm">
                        <Label className="w-full">Page Mode</Label>
                        <SetlistViewPageModeSelect />
                    </div>
                    <Separator />
                    <Button disabled variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-muted pl-2">
                        <SquarePenIcon className="mr-3 w-5 h-5" />
                        <Label>Notating Mode</Label>
                    </Button>
                    <Separator />
                    <Button variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-muted pl-2"
                        onClick={handleExit}>
                        <DoorOpenIcon className="mr-3 w-5 h-5" />
                        <Label>Exit</Label>
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}
