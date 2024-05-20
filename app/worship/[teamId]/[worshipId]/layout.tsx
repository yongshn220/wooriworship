import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {WorshipSetup} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-setup";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {getPathPlan} from "@/components/helper/routes";
import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {MdSidebar} from "@/components/sidebar/md-sidebar";

interface Props {
  params: any
  children: React.ReactNode
}

export default function WorshipLayout({params, children}: Props) {
  const worshipId = params.worshipId
  const teamId = params.teamId

  return (
    <section className="h-full">
      <div className="flex gap-x-3 h-full">
        <MdSidebar>
          <MainLogoRouter route={getPathPlan(teamId)}/>
          <WorshipSidebar worshipId={worshipId}/>
        </MdSidebar>
        <div className="h-full flex-1">
          <Navbar/>
          {children}
        </div>
      </div>
    </section>
  )
}
