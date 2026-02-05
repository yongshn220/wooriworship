"use client"

import { AnimatePresence, motion } from "framer-motion";
import { useRecoilState, useSetRecoilState } from "recoil";
import { setlistLiveOptionsAtom, setlistUIVisibilityAtom } from "../_states/setlist-view-states";
import { SetlistControlItem } from "./setlist-control-item";
import { LogOut, ChevronLeft, ChevronRight, FileText, Hash, MoreHorizontal, Pencil } from "lucide-react";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SetlistSettingsMenu } from "./setlist-settings-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getPathServing } from "@/components/util/helper/routes";
import { useState } from "react";
import { DownloadSetlistSheetsDrawer } from "./download-setlist-sheets-drawer";
import { annotationDrawingModeAtom } from "../_states/annotation-states";
import { setlistMultipleSheetsViewModeAtom } from "../_states/setlist-view-states";
import { DirectionType } from "@/components/constants/enums";
import { toast } from "@/components/ui/use-toast";

interface Props {
    teamId: string
    serviceId: string
}

export function SetlistControlDock({ teamId, serviceId }: Props) {
    const [option, setOption] = useRecoilState(setlistLiveOptionsAtom)
    const [uiVisible, setUIVisible] = useRecoilState(setlistUIVisibilityAtom)
    const [preference, prefSetter] = useUserPreferences()
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] = useState(false)
    const [drawingMode, setDrawingMode] = useRecoilState(annotationDrawingModeAtom)
    const [multipleSheetsViewMode, setMultipleSheetsViewMode] = useRecoilState(setlistMultipleSheetsViewModeAtom)
    const router = useRouter()

    function handleExit() {
        router.replace(getPathServing(teamId))
    }

    function toggleShowNote() {
        const newVal = !option.showSongNote
        setOption(prev => ({ ...prev, showSongNote: newVal }))
        prefSetter.setlistLiveShowSongNote(newVal)
    }

    function toggleShowNumber() {
        const newVal = !option.showSongNumber
        setOption(prev => ({ ...prev, showSongNumber: newVal }))
        prefSetter.setlistLiveShowSongNumber(newVal)
    }

    function toggleDrawingMode() {
        const newVal = !drawingMode
        if (newVal && multipleSheetsViewMode === DirectionType.VERTICAL) {
            setMultipleSheetsViewMode(DirectionType.HORIZONTAL)
            toast({ description: "가로 보기로 전환됩니다" })
        }
        setDrawingMode(newVal)
    }

    return (
        <div className={cn(
            "fixed bottom-8 left-0 w-full z-[10002] pointer-events-none flex",
            uiVisible ? "justify-center" : "justify-start pl-4"
        )}>
            <motion.div
                layout
                initial={false}
                animate={uiVisible ? "visible" : "hidden"}
                variants={{
                    visible: {
                        borderRadius: "9999px",
                        backgroundColor: "var(--background)",
                        backdropFilter: "none",
                        WebkitBackdropFilter: "none",
                        borderColor: "rgba(140, 140, 140, 0.2)",
                        boxShadow: "0 1px 3px 0px rgba(0, 0, 0, 0.1)",
                        transition: { type: "spring", stiffness: 150, damping: 25, mass: 1.2 }
                    },
                    hidden: {
                        borderRadius: "9999px",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        backdropFilter: "none",
                        WebkitBackdropFilter: "none",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 1px 3px 0px rgba(0, 0, 0, 0.4)",
                        transition: { type: "spring", stiffness: 150, damping: 25, mass: 1.2 }
                    }
                }}
                className="pointer-events-auto overflow-hidden flex items-center p-1"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <motion.div layout className="flex-shrink-0 z-10 p-0">
                    <SetlistControlItem
                        icon={uiVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        onClick={() => setUIVisible(!uiVisible)}
                        variant="button"
                    />
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {uiVisible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.3 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="flex items-center overflow-hidden whitespace-nowrap h-full pr-3"
                        >
                            <div className="flex items-center gap-2">
                                <Separator orientation="vertical" className="h-6 bg-border w-[1px] mx-1" />

                                <SetlistControlItem
                                    icon={<Pencil className="w-5 h-5" />}
                                    isActive={drawingMode}
                                    variant="toggle"
                                    onClick={toggleDrawingMode}
                                />

                                <SetlistControlItem
                                    icon={<FileText className="w-5 h-5" />}
                                    isActive={option.showSongNote}
                                    variant="toggle"
                                    onClick={toggleShowNote}
                                />
                                <SetlistControlItem
                                    icon={<Hash className="w-5 h-5" />}
                                    isActive={option.showSongNumber}
                                    variant="toggle"
                                    onClick={toggleShowNumber}
                                />

                                <Popover modal={true} open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <div>
                                            <SetlistControlItem icon={<MoreHorizontal className="w-5 h-5" />} />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" className="mb-4 bg-background backdrop-blur-xl border-border w-80 p-0 overflow-hidden shadow-toss rounded-2xl z-[10003]">
                                        <SetlistSettingsMenu teamId={teamId} serviceId={serviceId} onDownloadSheets={() => { setIsPopoverOpen(false); setIsDownloadDrawerOpen(true); }} />
                                    </PopoverContent>
                                </Popover>

                                <DownloadSetlistSheetsDrawer
                                    teamId={teamId}
                                    serviceId={serviceId}
                                    open={isDownloadDrawerOpen}
                                    onOpenChange={setIsDownloadDrawerOpen}
                                />

                                <Separator orientation="vertical" className="h-6 bg-border w-[1px]" />

                                <SetlistControlItem
                                    icon={<LogOut className="w-5 h-5" />}
                                    variant="button"
                                    onClick={handleExit}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div >
    )
}
