"use client";

import { useRecoilValueLoadable } from "recoil";
import { worshipSongListAtom } from "@/global-states/worship-state";
import { Worship } from "@/models/worship";
import { WorshipDetailView } from "./worship-detail-view";
import { useMemo } from "react";
import { WorshipListSkeleton } from "./worship-list-skeleton";

interface Props {
    worship: Worship;
    teamId: string;
}

export function WorshipDetailContainer({ worship, teamId }: Props) {
    // Fetch songs for the worship plan
    const songsLoadable = useRecoilValueLoadable(worshipSongListAtom(worship.id || ""));

    const songs = useMemo(() => {
        return songsLoadable.state === 'hasValue' ? songsLoadable.contents : [];
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
