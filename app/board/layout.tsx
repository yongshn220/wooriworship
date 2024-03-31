import {BoardSidebar} from "@/app/board/_components/board-sidebar/board-sidebar";
import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {TeamSidebar} from "@/app/board/_components/team-sidebar/team-sidebar";
import {Toaster} from "@/components/ui/toaster";


export default function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-full">
      <Toaster />
      <TeamSidebar/>
      <div className="flex lg:pl-[60px] gap-x-3 h-full">
        <BoardSidebar/>
        <div className="h-full flex-1">
          <Navbar/>
          <div className="flex-1 h-[calc(100%-80px)] p-6 overflow-y-scroll scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
