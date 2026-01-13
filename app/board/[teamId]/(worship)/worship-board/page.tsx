"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { format } from "date-fns";
import WorshipService from "@/apis/WorshipService";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { CalendarStrip } from "@/components/common/board-calendar/calendar-strip";
import { CalendarItem } from "@/components/common/board-calendar/types";
import { useCalendarNavigation } from "@/components/common/hooks/use-calendar-navigation";
import { WorshipDetailContainer } from "./_components/worship-detail-container";
import { SwipeableView } from "@/components/elements/design/serving/swipeable-view";
import { WorshipDataPrefetcher } from "./_components/worship-data-prefetcher";
import { EmptyWorshipBoardPage } from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/empty-worship-board-page";
import { WorshipListSkeleton } from "./_components/worship-list-skeleton";
import { Worship } from "@/models/worship";
import { teamAtom } from "@/global-states/teamState";
import { worshipIdsUpdaterAtom, currentWorshipIdAtom } from "@/global-states/worship-state";
import { useRecoilValue, useRecoilState } from "recoil";

export default function PlanPage({ params }: any) {
  const teamId = params.teamId;

  const team = useRecoilValue(teamAtom(teamId));
  const worshipIdsUpdater = useRecoilValue(worshipIdsUpdaterAtom);
  const [selectedWorshipId, setSelectedWorshipId] = useRecoilState(currentWorshipIdAtom);

  const [worships, setWorships] = useState<Worship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [hasMorePast, setHasMorePast] = useState(true);

  // Map to CalendarItem
  const calendarItems: CalendarItem[] = useMemo(() => {
    return worships.map(w => {
      const date = w.worship_date instanceof Timestamp ? w.worship_date.toDate() : new Date(w.worship_date as any);
      let badgeLabel = "Event";
      if (w.service_tags && w.service_tags.length > 0) badgeLabel = "Worship";

      // Fallback logic for badge
      if (w.title && w.title.length <= 4) badgeLabel = w.title;

      return {
        id: w.id || "",
        date: date,
        title: w.title,
        badgeLabel: badgeLabel,
        description: `${w.songs?.length || 0} songs`,
        originalData: w
      };
    });
  }, [worships]);

  const { navigateNext, navigatePrev } = useCalendarNavigation(
    calendarItems,
    selectedWorshipId,
    setSelectedWorshipId
  );

  const selectedWorship = useMemo(() =>
    worships.find(w => w.id === selectedWorshipId),
    [worships, selectedWorshipId]);

  // Load Initial Data (Future: Today + 6 months)
  useEffect(() => {
    async function loadData() {
      if (!teamId) return;
      try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);

        const startStr = format(today, "yyyy-MM-dd");
        const endStr = format(futureDate, "yyyy-MM-dd");

        let data = await WorshipService.getWorships(teamId, startStr, endStr);

        // Handle pre-selected ID (e.g. from creation) if not in range
        if (selectedWorshipId) {
          const alreadyExists = data.find(w => w.id === selectedWorshipId);
          if (!alreadyExists) {
            // If it's not in the default range (e.g. past plan), fetch it specifically
            const specificWorship = await WorshipService.getById(selectedWorshipId) as Worship;
            if (specificWorship && specificWorship.team_id === teamId) {
              data.push(specificWorship);
            }
          }
        }

        // Sort ASC by date
        data.sort((a, b) => {
          const tA = a.worship_date instanceof Timestamp ? a.worship_date.toMillis() : new Date(a.worship_date as any).getTime();
          const tB = b.worship_date instanceof Timestamp ? b.worship_date.toMillis() : new Date(b.worship_date as any).getTime();
          return tA - tB;
        });

        setWorships(data);

        // Selection Logic
        if (selectedWorshipId && data.some(w => w.id === selectedWorshipId)) {
          // Already selected via Atom, ensure it stays selected (no-op)
        } else if (data.length > 0) {
          // Default: First upcoming
          setSelectedWorshipId(data[0].id || null);
        }
      } catch (e) {
        console.error("Failed to load worships", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [teamId, worshipIdsUpdater, selectedWorshipId, setSelectedWorshipId]);

  const handleLoadPast = async () => {
    if (!teamId || worships.length === 0 || isLoadingPast || !hasMorePast) return;
    setIsLoadingPast(true);
    try {
      const first = worships[0];
      const firstDate = first.worship_date instanceof Timestamp ? first.worship_date.toDate() : new Date(first.worship_date as any);
      const LIMIT = 5;

      // Fetch previous schedules
      const pastData = await WorshipService.getPreviousWorships(teamId, firstDate, LIMIT);

      if (pastData.length < LIMIT) setHasMorePast(false);

      if (pastData.length > 0) {
        // pastData is sorted ASC by service
        // Filter out any duplicates (in case expandedId was one of them?)
        const newItems = pastData.filter(p => !worships.some(existing => existing.id === p.id));

        if (newItems.length > 0) {
          setWorships(prev => [...newItems, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPast(false);
    }
  };

  // Re-select if deleted
  useEffect(() => {
    if (loading) return; // Wait for loading
    if (!selectedWorshipId || worships.length === 0) return;
    if (!worships.some(w => w.id === selectedWorshipId)) {
      setSelectedWorshipId(worships[0].id || null);
    }
  }, [worships, selectedWorshipId, loading, setSelectedWorshipId]);

  if (loading) return <WorshipListSkeleton />;

  if (worships.length === 0) {
    // If truly empty (and no past loaded), check if we should try loading past? 
    // User might have ONLY past schedules.
    // But standard behavior is show empty -> user can create.
    // Wait, if no upcoming, we might miss past plans if we only fetch future initially.
    // ServingPage solves this by "EmptyServingBoardPage". 
    // Ideally we would check if *any* exist, but for now allow empty.
    return (
      <div className="flex flex-col h-full w-full bg-surface dark:bg-surface-dark relative">
        <div className="flex-1">
          <EmptyWorshipBoardPage />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface-dark relative font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-safe">
        <main className="max-w-lg mx-auto px-4 pt-2 space-y-5 pb-24">
          <CalendarStrip
            items={calendarItems}
            selectedId={selectedWorshipId}
            onSelect={setSelectedWorshipId}
            onLoadPrev={handleLoadPast}
            isLoadingPrev={isLoadingPast}
            hasMorePast={hasMorePast}
          />

          {selectedWorship ? (
            <SwipeableView
              viewId={selectedWorship.id || ""}
              onSwipeLeft={navigateNext}
              onSwipeRight={navigatePrev}
            >
              <Suspense fallback={<div className="h-60 flex items-center justify-center text-muted-foreground">Loading details...</div>}>
                <WorshipDetailContainer
                  worship={selectedWorship}
                  teamId={teamId}
                />
              </Suspense>
            </SwipeableView>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Select a plan to view details
            </div>
          )}

          {/* Zero-Latency Prefetching */}
          {worships.map((w, index) => {
            const currentIndex = worships.findIndex(item => item.id === selectedWorshipId);
            if (index === currentIndex + 1 || index === currentIndex - 1) {
              return (
                <Suspense key={`prefetch-${w.id}`} fallback={null}>
                  <WorshipDataPrefetcher worship={w} />
                </Suspense>
              );
            }
            return null;
          })}
        </main>
      </div>
    </div>
  );
}
