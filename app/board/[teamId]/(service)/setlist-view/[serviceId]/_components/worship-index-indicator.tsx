import { useRecoilValue, useSetRecoilState } from "recoil";
import { cn } from "@/lib/utils";
import * as React from "react";
import { worshipIndexAtom, worshipIndexChangeEventAtom, worshipLiveOptionsAtom } from "../_states/worship-detail-states";


export function WorshipIndexIndicator() {
    const menu = useRecoilValue(worshipLiveOptionsAtom)
    const index = useRecoilValue(worshipIndexAtom)
    const setWorshipIndexChangeEvent = useSetRecoilState(worshipIndexChangeEventAtom)

    return (
        <div className={cn(
            "fixed right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5",
            "transition-opacity duration-300",
            menu.showSongNumber ? "opacity-100" : "opacity-0 pointer-events-none",
            "pointer-events-auto"
        )}>
            <div className="absolute top-2 bottom-2 w-[3px] bg-transparent rounded-full" />

            {
                Array.from(Array(index.total)).map((_, i) => (
                    (i !== index.current) ?
                        <div key={i} className="relative z-10 group w-6 h-6 flex-center cursor-pointer" onClick={() => setWorshipIndexChangeEvent(i)}>
                            <div className="w-1 h-1 bg-gray-400/50 rounded-full transition-all duration-300 group-hover:bg-foreground/50 group-hover:scale-150 shadow-sm" />
                        </div>
                        :
                        <div key={i} className="relative z-10 flex-center w-6 h-6 bg-primary rounded-full font-bold text-primary-foreground text-xs shadow-lg border border-primary-foreground/10">{i + 1}</div>
                ))
            }
        </div>
    )
}
