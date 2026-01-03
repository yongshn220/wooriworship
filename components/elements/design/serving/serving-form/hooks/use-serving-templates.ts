import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { ServingService } from "@/apis";
import { ServingItem, ServingAssignment } from "@/models/serving";

export function useServingTemplates(teamId: string, items: ServingItem[], setItems: (items: ServingItem[]) => void) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplatesLoaded, setIsTemplatesLoaded] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [hasTemplateChanges, setHasTemplateChanges] = useState(false);

    // Dialogs
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [tempTemplateName, setTempTemplateName] = useState("");
    const [createEmptyMode, setCreateEmptyMode] = useState(false);

    // Initial Load
    useEffect(() => {
        if (teamId) {
            ServingService.getTemplates(teamId).then(data => {
                setTemplates(data);
                setIsTemplatesLoaded(true);

                // Inject Sample Flow if no templates exist
                if (data.length === 0 && items.length <= 1) { // 1 because 'WORSHIP_TEAM' might be auto-added by useServingTimeline?
                    // Actually, useServingTimeline might add WORSHIP_TEAM if missing.
                    // But if we want a full sample flow:
                    const sampleItems: ServingItem[] = [
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '묵상기도', order: 0, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '신앙고백', order: 1, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'WORSHIP_TEAM', title: '찬양', order: 2, assignments: [] }, // Will be merged/managed by timeline hook?
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '대표기도', order: 3, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '성경봉독', order: 4, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '말씀선포', order: 5, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '봉헌/기도', order: 6, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '교회소식', order: 7, assignments: [{ memberIds: [] }] },
                        { id: Math.random().toString(36).substr(2, 9), type: 'FLOW', title: '축도', order: 8, assignments: [{ memberIds: [] }] },
                    ];
                    setItems(sampleItems);
                }
            }).catch(console.error);
        }
    }, [teamId]);

    // Track changes
    useEffect(() => {
        if (!selectedTemplateId) {
            setHasTemplateChanges(true); // Treated as change if no template selected but items exist? Original logic: if (!selectedTemplateId) setHasTemplateChanges(true);
            return;
        }

        const currentTemplate = templates.find(t => t.id === selectedTemplateId);
        if (!currentTemplate) return;

        const currentItemsSimplifed = items.map(i => ({
            title: i.title,
            type: i.type,
            remarks: i.remarks || ""
        }));

        const templateItemsSimplified = currentTemplate.items.map((i: any) => ({
            title: i.title,
            type: i.type,
            remarks: i.remarks || ""
        }));

        const isSame = JSON.stringify(currentItemsSimplifed) === JSON.stringify(templateItemsSimplified);
        setHasTemplateChanges(!isSame);
    }, [items, selectedTemplateId, templates]);


    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) return;
        try {
            const defaultFixedItem = {
                title: '찬양',
                type: 'WORSHIP_TEAM',
                remarks: "",
                assignments: [] as ServingAssignment[]
            };

            const itemsToSave = createEmptyMode ? [defaultFixedItem] : items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }));
            const templateData = {
                name: newTemplateName.trim(),
                teamId,
                items: itemsToSave
            };
            await ServingService.createTemplate(teamId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);

            const createdTemplate = newTemps.find(t => t.name === newTemplateName.trim());
            if (createdTemplate) {
                setSelectedTemplateId(createdTemplate.id);
                if (createEmptyMode) {
                    setItems([{
                        ...defaultFixedItem,
                        id: Math.random().toString(36).substr(2, 9),
                        order: 0,
                        assignments: []
                    } as ServingItem]);
                }
            }

            setNewTemplateName("");
            setCreateEmptyMode(false);
            setIsTemplateDialogOpen(false);
            toast({
                title: createEmptyMode ? "New template created!" : "Template saved!",
                description: `'${newTemplateName}' is now available.`
            });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to save template", variant: "destructive" });
        }
    };

    const handleUpdateTemplate = async () => {
        if (!selectedTemplateId) return;
        try {
            const currentTemp = templates.find(t => t.id === selectedTemplateId);
            const templateData = {
                name: currentTemp?.name,
                items: items.map(i => ({ title: i.title, type: i.type, remarks: i.remarks || "" }))
            };
            await ServingService.updateTemplate(teamId, selectedTemplateId, templateData);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            toast({ title: "Template updated!" });
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to update template", variant: "destructive" });
        }
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplateId) return;
        try {
            await ServingService.deleteTemplate(teamId, selectedTemplateId);
            const newTemps = await ServingService.getTemplates(teamId);
            setTemplates(newTemps);
            setSelectedTemplateId(null);
            setItems([]);
            toast({ title: "Template deleted" });
            // Note: Close dialog logic should be in parent or returned
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to delete template", variant: "destructive" });
        }
    };

    const handleUpdateTemplateName = async (newName: string) => {
        if (!selectedTemplateId) return;
        setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, name: newName } : t));
        if (newName.trim()) {
            try {
                await ServingService.updateTemplate(teamId, selectedTemplateId, { name: newName.trim() });
            } catch (e) {
                console.error(e);
            }
        }
    };

    return {
        templates,
        isTemplatesLoaded,
        selectedTemplateId,
        setSelectedTemplateId,
        hasTemplateChanges,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isRenameDialogOpen,
        setIsRenameDialogOpen,
        newTemplateName,
        setNewTemplateName,
        tempTemplateName,
        setTempTemplateName,
        createEmptyMode,
        setCreateEmptyMode,
        handleSaveTemplate,
        handleUpdateTemplate,
        handleDeleteTemplate,
        handleUpdateTemplateName,
        setTemplates,
        setIsTemplatesLoaded,
        setHasTemplateChanges
    };
}
