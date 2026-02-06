"use client"

import { SetlistLiveCarousel } from "./_components/setlist-live-carousel";
import { SetlistControlDock } from "./_components/setlist-control-dock";
import { SetlistIndexIndicator } from "./_components/setlist-index-indicator";
import { SetlistNote } from "./_components/setlist-note";
import { AnnotationEditor } from "./_components/annotation-editor";
import { annotationEditorTargetAtom } from "./_states/annotation-states";

import { useRef } from "react";
import { useRecoilValue } from "recoil";

export default function SetlistViewPage({ params }: any) {
    const teamId = params.teamId
    const serviceId = params.serviceId
    const containerRef = useRef<HTMLDivElement>(null)
    const editorTarget = useRecoilValue(annotationEditorTargetAtom)

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-background overflow-hidden touch-none"
        >
            <div className={editorTarget ? "hidden" : "contents"}>
                <SetlistLiveCarousel teamId={teamId} serviceId={serviceId} />
            </div>
            {editorTarget ? (
                <AnnotationEditor teamId={teamId} />
            ) : (
                <>
                    <SetlistNote constraintsRef={containerRef} />
                    <SetlistControlDock teamId={teamId} serviceId={serviceId} />
                    <SetlistIndexIndicator />
                </>
            )}
        </div>
    )
}
