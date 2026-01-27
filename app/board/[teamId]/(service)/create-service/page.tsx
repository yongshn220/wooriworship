"use client";

import { ServiceForm } from "@/components/elements/design/service/service-form/service-form";

interface Props {
    params: {
        teamId: string;
    };
}

export default function CreateServingPage({ params }: Props) {
    return (
        <div className="w-full h-full">
            <ServiceForm teamId={params.teamId} />
        </div>
    );
}
