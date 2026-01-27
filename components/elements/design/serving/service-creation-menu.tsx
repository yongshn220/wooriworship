"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Music2, Users, ListOrdered, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPathCreateServing } from "@/components/util/helper/routes";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface Props {
    teamId: string;
    selectedServiceId: string | null;
}

const CreateActionButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
    >
        <Plus className="w-5 h-5 stroke-[3px]" />
    </motion.button>
);

export function ServiceCreationMenu({ teamId, selectedServiceId }: Props) {
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateService = () => {
        router.push(getPathCreateServing(teamId));
    };

    const handleAddModule = async (type: 'setlist' | 'praise_assignee' | 'flow') => {
        if (!selectedServiceId) {
            toast({
                title: "No Service Selected",
                description: "Please select a service first to add this module.",
                variant: "destructive"
            });
            return;
        }

        try {
            await ServiceEventService.initSubCollection(teamId, selectedServiceId, type);
            toast({
                title: "Module Added",
                description: `Successfully initialized ${type.replace('_', ' ')}.`,
            });
            // Force refresh logic might be needed if component doesn't auto-detect
            // Actually, service list updater or re-fetch details should happen.
            // ServiceDetailContainerV3 listens to serviceId, but doesn't auto-poll.
            // We might need to trigger a refresh.
            window.location.reload(); // Temporary brute force or use Recoil updater?
            // Ideally we use a recoil updater atom. But for now, reload ensures clean state.
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to initialize module. It might already exist.",
                variant: "destructive"
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div>
                    <CreateActionButton />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Create</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleCreateService} className="cursor-pointer">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    <span>New Service Event</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Add to Current Service</DropdownMenuLabel>

                <DropdownMenuItem
                    onClick={() => handleAddModule('setlist')}
                    disabled={!selectedServiceId}
                    className="cursor-pointer"
                >
                    <Music2 className="mr-2 h-4 w-4" />
                    <span>Set List</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleAddModule('praise_assignee')}
                    disabled={!selectedServiceId}
                    className="cursor-pointer"
                >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Praise Assignee</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleAddModule('flow')}
                    disabled={!selectedServiceId}
                    className="cursor-pointer"
                >
                    <ListOrdered className="mr-2 h-4 w-4" />
                    <span>Service Flow</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
