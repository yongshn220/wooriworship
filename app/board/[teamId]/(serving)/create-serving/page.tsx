"use client";

import { ServingForm } from "@/components/elements/design/serving/serving-form/serving-form";

interface Props {
    params: {
        teamId: string;
    };
}

export default function CreateServingPage({ params }: Props) {
    return (
        <div className="w-full h-full">
            <ServingForm teamId={params.teamId} />
        </div>
    );
}
