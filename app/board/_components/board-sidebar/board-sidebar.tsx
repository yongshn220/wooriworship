"use client"
import Link from 'next/link'
import {Button} from "@/components/ui/button";
import {useSearchParams} from 'next/navigation'
import {LayoutDashboard, LibraryBig} from 'lucide-react';
import {SearchParams} from "@/components/constants/enums";
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";
import {MainLogo} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";


export function BoardSidebar() {
  const searchParams = useSearchParams()
  const songBoardSelected = searchParams.get(SearchParams.SONG_BOARD)

  return (
    <MdSidebar>
      <MainLogo/>
      <div className="space-y-2 w-full">
        <TeamSelect/>
        <Button variant={songBoardSelected ? "ghost" : "secondary"} asChild size="lg"
                className="font-normal w-full justify-start px-2">
          <Link href={"/"}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Link>
        </Button>
        <Button variant={songBoardSelected ? "secondary" : "ghost"} asChild size="lg"
                className="font-normal w-full justify-start px-2">
          <Link href={{
            pathname: "/",
            query: {favorites: true}
          }}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Link>
        </Button>
      </div>
    </MdSidebar>
  )
}
