"use client";

import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServingSchedule } from "@/models/serving";
import { useServingMemberIds } from "../_hooks/use-serving-member-ids";

interface Props {
    schedule: ServingSchedule;
}

export function ServingDataPrefetcher({ schedule }: Props) {
    const allMemberIds = useServingMemberIds(schedule);

    // access Recoil atom to trigger suspense/fetch
    // We don't need to render anything, just subscribing triggers the fetch.
    useRecoilValue(usersAtom(allMemberIds));

    return null;
}
