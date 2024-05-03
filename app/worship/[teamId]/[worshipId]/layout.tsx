import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {WorshipSidebarWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar-wrapper";

interface Props {
  params: any
  children: React.ReactNode
}

export default function WorshipLayout({params, children}: Props) {
  const worshipId = params.worshipId

  return (
    <section className="h-full">
      <div className="flex gap-x-3 h-full">
        <WorshipSidebarWrapper worshipId={worshipId}/>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
