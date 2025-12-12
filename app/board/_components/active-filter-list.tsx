
import { useRecoilState } from "recoil";
import { searchSelectedTagsAtom, searchSelectedKeysAtom } from "@/app/board/_states/board-states";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActiveFilterList() {
    const [selectedTags, setSelectedTags] = useRecoilState(searchSelectedTagsAtom);
    const [selectedKeys, setSelectedKeys] = useRecoilState(searchSelectedKeysAtom);

    const hasFilters = selectedTags.length > 0 || selectedKeys.length > 0;

    if (!hasFilters) return null;

    const removeTag = (tagToRemove: string) => {
        setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    const removeKey = (keyToRemove: string) => {
        setSelectedKeys((prev) => prev.filter((key) => key !== keyToRemove));
    };

    const resetFilters = () => {
        setSelectedTags([]);
        setSelectedKeys([]);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {selectedTags.map((tag) => (
                <Badge
                    key={`tag-${tag}`}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
                    onClick={() => removeTag(tag)}
                >
                    {tag}
                    <X className="h-3 w-3 text-background/50 hover:text-background" />
                </Badge>
            ))}

            {selectedKeys.map((key) => (
                <Badge
                    key={`key-${key}`}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors cursor-pointer"
                    onClick={() => removeKey(key)}
                >
                    {key}
                    <X className="h-3 w-3 text-primary/50 hover:text-primary" />
                </Badge>
            ))}

            <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
            >
                Reset All
            </Button>
        </div>
    );
}
