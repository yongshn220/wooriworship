import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Shield, User } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fetchServingRolesSelector, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { ServingService, TeamService } from "@/apis";
import { teamUpdaterAtom } from "@/global-states/teamState";
import { Badge } from "@/components/ui/badge";

interface Props {
  userId: string;
  teamId: string;
  isLeader: boolean;
}

export function RoleSelect({ userId, teamId, isLeader }: Props) {
  const [open, setOpen] = useState(false);

  // Recoil
  const roles = useRecoilValue(fetchServingRolesSelector(teamId));
  const setServingRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);
  const setTeamUpdater = useSetRecoilState(teamUpdaterAtom);

  async function toggleLeader() {
    if (isLeader) {
      await TeamService.removeLeader(teamId, userId);
    } else {
      await TeamService.addLeader(teamId, userId);
    }
    setTeamUpdater(prev => prev + 1);
  }

  async function toggleServingRole(roleId: string, currentDefaultMembers: string[] = []) {
    const isAssigned = currentDefaultMembers.includes(userId);
    if (isAssigned) {
      await ServingService.removeDefaultMember(teamId, roleId, userId);
    } else {
      await ServingService.addDefaultMember(teamId, roleId, userId);
    }
    setServingRolesUpdater(prev => prev + 1);
  }

  // Calculate stats for display
  const assignedRoleNames = roles
    .filter(r => r.default_members?.includes(userId))
    .map(r => r.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between h-auto min-h-8 py-1 text-xs px-2.5 max-w-[200px]">
          <div className="flex flex-wrap items-center gap-2 text-left">
            {isLeader ? (
              <Badge variant="default" className="bg-primary/80 hover:bg-primary/80 h-5 px-1.5 text-[10px] shrink-0">Leader</Badge>
            ) : (
              <span className="text-muted-foreground shrink-0">Member</span>
            )}
            {assignedRoleNames.length > 0 && (
              <>
                <span className="h-3 w-[1px] bg-border mx-0.5 shrink-0" />
                <span className="text-muted-foreground truncate leading-tight">
                  {assignedRoleNames.join(", ")}
                </span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command>
          <div className="p-2 border-b">
            <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider pl-1 mb-2 block">
              Team Permission
            </Label>
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                isLeader ? "bg-primary/5" : "hover:bg-muted"
              )}
              onClick={toggleLeader}
            >
              <div className={cn("p-1.5 rounded-full shrink-0", isLeader ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {isLeader ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{isLeader ? "Team Leader" : "Team Member"}</p>
                <p className="text-xs text-muted-foreground">{isLeader ? "Can manage team settings" : "Regular member access"}</p>
              </div>
              {isLeader && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandGroup heading="Serving Roles">
              {roles.map((role) => {
                const isSelected = role.default_members?.includes(userId);
                return (
                  <CommandItem
                    key={role.id}
                    value={role.name + role.id} // Ensure uniqueness for search
                    onSelect={() => toggleServingRole(role.id, role.default_members)}
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className={cn("h-3 w-3")} />
                    </div>
                    <span>{role.name}</span>
                  </CommandItem>
                );
              })}
              {roles.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No roles defined</div>}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
