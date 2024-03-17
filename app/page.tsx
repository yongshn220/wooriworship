import {redirect} from "next/navigation";
import {Routes} from "@/components/constants/enums";
import './globals.css'

export default async function Home() {

  return (
    <div className="w-full h-full flex flex-col items-center p-5 bg-blue-500">
      <p className="mt-20 text-4xl font-bold text-white">Worship plan</p>
    </div>
  );
}
