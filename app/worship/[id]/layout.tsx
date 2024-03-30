import {WorshipSidebar} from "@/app/worship/[id]/_components/worship-sidebar/worship-sidebar";
import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";


export default function WorshipLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="h-full">
      <div className="flex gap-x-3 h-full">
        <WorshipSidebar/>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
