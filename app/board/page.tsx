import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/option";


export default async function BoardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {

  }
  else {
    console.log(session)
  }

  return (
    <div>
      BOARD
    </div>
  )
}
