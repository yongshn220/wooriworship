"use client"

import { motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { worshipLiveOptionsAtom } from "../_states/worship-detail-states";
import { WorshipControlItem } from "./worship-control-item";
import { FileText, Hash, MoreHorizontal } from "lucide-react";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WorshipSettingsMenu } from "./worship-settings-menu";
import { Separator } from "@/components/ui/separator";

interface Props {
    teamId: string
    worshipId: string
}

export function WorshipControlDock({ teamId, worshipId }: Props) {
    const [option, setOption] = useRecoilState(worshipLiveOptionsAtom)
    const [preference, prefSetter] = useUserPreferences()

    function toggleShowNote() {
        const newVal = !option.showSongNote
        setOption(prev => ({ ...prev, showSongNote: newVal }))
        prefSetter.worshipLiveShowSongNote(newVal)
    }

    function toggleShowNumber() {
        const newVal = !option.showSongNumber
        setOption(prev => ({ ...prev, showSongNumber: newVal }))
        prefSetter.worshipLiveShowSongNumber(newVal)
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
                <WorshipControlItem
                    icon={<FileText className="w-5 h-5" />}
                    isActive={option.showSongNote}
                    variant="toggle"
                    onClick={toggleShowNote}
                />
                <WorshipControlItem
                    icon={<Hash className="w-5 h-5" />}
                    isActive={option.showSongNumber}
                    variant="toggle"
                    onClick={toggleShowNumber}
                />

                <Separator orientation="vertical" className="h-6 bg-white/10 w-[1px] mx-1" />

                <Popover>
                    <PopoverTrigger asChild>
                        <div>
                            <WorshipControlItem icon={<MoreHorizontal className="w-5 h-5" />} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="mb-4 bg-white/90 backdrop-blur-xl border-white/20 w-64 p-0 overflow-hidden shadow-2xl rounded-2xl">
                        <WorshipSettingsMenu teamId={teamId} worshipId={worshipId} />
                    </PopoverContent>
                </Popover>
            </motion.nav>
        </div>
    )
}
