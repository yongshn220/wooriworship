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

  // Load Initial Data (History + Future)
  useEffect(() => {
    async function loadData() {
      if (!teamId) return;
      try {
        const today = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);

        const startStr = format(today, "yyyy-MM-dd");
        const endStr = format(futureDate, "yyyy-MM-dd");

        // Concurrent Fetch: Future (6 months) + Past (5 items)
        const [futureData, pastData] = await Promise.all([
          WorshipService.getWorships(teamId, startStr, endStr),
          WorshipService.getPreviousWorships(teamId, todayStart, 5)
        ]);

        // Merge and Deduplicate
        const combined = [...pastData, ...futureData];
        const uniqueMap = new Map();
        combined.forEach(w => {
          if (w.id) uniqueMap.set(w.id, w);
        });

        // Check for specific selected ID (deep link case)
        if (selectedWorshipId && !uniqueMap.has(selectedWorshipId)) {
          try {
            const specificWorship = await WorshipService.getById(teamId, selectedWorshipId) as Worship;
            if (specificWorship) uniqueMap.set(specificWorship.id, specificWorship);
          } catch (ignore) { }
        }

        const data = Array.from(uniqueMap.values()) as Worship[];

        // Sort ASC by date
        data.sort((a, b) => {
          const tA = a.worship_date instanceof Timestamp ? a.worship_date.toMillis() : new Date(a.worship_date as any).getTime();
          const tB = b.worship_date instanceof Timestamp ? b.worship_date.toMillis() : new Date(b.worship_date as any).getTime();
          return tA - tB;
        });

        setWorships(data);

        // Selection Logic
        if (selectedWorshipId && uniqueMap.has(selectedWorshipId)) {
          // Keep selection
        } else {
          // Find first upcoming (>= Today Midnight)
          const firstUpcoming = data.find(w => {
            const d = w.worship_date instanceof Timestamp ? w.worship_date.toDate() : new Date(w.worship_date as any);
            return d >= todayStart;
          });

          if (firstUpcoming) {
            setSelectedWorshipId(firstUpcoming.id || null);
          } else {
            // Only History exists -> Select NULL
            setSelectedWorshipId(null);
          }
        }
      } catch (e) {
        console.error("Failed to load worships", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [teamId, worshipIdsUpdater]);

  const handleLoadPast = async () => {
    if (!teamId || isLoadingPast || !hasMorePast) return;
    setIsLoadingPast(true);
    try {
      // Ensure we find the true oldest date even if list order is messy
      let firstDate = new Date();
      if (worships.length > 0) {
        // Find min date
        const sorted = [...worships].sort((a, b) => {
          const tA = a.worship_date instanceof Timestamp ? a.worship_date.toMillis() : new Date(a.worship_date as any).getTime();
          const tB = b.worship_date instanceof Timestamp ? b.worship_date.toMillis() : new Date(b.worship_date as any).getTime();
          return tA - tB;
        });
        const first = sorted[0];
        firstDate = first.worship_date instanceof Timestamp ? first.worship_date.toDate() : new Date(first.worship_date as any);
      } else {
        // If empty, use start of today strict
        firstDate = new Date();
        firstDate.setHours(0, 0, 0, 0);
      }

      const LIMIT = 50; // Increased limit for smoother scrolling

      // Fetch previous schedules
      const pastData = await WorshipService.getPreviousWorships(teamId, firstDate, LIMIT);

      if (pastData.length < LIMIT) setHasMorePast(false);

      if (pastData.length > 0) {
        // Merge with existing
        setWorships(prev => {
          const combined = [...pastData, ...prev];
          const uniqueMap = new Map();
          combined.forEach(w => w.id && uniqueMap.set(w.id, w));
          const uniqueList = Array.from(uniqueMap.values()) as Worship[];

          // Re-sort
          return uniqueList.sort((a, b) => {
            const tA = a.worship_date instanceof Timestamp ? a.worship_date.toMillis() : new Date(a.worship_date as any).getTime();
            const tB = b.worship_date instanceof Timestamp ? b.worship_date.toMillis() : new Date(b.worship_date as any).getTime();
            return tA - tB;
          });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPast(false);
    }
  };

  // Auto-fetch past history when navigating near the start
  useEffect(() => {
    if (!selectedWorshipId || worships.length === 0 || !hasMorePast || isLoadingPast) return;
    const index = worships.findIndex(w => w.id === selectedWorshipId);

    // If selected item is within the first 3 items, load more history
    if (index !== -1 && index < 3) {
      handleLoadPast();
    }
  }, [selectedWorshipId, worships, hasMorePast, isLoadingPast]);

  // Re-select if deleted
  useEffect(() => {
    if (loading) return; // Wait for loading
    if (!selectedWorshipId && worships.length > 0) {
      setSelectedWorshipId(worships[0].id || null);
      return;
    }
    if (selectedWorshipId && worships.length > 0 && !worships.some(w => w.id === selectedWorshipId)) {
      setSelectedWorshipId(worships[0].id || null);
    }
  }, [worships, selectedWorshipId, loading, setSelectedWorshipId]);

  if (loading) return <WorshipListSkeleton />;

  // Render main layout even if empty, to show CalendarStrip (and "Prev" button)
  const isListEmpty = worships.length === 0;

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

          {isListEmpty ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
              <EmptyWorshipBoardPage />
              {/* Optional: Add a subtle text saying "Click 'Load Previous' to view past plans" if hasMorePast is true? */}
            </div>
          ) : selectedWorship ? (
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
            <NoUpcomingPlaceholder />
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

function NoUpcomingPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
      <p className="text-muted-foreground font-medium mb-1">No upcoming plans</p>
      <p className="text-sm text-muted-foreground/70">Check history above or create a new plan.</p>
    </div>
  );
}
