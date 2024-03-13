import {BoardSideBar} from "@/app/board/_components/board-side-bar";
import {Navbar} from "@/app/board/_components/nav-bar";
import {TeamSideBar} from "@/app/board/_components/team-side-bar";


export default function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-full">
      <TeamSideBar/>
      <div className="flex pl-[60px] gap-x-3 h-full">
        <BoardSideBar/>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
