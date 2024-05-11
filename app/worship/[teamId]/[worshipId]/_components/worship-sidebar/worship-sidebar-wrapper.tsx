// "use client"
//
// import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
// import {SongService, WorshipService} from "@/apis";
// import {toPlainObject} from "@/components/helper/helper-functions";
// import {Worship} from "@/models/worship";
// import {WorshipSetup} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-setup";
// import {MainLogoRouter} from "@/components/logo/main-logo";
// import {MdSidebar} from "@/components/sidebar/md-sidebar";
// import {getPathBoard, getPathPlan} from "@/components/helper/routes";
//
// interface Props {
//   teamId: string
//   worshipId: string
// }
// export async function WorshipSidebarWrapper({teamId, worshipId}: Props) {
//
//   return (
//     <>
//       <MdSidebar className="px-5 shadow-lg">
//         <MainLogoRouter route={getPathPlan(teamId)}/>
//         <WorshipSidebar/>
//       </MdSidebar>
//     </>
//   )
// }
