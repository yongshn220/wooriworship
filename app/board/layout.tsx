import {BoardSideBar} from "@/app/board/_components/sidebar/board-side-bar";
import {Navbar} from "@/app/board/_components/nav-bar";
import {TeamSideBar} from "@/app/board/_components/sidebar/team-side-bar";


export default function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-full">
      <TeamSideBar/>
      <div className="flex lg:pl-[60px] gap-x-3 h-full">
        <BoardSideBar/>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
