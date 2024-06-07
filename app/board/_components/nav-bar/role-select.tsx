import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"

const roles = ["Leader", "Member"]

export function RoleSelect({role}: any) {
  return (
    <Select disabled value={role}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            roles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
