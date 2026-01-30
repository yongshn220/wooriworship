"use client"

import { SetlistLivePreference } from "./_components/setlist-live-preference";

export default function SetlistViewLayout({ children }: any) {
    return (
        <div className="w-full h-full">
            <SetlistLivePreference />
            {children}
        </div>
    )
}
