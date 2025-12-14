"use client"

import { AnimatePresence, motion } from "framer-motion";
import { useRecoilState, useSetRecoilState } from "recoil";
import { worshipLiveOptionsAtom, worshipUIVisibilityAtom } from "../_states/worship-detail-states";
import { WorshipControlItem } from "./worship-control-item";
import { ChevronLeft, ChevronRight, EyeOff, FileText, Hash, MoreHorizontal } from "lucide-react";
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
    const [uiVisible, setUIVisible] = useRecoilState(worshipUIVisibilityAtom)
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
        <motion.div
            initial={false}
            animate={uiVisible ? "visible" : "hidden"}
            variants={{
                visible: {
                    bottom: "2rem",
                    left: "50%",
                    x: "-50%",
                    width: "auto", // Allow width to grow with content
                    height: "3.5rem",
                    borderRadius: "9999px",
                    paddingLeft: "0.25rem",
                    paddingRight: "0.25rem", // Constant 0.25rem padding
                    transition: { type: "spring", stiffness: 150, damping: 25, mass: 1.2, restDelta: 0.001 }
                },
                hidden: {
                    bottom: "2rem",
                    left: "1rem",
                    x: "0%",
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "9999px",
                    paddingLeft: "0.25rem",
                    paddingRight: "0.25rem", // Constant 0.25rem padding
                    transition: { type: "spring", stiffness: 150, damping: 25, mass: 1.2, restDelta: 0.001 }
                }
            }}
            style={{ minWidth: "3.5rem" }} // Constraint to prevent squashing below circle size
            className="fixed z-50 overflow-hidden flex items-center justify-start bg-background border border-border/50 shadow-toss"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Persistent Trigger Button - Always present */}
            <div className="flex-shrink-0 z-10 p-1">
                <WorshipControlItem
                    icon={uiVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    onClick={() => setUIVisible(!uiVisible)}
                    variant="button"
                />
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
                {uiVisible && (
                    <motion.div
                        initial={{ opacity: 0 }} // Removed scale animation to prevent layout recalculation issues
                        animate={{ opacity: 1, transition: { duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="flex items-center overflow-hidden whitespace-nowrap h-full pr-3" // added pr-3 (0.75rem) to compensate for outer padding
                    >
                        <div className="flex items-center gap-2 pr-1">
                            {/* Separator moved to start to divide trigger from content */}
                            <Separator orientation="vertical" className="h-6 bg-border w-[1px] mx-1" />

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

                            <Popover>
                                <PopoverTrigger asChild>
                                    <div>
                                        <WorshipControlItem icon={<MoreHorizontal className="w-5 h-5" />} />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent side="top" className="mb-4 bg-background backdrop-blur-xl border-border w-80 p-0 overflow-hidden shadow-toss rounded-2xl">
                                    <WorshipSettingsMenu teamId={teamId} worshipId={worshipId} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
