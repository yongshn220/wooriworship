import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {WorshipService} from "@/apis";
import {redirect} from "next/navigation";
import {getPathWorship, getPathWorshipEdit} from "@/components/helper/routes";
import {Mode} from "@/components/constants/enums";
import {Worship} from "@/models/worship";


export default async function EditWorshipPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId

  const worship = await WorshipService.getById(worshipId) as Worship

  console.log(worship)

  async function onOpenChangeHandler(state: boolean) {
    "use server"

    if (!state) {
      redirect(getPathWorship(teamId, worshipId))
    }
  }
  return (
    <WorshipForm mode={Mode.EDIT} isOpen={true} setIsOpen={onOpenChangeHandler} worship={worship} />
  )
}
