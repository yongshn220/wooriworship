"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import TagService from "@/apis/TagService";
import TeamService from "@/apis/TeamService";
import { Tag } from "@/models/tag";

import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface TagSelectorProps {
    teamId: string;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    single?: boolean;
    mode?: "song" | "service";
    refreshTrigger?: number;
    knownTags?: { id: string, name: string }[];
}

export function TagSelector({
    teamId,
    selectedTags,
    onTagsChange,
    placeholder = "Select tags...",
    single = false,
    mode = "song",
    refreshTrigger = 0,
    knownTags = [],
}: TagSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [tagToDelete, setTagToDelete] = React.useState<{ id: string, name: string, open: boolean }>({ id: "", name: "", open: false });
    const [tagToRename, setTagToRename] = React.useState<{ id: string, name: string, open: boolean }>({ id: "", name: "", open: false });
    const [newName, setNewName] = React.useState("");

    React.useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                if (mode === "service") {
                    const team = await TeamService.getById(teamId);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setAvailableTags((team as any)?.service_tags || []);
                } else {
                    const tags = await TagService.getTeamTags(teamId);
                    setAvailableTags(tags as Tag[]);
                }
            } catch (error) {
                console.error("Failed to fetch tags", error);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTags();
        }
    }, [teamId, refreshTrigger]);

    const handleUnselect = (tag: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tag));
    };

    const handleSelect = (tag: Tag) => {
        const value = mode === "service" ? tag.id : tag.name;
        if (selectedTags.includes(value)) {
            handleUnselect(value);
        } else {
            if (single) {
                onTagsChange([value]);
                setOpen(false); // Close on selection if single
            } else {
                onTagsChange([...selectedTags, value]);
            }
        }
        setInputValue("");
        // Keep open for multiple selection? UX choice. Let's keep it open.
    };

    const createNewTag = async () => {
        if (!inputValue.trim()) return;
        const newTagName = inputValue.trim();

        // Optimistic update
        if (!selectedTags.includes(newTagName)) {
            if (single) {
                onTagsChange([newTagName]);
                setOpen(false);
            } else {
                onTagsChange([...selectedTags, newTagName]);
            }
        }

        try {
            if (mode === 'service') {
                const newId = await TeamService.addServiceTag(teamId, newTagName);
                const team = await TeamService.getById(teamId);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setAvailableTags((team as any)?.service_tags || []);

                if (newId) {
                    if (single) onTagsChange([newId]);
                    else onTagsChange([...selectedTags, newId]);
                }
            } else {
                await TagService.addNewTag(teamId, newTagName);
                const tags = await TagService.getTeamTags(teamId);
                setAvailableTags(tags as Tag[]);
                // For song tags, use name
                if (single) onTagsChange([newTagName]);
                else onTagsChange([...selectedTags, newTagName]);
            }
        } catch (e) {
            console.error("Failed to create tag", e);
        }
        setInputValue("");
    };

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-10 px-3 py-2"
                    >
                        <div className="flex flex-wrap gap-1 items-center">
                            {selectedTags.length > 0 ? (
                                selectedTags
                                    .filter(tagValue => {
                                        if (mode !== "service") return true;
                                        return availableTags.some(t => t.id === tagValue) || knownTags.some(t => t.id === tagValue);
                                    })
                                    .map((tagValue) => {
                                        // Resolve name
                                        const tagObj = availableTags.find(t => (mode === "service" ? t.id : t.name) === tagValue) ||
                                            (mode === "service" ? knownTags.find(t => t.id === tagValue) : undefined);
                                        const displayName = tagObj ? tagObj.name : tagValue;

                                        return (
                                            <Badge variant="secondary" key={tagValue} className="mr-1 mb-1">
                                                {displayName}
                                                <div
                                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleUnselect(tagValue);
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </div>
                                            </Badge>
                                        )
                                    })
                            ) : (
                                <span className="text-muted-foreground font-normal">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search or create tag..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {inputValue && (
                                    <div className="p-2">
                                        <Button variant="ghost" className="w-full justify-start text-sm" onClick={createNewTag}>
                                            Create &quot;{inputValue}&quot;
                                        </Button>
                                    </div>
                                )}
                                {!inputValue && "No tags found."}
                            </CommandEmpty>
                            <CommandGroup className="overflow-y-auto max-h-[200px]">
                                {availableTags.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => handleSelect(tag)}
                                        className="flex items-center justify-between group"
                                    >
                                        <div className="flex items-center">
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    "mr-2 h-4 w-4",
                                                    selectedTags.includes(mode === "service" ? tag.id : tag.name) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {tag.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {mode === "service" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-11 w-11 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTagToRename({ id: tag.id, name: tag.name, open: true });
                                                        setNewName(tag.name);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-11 w-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTagToDelete({ id: tag.id, name: tag.name, open: true });
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <DeleteConfirmationDialog
                isOpen={tagToDelete.open}
                setOpen={(open: boolean) => !open && setTagToDelete(prev => ({ ...prev, open: false }))}
                title={`Delete '${tagToDelete.name}'?`}
                description="This action cannot be undone. This tag will be removed from all future selections."
                onDeleteHandler={async () => {
                    const tagName = tagToDelete.name;
                    try {
                        if (mode === "service") {
                            // Service tags are inside Team object. We need to filter and update.
                            const team = await TeamService.getById(teamId);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const currentTags = (team as any)?.service_tags || [];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const updatedTags = currentTags.filter((t: any) => t.name !== tagName);
                            await TeamService.updateServiceTags(teamId, updatedTags);
                            setAvailableTags(updatedTags);
                        } else {
                            await TagService.deleteTag(teamId, tagName);
                            const newTags = await TagService.getTeamTags(teamId);
                            setAvailableTags(newTags as Tag[]);
                        }

                        const deleteTarget = mode === "service" ? tagToDelete.id : tagToDelete.name;
                        if (selectedTags.includes(deleteTarget)) {
                            handleUnselect(deleteTarget);
                        }
                    } catch (err) {
                        console.error("Failed to delete tag", err);
                    }
                }}
            />

            <Dialog open={tagToRename.open} onOpenChange={(open) => setTagToRename(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Tag</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tag Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter new tag name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTagToRename(prev => ({ ...prev, open: false }))}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!newName.trim() || newName === tagToRename.name) {
                                    setTagToRename(prev => ({ ...prev, open: false }));
                                    return;
                                }
                                try {
                                    const team = await TeamService.getById(teamId);
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const currentTags = (team as any)?.service_tags || [];
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const updatedTags = currentTags.map((t: any) =>
                                        t.id === tagToRename.id ? { ...t, name: newName.trim() } : t
                                    );
                                    await TeamService.updateServiceTags(teamId, updatedTags);
                                    setAvailableTags(updatedTags);
                                    setTagToRename(prev => ({ ...prev, open: false }));
                                } catch (err) {
                                    console.error("Failed to rename tag", err);
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
