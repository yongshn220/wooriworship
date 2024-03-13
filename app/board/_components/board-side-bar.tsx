"use client"
import Image from 'next/image'
import Link from 'next/link'
import {Button} from "@/components/ui/button";
import {useSearchParams} from 'next/navigation'
import {LayoutDashboard, LibraryBig} from 'lucide-react';
import {SearchParams} from "@/components/constants/enums";


export function BoardSideBar() {
  const searchParams = useSearchParams()
  const songBoardSelected = searchParams.get(SearchParams.SONG_BOARD)

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link href={"/"}>
        <div className="flex items-center gap-x-2">
          <Image
            src={"/image/logo.png"}
            alt="Logo"
            height={30}
            width={30}
          />
          <span className="font-bold">
            WOORIWORSHIP
          </span>
        </div>
      </Link>
      <div className="space-y-1 w-full">
        <Button variant={songBoardSelected ? "ghost" : "secondary"} asChild size="lg"
                className="font-normal w-full justify-start px-2">
          <Link href={"/"}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Team boards
          </Link>
        </Button>
        <Button variant={songBoardSelected ? "secondary" : "ghost"} asChild size="lg"
                className="font-normal w-full justify-start px-2">
          <Link href={{
            pathname: "/",
            query: {favorites: true}
          }}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Favorite boards
          </Link>
        </Button>
      </div>
    </div>
  )
}
