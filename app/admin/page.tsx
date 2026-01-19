"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, BellOff, ChevronRight, LayoutDashboard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminPage() {
    // Restrict to development for now to prevent production exposure of debug tools
    if (process.env.NODE_ENV !== "development") {
        return notFound();
    }

    const adminTools = [
        {
            title: "Clear Notification Subscriptions",
            description: "Remove all push notification tokens from the current database to prevent accidental production leaks.",
            href: "/admin/clear-notifications",
            icon: BellOff,
            variant: "destructive"
        },
        {
            title: "Database Migration Tool",
            description: "Execute structural migration scripts (Phase 1 & 2) to move data to team-centric sub-collections.",
            href: "/admin/migration",
            icon: HelperDatabaseIcon,
            variant: "default"
        },
    ];

    function HelperDatabaseIcon({ className }: { className?: string }) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5" />
            </svg>
        )
    }

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
                        Manage local environment tools and administrative functions.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminTools.map((tool) => (
                        <Link key={tool.href} href={tool.href} className="group">
                            <Card className={`h-full transition-all duration-200 hover:shadow-md border-2 ${tool.variant === 'destructive' ? 'hover:border-red-200' : 'hover:border-primary/20'} border-transparent`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-xl ${tool.variant === 'destructive' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                            <tool.icon className="w-6 h-6" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                    <div className="space-y-1 pt-4">
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {tool.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
