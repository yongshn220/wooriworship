"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import TagService from "@/apis/TagService";
import { Tag } from "@/models/tag";

import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface TagSelectorProps {
    teamId: string;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    single?: boolean;
}

export function TagSelector({
    teamId,
    selectedTags,
    onTagsChange,
    placeholder = "Select tags...",
    single = false,
}: TagSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [tagToDelete, setTagToDelete] = React.useState({ name: "", open: false });

    React.useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const tags = await TagService.getTeamTags(teamId);
                // Map any return type to Tag interface if needed, assuming TagService returns objects compatible or we adapt here.
                // Based on TagService code: it returns result of getByFilters.
                // We might need to cast or adapt if structure differs slightly.
                setAvailableTags(tags as Tag[]);
            } catch (error) {
                console.error("Failed to fetch tags", error);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTags();
        }
    }, [teamId]);

    const handleUnselect = (tag: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tag));
    };

    const handleSelect = (tagValue: string) => {
        if (selectedTags.includes(tagValue)) {
            handleUnselect(tagValue);
        } else {
            if (single) {
                onTagsChange([tagValue]);
                setOpen(false); // Close on selection if single
            } else {
                onTagsChange([...selectedTags, tagValue]);
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

        // Call service to persist if needed, but the service seems to fetch by checking DB.
        // TagService.addNewTag creates a new document.
        // If we just use string array for tags in Serving/Plan, we might strictly rely on Tag objects being in DB?
        // The requirement said "reuse". So we should persist the tag.
        try {
            await TagService.addNewTag(teamId, newTagName);
            // Refresh available tags
            const tags = await TagService.getTeamTags(teamId);
            setAvailableTags(tags as Tag[]);
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
                                selectedTags.map((tag) => (
                                    <Badge variant="secondary" key={tag} className="mr-1 mb-1">
                                        {tag}
                                        <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUnselect(tag);
                                            }}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>
                                    </Badge>
                                ))
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
                                        onSelect={() => handleSelect(tag.name)}
                                        className="flex items-center justify-between group"
                                    >
                                        <div className="flex items-center">
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {tag.name}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTagToDelete({ name: tag.name, open: true });
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
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
                        await TagService.deleteTag(teamId, tagName);
                        const newTags = await TagService.getTeamTags(teamId);
                        setAvailableTags(newTags as Tag[]);
                        if (selectedTags.includes(tagName)) {
                            handleUnselect(tagName);
                        }
                    } catch (err) {
                        console.error("Failed to delete tag", err);
                    }
                }}
            />
        </div>
    );
}
