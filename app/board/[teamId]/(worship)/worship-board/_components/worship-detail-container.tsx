"use client";

import { useRecoilValueLoadable, waitForAll } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Worship } from "@/models/worship";
import { WorshipDetailView } from "./worship-detail-view";
import { useMemo } from "react";
import { WorshipListSkeleton } from "./worship-list-skeleton";

interface Props {
    worship: Worship;
    teamId: string;
}

export function WorshipDetailContainer({ worship, teamId }: Props) {
    // Fetch songs directly using existing headers
    const songIdList = useMemo(() => worship.songs?.map(s => s.id) || [], [worship.songs]);

    // Create an array of songAtoms to wait for
    const songsLoadable = useRecoilValueLoadable(
        waitForAll(songIdList.map(songId => songAtom({ teamId, songId })))
    );

    const songs = useMemo(() => {
        const list = songsLoadable.state === 'hasValue' ? songsLoadable.contents : [];
        return list.filter((s: any) => !!s);
    }, [songsLoadable]);

    // Note: We might want better loading state for songs, but skeleton is handled by parent for the whole container usually?
    // In SwipeableView, we want the container to be ready-ish.
    // If songs are loading, we can show empty list or skeleton in DetailView.

    return (
        <WorshipDetailView
            worship={worship}
            songs={songs}
            teamId={teamId}
            servingId={worship.serving_schedule_id}
        />
    );
}
