import {BoardSidebar} from "@/app/board/_components/board-sidebar/board-sidebar";
import {Navbar} from "@/app/board/_components/nav-bar";
import {TeamSidebar} from "@/app/board/_components/team-sidebar/team-sidebar";


export default function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-full">
      <TeamSidebar/>
      <div className="flex lg:pl-[60px] gap-x-3 h-full">
        <BoardSidebar/>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
