"use client";

import { notFound } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function AdminPage() {
    // Restrict to development for now to prevent production exposure of debug tools
    if (process.env.NODE_ENV !== "development") {
        return notFound();
    }

    const adminTools: any[] = [
        // Tools have been migrated to scripts.
        // See /scripts directory.
    ];



    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-600">
                        Admin tools have been migrated to CLI scripts for safety.
                        Please check the <code>/scripts</code> directory in the project root.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Admin tools have been removed/migrated */}
                </div>
            </div>
        </div>
    );
}
