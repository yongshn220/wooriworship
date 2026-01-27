import { useState, useEffect } from "react";
import { PraiseAssigneeService } from "@/apis/PraiseAssigneeService";
import { ServiceFlowItem } from "@/models/services/ServiceEvent";

export function useServingTimeline(teamId: string) {
    const [items, setItems] = useState<ServiceFlowItem[]>([]);
    const [activeSelection, setActiveSelection] = useState<{ itemId?: string; assignmentIndex?: number; roleId: string } | null>(null);

    // Groups config
    const [standardGroups, setStandardGroups] = useState<string[]>([]);
    const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);
    const [newGroupInput, setNewGroupInput] = useState("");

    useEffect(() => {
        if (teamId) {
            PraiseAssigneeService.getServingConfig(teamId).then(config => {
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
        handleAddMember
    };
}
