import { useState, useEffect } from "react";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { fetchServingRolesSelector, servingRolesUpdaterAtom } from "@/global-states/servingState";
import { toast } from "@/components/ui/use-toast";
import { ServingService } from "@/apis";

export function useServingRoles(teamId: string) {
    const rolesLoadable = useRecoilValueLoadable(fetchServingRolesSelector(teamId));
    const setRolesUpdater = useSetRecoilState(servingRolesUpdaterAtom);

    const [roles, setRoles] = useState(rolesLoadable.state === 'hasValue' ? rolesLoadable.contents : []);

    useEffect(() => {
        if (rolesLoadable.state === 'hasValue') {
            setRoles(rolesLoadable.contents);
        }
    }, [rolesLoadable.state, rolesLoadable.contents]);

    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'role' | 'template'; id: string; open: boolean }>({ type: 'role', id: '', open: false });

    const handleCreateRole = async () => {
        if (!newRoleName.trim() || !teamId) return;

        // Case-insensitive duplicate check
        const isDuplicate = roles.some(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase());
        if (isDuplicate) {
            toast({ title: `Role '${newRoleName}' already exists`, variant: "destructive" });
            return;
        }

        setIsCreatingRole(true);
        try {
            await ServingService.createRole(teamId, { teamId, name: newRoleName.trim(), order: roles.length });
            setRolesUpdater(prev => prev + 1);
            setNewRoleName("");
            setIsRoleDialogOpen(false);
            toast({ title: "Role created successfully!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to create role", variant: "destructive" });
        } finally {
            setIsCreatingRole(false);
        }
    };

    const handleDeleteRole = async (roleId: string, onItemUpdate: (roleId: string) => void) => {
        try {
            await ServingService.deleteRole(teamId, roleId);
            setRolesUpdater(prev => prev + 1);
            // Callback to update items in parent
            onItemUpdate(roleId);
            toast({ title: "Role deleted" });
            setDeleteConfirm(prev => ({ ...prev, open: false }));
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to delete role", variant: "destructive" });
        }
    };

    return {
        roles,
        setRoles,
        isRoleDialogOpen,
        setIsRoleDialogOpen,
        newRoleName,
        setNewRoleName,
        isCreatingRole, // Export loading state
        deleteConfirm,
        setDeleteConfirm, // Shared confirm dialog state, might need to be lifted if used for templates too? Yes, original code shared it.
        handleCreateRole,
        handleDeleteRole
    };
}
