
'use client'

import { Suspense, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, Plus, ChevronRight, MailIcon } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TeamSelect } from '@/components/elements/design/team/team-select'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { currentTeamIdAtom } from '@/global-states/teamState'
import { getPathPlan } from '@/components/util/helper/routes'
import AuthService from '@/apis/AuthService'
import { toast } from '@/components/ui/use-toast'
import { pendingReceivedInvitationsAtom } from '@/global-states/invitation-state'
import { auth } from '@/firebase'
import { invitationInboxDialogOpenStateAtom } from '@/global-states/dialog-state'

export default function BoardPage() {
  const authUser = auth.currentUser
  const router = useRouter()
  const [teamId, setTeamId] = useRecoilState(currentTeamIdAtom)
  const setInvitationDialogState = useSetRecoilState(invitationInboxDialogOpenStateAtom)
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    if (teamId) {
      router.push(getPathPlan(teamId))
    }
  }, [teamId])

  async function handleSignOut() {
    try {
      await AuthService.logout()
      setTeamId(null)
      toast({ title: "Goodbye :)" })
      router.replace("/")
    }
    catch (err: any) {
      console.error("Logout error:", err.code)
      toast({ title: "Error signing out", description: "Please try again.", variant: "destructive" })
    }
  }

  function handleContinue() {
    if (teamId) {
      router.push(getPathPlan(teamId))
    }
  }

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
          >
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-6">
                <div className="flex-center flex-col mb-8">
                  <Image
                    alt="compose music image"
                    src="/illustration/offRoadIllustration.svg"
                    width={250}
                    height={250}
                  />
                  <h1 className="text-2xl font-bold mb-2 text-gray-800">Welcome to Woori Worship!</h1>
                  <p className="text-gray-600">Select your team to get started</p>
                </div>

                <div className="space-y-4">
                  <Suspense fallback={<div></div>}>
                    <TeamSelect createOption={true}/>
                  </Suspense>

                  <Button 
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={handleContinue}
                    disabled={!selectedTeam}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  <Button className='w-full' variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className='flex-center w-full mt-4'>
              <Button variant="outline" onClick={() => setInvitationDialogState(true)}>
                <MailIcon className="mr-4 h-6 w-6"/>
                Invitation Inbox
                {
                  invitations?.length > 0 &&
                  <div className="flex items-center justify-center text-xs rounded-full bg-red-500 w-6 h-6 text-white shadow-md ml-2">
                    {invitations?.length}
                  </div>
                }
              </Button>
            </div>
        </motion.div>
      </main>
    </div>
  )
}

