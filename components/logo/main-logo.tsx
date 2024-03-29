import Link from "next/link";
import Image from "next/image";


export function MainLogo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-1">
        <Image
          src={"/image/logo.png"}
          alt="Logo"
          height={25}
          width={25}
        />
        <span className="text-xs lg:text-base font-bold h-full">
          OORIWORSHIP
        </span>
      </div>
    </Link>
  )
}
