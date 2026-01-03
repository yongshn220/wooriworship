import { useState, useEffect } from "react";
import { ServingService } from "@/apis";
import { ServingItem } from "@/models/serving";

export function useServingTimeline(teamId: string) {
    const [items, setItems] = useState<ServingItem[]>([]);
    const [activeSelection, setActiveSelection] = useState<{ itemId?: string; assignmentIndex?: number; roleId: string } | null>(null);

    // Groups config
    const [standardGroups, setStandardGroups] = useState<string[]>([]);
    const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);
    const [newGroupInput, setNewGroupInput] = useState("");

    useEffect(() => {
        if (teamId) {
            ServingService.getServingConfig(teamId).then(config => {
                if (config.customGroups.length > 0) {
                    setStandardGroups(prev => Array.from(new Set([...prev, ...config.customGroups])));
                }
                if (config.customNames.length > 0) {
                    setCustomMemberNames(config.customNames);
                }
            }).catch(console.error);
        }
    }, [teamId]);


    const handleAddMember = (itemId: string, assignmentIndex: number, uid: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                const newAssignments = [...item.assignments];
                while (newAssignments.length <= assignmentIndex) {
                    newAssignments.push({ memberIds: [] });
                }

                const updatedAssignments = newAssignments.map((asg, idx) => {
                    if (idx === assignmentIndex) {
                        const memberIds = asg.memberIds.includes(uid)
                            ? asg.memberIds.filter(id => id !== uid)
                            : [...asg.memberIds, uid];
                        return { ...asg, memberIds };
                    }
                    return asg;
                });
                return { ...item, assignments: updatedAssignments };
            }
            return item;
        }));
    };

    const handleAddMemberByRole = (roleId: string, uid: string) => {
        let newItems = [...items];
        let ptItemIdx = newItems.findIndex(i => i.type === 'WORSHIP_TEAM');
        if (ptItemIdx === -1) {
            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                order: items.length,
                title: '찬양팀 구성',
                assignments: [],
                type: 'WORSHIP_TEAM'
            });
            ptItemIdx = newItems.length - 1;
        }

        const newAssignments = [...newItems[ptItemIdx].assignments];
        let aIdx = newAssignments.findIndex(a => a.roleId === roleId);
        if (aIdx === -1) {
            newAssignments.push({ roleId: roleId, memberIds: [uid] });
        } else {
            const currentIds = newAssignments[aIdx].memberIds;
            if (currentIds.includes(uid)) {
                newAssignments[aIdx] = { ...newAssignments[aIdx], memberIds: currentIds.filter(id => id !== uid) };
            } else {
                newAssignments[aIdx] = { ...newAssignments[aIdx], memberIds: [...currentIds, uid] };
            }
        }

        setItems(newItems.map((it, idx) => idx === ptItemIdx ? { ...it, assignments: newAssignments } : it));
    };

    return {
        items,
        setItems,
        activeSelection,
        setActiveSelection,
        standardGroups,
        setStandardGroups,
        customMemberNames,
        setCustomMemberNames,
        newGroupInput,
        setNewGroupInput,
        handleAddMember,
        handleAddMemberByRole
    };
}
