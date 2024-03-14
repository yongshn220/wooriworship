import {redirect} from "next/navigation";
import {Routes} from "@/components/constants/enums";


export default async function Home() {

  // TODO : User Authenticated
  if (true) {
    redirect(Routes.BOARD)
  }

  return (
    <div className="">
      123
    </div>
  );
}
