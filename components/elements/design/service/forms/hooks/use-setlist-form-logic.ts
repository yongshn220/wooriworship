
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { toast } from "@/components/ui/use-toast";

// State & Models
import { auth } from "@/firebase";
import { setlistUpdaterAtom, setlistIdsUpdaterAtom, currentSetlistIdAtom } from "@/global-states/setlist-state";
import { SetlistSongHeader } from "@/models/setlist";
import { ServiceSetlist } from "@/models/services/ServiceEvent";
import { Timestamp } from "firebase/firestore";

// Services
import { SetlistApi } from "@/apis/SetlistApi";
import PushNotificationApi from "@/apis/PushNotificationApi";

interface UseSetlistFormLogicProps {
    teamId: string;
    serviceId: string;
    initialSetlist?: ServiceSetlist | null;
    serviceDate?: Timestamp;
    onCompleted?: () => void;
}

export function useSetlistFormLogic({ teamId, serviceId, initialSetlist, serviceDate, onCompleted }: UseSetlistFormLogicProps) {

    // Global updaters
    const setSetlistUpdater = useSetRecoilState(setlistUpdaterAtom);
    const setSetlistIdsUpdater = useSetRecoilState(setlistIdsUpdaterAtom);
    const setCurrentSetlistId = useSetRecoilState(currentSetlistIdAtom);

    // --- Form State ---

    // Basic Info (Context)
    const [basicInfo, setBasicInfo] = useState({
        description: initialSetlist?.description ?? "",
        link: initialSetlist?.link ?? "",
    });

    // Songs
    const [songs, setSongs] = useState<SetlistSongHeader[]>(initialSetlist?.songs ?? []);
    const [beginningSong, setBeginningSong] = useState<SetlistSongHeader | null>(initialSetlist?.beginning_song ?? null);
    const [endingSong, setEndingSong] = useState<SetlistSongHeader | null>(initialSetlist?.ending_song ?? null);

    const [isLoading, setIsLoading] = useState(false);

    // --- Handlers ---

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        try {
            await SetlistApi.updateSetlist(teamId, serviceId, {
                songs: songs,
                beginning_song: beginningSong ?? null,
                ending_song: endingSong ?? null,
                description: basicInfo.description,
                link: basicInfo.link
            });

            toast({ title: "Setlist updated" });

            // Send notification to team
            const url = `/board/${teamId}/service-board`;
            PushNotificationApi.notifyTeamSetlistUpdate(teamId, auth.currentUser?.uid || "", url).catch(console.error);

            // Trigger global updates
            setSetlistUpdater(prev => prev + 1);
            setSetlistIdsUpdater(prev => prev + 1);

            // Call completion handler
            if (onCompleted) {
                onCompleted();
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // State
        basicInfo, setBasicInfo,
        songs, setSongs,
        beginningSong, setBeginningSong,
        endingSong, setEndingSong,
        isLoading,

        // Actions
        handleSave,
    };
}
