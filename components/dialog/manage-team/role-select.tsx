import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Button} from "@/components/ui/button";

const roles = ["Leader", "Member"]

export function RoleSelect({role}: any) {
  return (
    <Select value={role}>
      <SelectTrigger className="flex-end gap-2 w-full border-0 shadow-none " >
        <SelectValue placeholder="Select a Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            roles.map((role) => (
              <SelectItem key={role} value={role} className="cursor-pointer hover:bg-gray-50">{role}</SelectItem>
            ))
          }
          <Button className="w-full">Remove</Button>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
