import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";


export default function WorshipInitLayout({params, children}: any) {
  const teamId = params.teamId
  return (
    <BoardAuthenticate>
      {children}
    </BoardAuthenticate>
  )
}
