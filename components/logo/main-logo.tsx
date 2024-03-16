import Link from "next/link";
import Image from "next/image";


export function MainLogo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-2">
        <Image
          src={"/image/logo.png"}
          alt="Logo"
          height={30}
          width={30}
        />
        <span className="text-xs lg:text-base font-bold h-full">
          WOORIWORSHIP
        </span>
      </div>
    </Link>
  )
}
