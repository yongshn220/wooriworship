"use client";

import { useRecoilValue, waitForAll } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Worship } from "@/models/worship";

interface Props {
    worship: Worship;
}

export function WorshipDataPrefetcher({ worship }: Props): null {
    // Prefetch individual songs consistent with WorshipDetailContainer
    // We can't use hooks in loop, so we map to list of atoms?
    // Recoil doesn't support hook in loop.
    // We should use waitForAll or just a dummy component? 
    // Or we can construct a single atom/selector that depends on all of them?

    /* 
       Optimally, we should just fire off the requests. 
       In Recoil, just accessing them via a selector works.
       Let's use the same logic as WorshipDetailContainer: waitForAll.
    */

    const teamId = worship.team_id;
    const songIdList = worship.songs?.map(s => s.id) || [];

    // Check if we have songs to prefetch
    if (songIdList.length > 0 && teamId) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useRecoilValue(waitForAll(songIdList.map(songId => songAtom({ teamId, songId }))));
    }

    return null;
}
