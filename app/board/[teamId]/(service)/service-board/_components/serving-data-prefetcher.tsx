"use client";

import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { useServingMemberIds } from "../_hooks/use-serving-member-ids";

interface Props {
    schedule: ServiceFormState;
}

export function ServingDataPrefetcher({ schedule }: Props): null {
    const allMemberIds = useServingMemberIds(schedule);

    // access Recoil atom to trigger suspense/fetch
    // We don't need to render anything, just subscribing triggers the fetch.
    useRecoilValue(usersAtom(allMemberIds));

    return null;
}
