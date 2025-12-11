import { useRecoilValue, useSetRecoilState } from "recoil";
import { cn } from "@/lib/utils";
import * as React from "react";
import { isMobile } from "@/components/util/helper/helper-functions";
import { worshipIndexAtom, worshipIndexChangeEventAtom, worshipLiveOptionsAtom } from "../_states/worship-detail-states";


export function WorshipIndexIndicator() {
    const menu = useRecoilValue(worshipLiveOptionsAtom)
    const index = useRecoilValue(worshipIndexAtom)
    const setWorshipIndexChangeEvent = useSetRecoilState(worshipIndexChangeEventAtom)

    return (
        <div className={cn(
            "fixed right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-1 rounded-full",
            "bg-black/10 backdrop-blur-sm border border-white/5 shadow-lg shadow-black/5",
            "transition-opacity duration-300",
            menu.showSongNumber ? "opacity-100" : "opacity-0 pointer-events-none",
            "pointer-events-auto"
        )}>
            {
                Array.from(Array(index.total)).map((_, i) => (
                    (i !== index.current) ?
                        <div key={i} className="group w-6 h-6 flex-center cursor-pointer" onClick={() => setWorshipIndexChangeEvent(i)}>
                            <div className="w-1 h-1 bg-white/40 rounded-full transition-all duration-300 group-hover:bg-white group-hover:scale-150" />
                        </div>
                        :
                        <div key={i} className="flex-center w-6 h-6 bg-blue-500 rounded-full font-bold text-white text-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] border border-white/10">{i + 1}</div>
                ))
            }
        </div>
    )
}
