"use client";

import { useRecoilValue } from "recoil";
import { worshipSongListAtom } from "@/global-states/worship-state";
import { Worship } from "@/models/worship";

interface Props {
    worship: Worship;
}

export function WorshipDataPrefetcher({ worship }: Props): null {
    // Prefetch song list
    useRecoilValue(worshipSongListAtom(worship.id || ""));
    return null;
}
