"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronLeft, Database, PlayCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MigrationService from "@/apis/MigrationService";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MigrationPage() {
    const router = useRouter();
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (log: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
    };

    const handleRunMigration = async () => {
        if (!confirm("Are you sure you want to start the FULL MIGRATION? This will modify the database structure.")) return;

        setIsRunning(true);
        setLogs([]);
        addLog("Migration Process Initiated...");

        const success = await MigrationService.runFullMigration((log) => {
            addLog(log);
        });

        setIsRunning(false);
        if (success) {
            setIsCompleted(true);
            addLog("ALL CHECKS PASSED. Migration Complete.");
        } else {
            addLog("Migration Finished with ERRORS.");
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Header */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                        <Database className="w-6 h-6 text-primary" />
                        Database Migration Tool
                    </h1>
                </div>

                <Card className="border-2 border-primary/10 shadow-sm">
                    <CardHeader className="bg-primary/5 rounded-t-xl border-b border-primary/10">
                        <CardTitle>Migration Service v3.0</CardTitle>
                        <CardDescription>
                            Executes Phase 1 (Schema Enrichment) and Phase 2 (Structural Migration) sequence.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">

                        {/* Control Panel */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-sm">Status</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`relative flex h-3 w-3`}>
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunning ? 'bg-sky-400 opacity-75' : 'hidden'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-sky-500' : isCompleted ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    </span>
                                    <span className="text-sm text-slate-600">
                                        {isRunning ? "Running..." : isCompleted ? "Completed" : "Ready to Start"}
                                    </span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                disabled={isRunning}
                                onClick={handleRunMigration}
                                className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : isCompleted ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Done
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Migration
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Console Log Area */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-slate-500">Execution Log</h3>
                            <ScrollArea className="h-[400px] w-full rounded-md border bg-slate-950 p-4 font-mono text-xs text-green-400">
                                <div ref={scrollRef}>
                                    {logs.length === 0 && (
                                        <span className="text-slate-600 italic">// Logs will appear here...</span>
                                    )}
                                    {logs.map((log, i) => (
                                        <div key={i} className="mb-1 break-all">
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                    </CardContent>
                </Card>

                {/* Legacy Cleanup Section */}
                <Card className="border-2 border-red-100 shadow-sm">
                    <CardHeader className="bg-red-50 rounded-t-xl border-b border-red-100">
                        <CardTitle className="text-red-700">Danger Zone: Legacy Cleanup</CardTitle>
                        <CardDescription className="text-red-600/80">
                            Permanently delete all data from legacy root collections (songs, worships, etc.). Use only after confirming Phase 2 is successful.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-red-600 font-medium">
                                * This action cannot be undone.
                            </div>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (!confirm("DANGER! This will PERMANENTLY DELETE all legacy root collections (songs, worships, etc.).\n\nAre you absolutely sure you have verified the migration?")) return;
                                    if (!confirm("This is your last chance. Confirm deletion?")) return;

                                    setIsRunning(true);
                                    addLog("[CLEANUP] Starting cleanup process...");
                                    const success = await MigrationService.cleanupLegacyData(addLog);
                                    setIsRunning(false);
                                    if (success) addLog("[CLEANUP] Finished successfully.");
                                    else addLog("[CLEANUP] Finished with errors.");
                                }}
                                disabled={isRunning}
                            >
                                Execute Cleanup
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
