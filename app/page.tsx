import {redirect} from "next/navigation";
import {Routes} from "@/components/constants/enums";

export default async function Home() {

  const session = null // TODO: Connect firebase auth

  if (true) {
    redirect(Routes.BOARD)
  }

  return (
    <div className="">
      123
    </div>
  );
}
