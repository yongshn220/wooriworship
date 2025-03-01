import Link from "next/link";
import Image from "next/image";


export function MainLogoRouter({route}: {route: string}) {
  return (
    <Link href={route}>
      <div className="flex items-center gap-x-1 p-1 rounded-lg hover:bg-gray-100">
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

export function MainLogo() {
  return (
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
  )
}


export function MainLogoSmall() {
  return (
    <div className="flex-center gap-1">
      <Image
        src={"/image/logo.png"}
        alt="Logo"
        height={25}
        width={25}
        className="object-contain object-center"
      />
      <p className="font-semibold">OORI</p>
    </div>
  )
}