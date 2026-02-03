import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";
import { ServiceAssignment } from "@/models/services/ServiceEvent";

export function usePraiseTeamTemplates(
    teamId: string,
    praiseTeam: ServiceAssignment[],
    setPraiseTeam: React.Dispatch<React.SetStateAction<ServiceAssignment[]>>
) {
    const [ptTemplates, setPtTemplates] = useState<any[]>([]);
    const [isPtTemplatesLoaded, setIsPtTemplatesLoaded] = useState(false);
    const [selectedPtTemplateId, setSelectedPtTemplateId] = useState<string | null>(null);
    const [hasPtTemplateChanges, setHasPtTemplateChanges] = useState(false);

    // Dialogs
    const [isPtTemplateDialogOpen, setIsPtTemplateDialogOpen] = useState(false);
    const [isPtRenameDialogOpen, setIsPtRenameDialogOpen] = useState(false);
    const [newPtTemplateName, setNewPtTemplateName] = useState("");
    const [tempPtTemplateName, setTempPtTemplateName] = useState("");

    // Ref for praiseTeam to access latest value without dependency
    const praiseTeamRef = React.useRef(praiseTeam);
    praiseTeamRef.current = praiseTeam;

    // Initial Load
    useEffect(() => {
        if (teamId) {
            PraiseTeamApi.getTemplates(teamId).then(data => {
                setPtTemplates(data);
                setIsPtTemplatesLoaded(true);

                // Auto-select first template when praiseTeam is empty
                if (data.length > 0 && praiseTeamRef.current.length === 0) {
                    const firstTemplate = data[0];
                    setSelectedPtTemplateId(firstTemplate.id);
                    setPraiseTeam(firstTemplate.assignments || []);
                }
            }).catch(console.error);
        }
    }, [teamId, setPraiseTeam]);

    // Track changes (compare assignments)
    useEffect(() => {
        if (!selectedPtTemplateId) {
            setHasPtTemplateChanges(ptTemplates.length > 0);
            return;
        }

        const currentTemplate = ptTemplates.find(t => t.id === selectedPtTemplateId);
        if (!currentTemplate) return;

        const normalize = (assignments: ServiceAssignment[]) =>
            assignments.map(a => ({
                roleId: a.roleId || "",
                label: a.label || "",
                memberIds: [...(a.memberIds || [])].sort()
            }));

        const isSame = JSON.stringify(normalize(praiseTeam)) === JSON.stringify(normalize(currentTemplate.assignments || []));
        setHasPtTemplateChanges(!isSame);
    }, [praiseTeam, selectedPtTemplateId, ptTemplates]);

    const handleSavePtTemplate = async () => {
        if (!newPtTemplateName.trim()) return;
        try {
            const templateData = {
                name: newPtTemplateName.trim(),
                teamId,
                assignments: praiseTeam.map(a => ({
                    roleId: a.roleId || "",
                    label: a.label || "",
                    memberIds: a.memberIds || []
                }))
            };
            await PraiseTeamApi.createTemplate(teamId, templateData);
            const newTemps = await PraiseTeamApi.getTemplates(teamId);
            setPtTemplates(newTemps);

            const createdTemplate = newTemps.find(t => t.name === newPtTemplateName.trim());
            if (createdTemplate) {
                setSelectedPtTemplateId(createdTemplate.id);
            }

            setNewPtTemplateName("");
            setIsPtTemplateDialogOpen(false);
            toast({
                title: "Template saved!",
                description: `'${newPtTemplateName}' is now available.`
            });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save template", variant: "destructive" });
        }
    };

    const handleUpdatePtTemplate = async () => {
        if (!selectedPtTemplateId) return;
        try {
            const currentTemp = ptTemplates.find(t => t.id === selectedPtTemplateId);
            const templateData = {
                name: currentTemp?.name,
                assignments: praiseTeam.map(a => ({
                    roleId: a.roleId || "",
                    label: a.label || "",
                    memberIds: a.memberIds || []
                }))
            };
            await PraiseTeamApi.updateTemplate(teamId, selectedPtTemplateId, templateData);
            const newTemps = await PraiseTeamApi.getTemplates(teamId);
            setPtTemplates(newTemps);
            toast({ title: "Template updated!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to update template", variant: "destructive" });
        }
    };

    const handleDeletePtTemplate = async () => {
        if (!selectedPtTemplateId) return;
        try {
            await PraiseTeamApi.deleteTemplate(teamId, selectedPtTemplateId);
            const newTemps = await PraiseTeamApi.getTemplates(teamId);
            setPtTemplates(newTemps);
            setSelectedPtTemplateId(null);
            toast({ title: "Template deleted" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to delete template", variant: "destructive" });
        }
    };

    const handleUpdatePtTemplateName = async (newName: string) => {
        if (!selectedPtTemplateId) return;
        setPtTemplates(prev => prev.map(t => t.id === selectedPtTemplateId ? { ...t, name: newName } : t));
        if (newName.trim()) {
            try {
                await PraiseTeamApi.updateTemplate(teamId, selectedPtTemplateId, { name: newName.trim() });
            } catch (e) {
                console.error(e);
            }
        }
    };

    return {
        ptTemplates,
        isPtTemplatesLoaded,
        selectedPtTemplateId,
        setSelectedPtTemplateId,
        hasPtTemplateChanges,
        isPtTemplateDialogOpen,
        setIsPtTemplateDialogOpen,
        isPtRenameDialogOpen,
        setIsPtRenameDialogOpen,
        newPtTemplateName,
        setNewPtTemplateName,
        tempPtTemplateName,
        setTempPtTemplateName,
        handleSavePtTemplate,
        handleUpdatePtTemplate,
        handleDeletePtTemplate,
        handleUpdatePtTemplateName,
        setPtTemplates,
        setIsPtTemplatesLoaded,
        setHasPtTemplateChanges,
    };
}
