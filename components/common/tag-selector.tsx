"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Trash2, Pencil, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModernDialog } from "@/components/ui/modern-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import TagApi from "@/apis/TagApi";
import TeamApi from "@/apis/TeamApi";
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

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                if (mode === "service") {
                    const tags = await TeamApi.getServiceTags(teamId);
                    setAvailableTags(tags as Tag[]);
                } else {
                    const tags = await TagApi.getTeamTags(teamId);
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
    }, [teamId, refreshTrigger, mode]);

    // Click outside handler
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            // Valid for mobile UX: do not auto-focus
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

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
                setOpen(false);
            } else {
                onTagsChange([...selectedTags, value]);
            }
        }
        setInputValue("");
    };

    const createNewTag = async () => {
        if (!inputValue.trim()) return;
        const newTagName = inputValue.trim();

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
                const newId = await TeamApi.addServiceTag(teamId, newTagName);
                const tags = await TeamApi.getServiceTags(teamId);
                setAvailableTags(tags as Tag[]);

                if (newId) {
                    if (single) onTagsChange([newId]);
                    else onTagsChange([...selectedTags, newId]);
                }
            } else {
                await TagApi.addNewTag(teamId, newTagName);
                const tags = await TagApi.getTeamTags(teamId);
                setAvailableTags(tags as Tag[]);
                if (single) onTagsChange([newTagName]);
                else onTagsChange([...selectedTags, newTagName]);
            }
        } catch (e) {
            console.error("Failed to create tag", e);
        }
        setInputValue("");
    };

    return (
        <div className="flex flex-col gap-2 relative" ref={containerRef}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-10 px-3 py-2"
                onClick={() => setOpen(!open)}
            >
                <div className="flex flex-wrap gap-1 items-center">
                    {selectedTags.length > 0 ? (
                        selectedTags
                            .filter(tagValue => {
                                if (mode !== "service") return true;
                                return availableTags.some(t => t.id === tagValue) || knownTags.some(t => t.id === tagValue);
                            })
                            .map((tagValue) => {
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

            {/* Custom Dropdown Overlay */}
            {open && (
                <div className="absolute top-full mt-2 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                    <div className="flex flex-col w-full">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                ref={inputRef}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search or create tag..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto overflow-x-hidden p-1">
                            {/* Empty State */}
                            {!inputValue && availableTags.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">No tags found.</div>
                            )}

                            {/* Create Option */}
                            {inputValue && !availableTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
                                <div className="p-1">
                                    <button
                                        onClick={createNewTag}
                                        className="w-full flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                                    >
                                        Create &quot;{inputValue}&quot;
                                    </button>
                                </div>
                            )}

                            {/* Available Tags */}
                            {availableTags
                                .filter(tag => !inputValue || tag.name.toLowerCase().includes(inputValue.toLowerCase()))
                                .map((tag) => (
                                    <div
                                        key={tag.id}
                                        onClick={() => handleSelect(tag)}
                                        className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer hover:bg-muted/50 transition-colors",
                                            selectedTags.includes(mode === "service" ? tag.id : tag.name) && "bg-accent/50"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <Check
                                                className={cn(
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
                                                    aria-label="Rename tag"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-background hover:text-primary z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTagToRename({ id: tag.id, name: tag.name, open: true });
                                                        setNewName(tag.name);
                                                    }}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Delete tag"
                                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTagToDelete({ id: tag.id, name: tag.name, open: true });
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationDialog
                isOpen={tagToDelete.open}
                setOpen={(open: boolean) => !open && setTagToDelete(prev => ({ ...prev, open: false }))}
                title={`Delete '${tagToDelete.name}'?`}
                description="This action cannot be undone. This tag will be removed from all future selections."
                onDeleteHandler={async () => {
                    const tagName = tagToDelete.name;
                    try {
                        if (mode === "service") {
                            await TeamApi.deleteServiceTag(teamId, tagToDelete.id);
                            const updatedTags = await TeamApi.getServiceTags(teamId);
                            setAvailableTags(updatedTags as Tag[]);
                        } else {
                            await TagApi.deleteTag(teamId, tagName);
                            const newTags = await TagApi.getTeamTags(teamId);
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

            <ModernDialog
                open={tagToRename.open}
                onOpenChange={(open) => setTagToRename(prev => ({ ...prev, open }))}
                title="Rename Tag"
                icon={<Pencil className="w-6 h-6 fill-primary/20 text-primary" />}
                actionText="Save Changes"
                onAction={async () => {
                    if (!newName.trim() || newName === tagToRename.name) {
                        setTagToRename(prev => ({ ...prev, open: false }));
                        return;
                    }
                    try {
                        await TeamApi.updateServiceTagName(teamId, tagToRename.id, newName.trim());
                        const updatedTags = await TeamApi.getServiceTags(teamId);
                        setAvailableTags(updatedTags as Tag[]);

                        // If renamed tag was selected, update the selection
                        if (selectedTags.includes(tagToRename.id)) {
                            const newSelection = selectedTags.map(id => id === tagToRename.id ? newName.trim() : id);
                            onTagsChange(newSelection);
                        }

                        setTagToRename(prev => ({ ...prev, open: false }));
                    } catch (err) {
                        console.error("Failed to rename tag", err);
                    }
                }}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Tag Name</Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new tag name"
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                        />
                    </div>
                </div>
            </ModernDialog>
        </div>
    );
}
