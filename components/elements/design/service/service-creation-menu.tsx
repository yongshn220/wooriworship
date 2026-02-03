"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ServiceForm } from "./forms/service-form";

interface Props {
    teamId: string;
}

const CreateActionButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
    >
        <Plus className="w-5 h-5 stroke-[3px]" />
    </motion.button>
);

export function ServiceCreationMenu({ teamId }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                <CreateActionButton />
            </div>

            {isOpen && (
                <ServiceForm
                    teamId={teamId}
                    onCompleted={() => setIsOpen(false)}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
