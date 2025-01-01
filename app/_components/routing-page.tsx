
import {RoutingIndicator} from "@/components/animation/routing-indicator";
import {MainLogo} from "@/components/logo/main-logo";


export function RoutingPage() {
  return (
    <div className="flex-center w-full h-screen bg-white">
      <RoutingIndicator/>
      <div className="absolute bottom-10">
        <MainLogo/>
      </div>
    </div>
  )
}
