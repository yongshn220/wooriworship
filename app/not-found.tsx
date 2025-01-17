"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"


export default function NotFound() {

  const router = useRouter()

  useEffect(() => {
    router.push("/")
  }, [])

  return (
    <div className="w-full h-full flex-center flex-col gap-4 bg-white">
      <p className="text-2xl font-semibold">404 Not Found</p>
      <p className="text-gray-500">The page you are looking for does not exist</p>
    </div>
  )
}