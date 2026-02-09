"use client";

import { useState } from "react";
import { ServiceForm } from "./forms/service-form";
import { CreateActionButton } from "@/app/board/_components/board-navigation/create-action-button";

interface Props {
    teamId: string;
}

export function ServiceCreationMenu({ teamId }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <CreateActionButton onClick={() => setIsOpen(true)} />

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
