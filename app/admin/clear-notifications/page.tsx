"use client";

import { useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

export default function ClearNotificationsPage() {
    // Restrict to development
    if (process.env.NODE_ENV !== "development") {
        return notFound();
    }

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [completed, setCompleted] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleClearSubscriptions = async () => {
        if (!confirm("Are you sure you want to clear ALL push notification subscriptions in the CURRENT database? This cannot be undone.")) {
            return;
        }

        setIsLoading(true);
        setLogs([]);
        setCompleted(false);

        try {
            addLog("🚀 Starting cleanup process...");

            // @ts-ignore
            const dbId = db._databaseId?.database || "(default)";
            addLog(`🔥 Connected to Database: ${dbId}`);

            if (dbId !== "stg-env" && dbId !== "(default)") {
                addLog(`ℹ️  Note: You are running this on '${dbId}'.`);
            }

            const settingsRef = collection(db, "account_settings");
            const snapshot = await getDocs(settingsRef);

            if (snapshot.empty) {
                addLog("✅ No account settings found.");
                setIsLoading(false);
                return;
            }

            addLog(`📦 Found ${snapshot.size} account settings.`);

            const BATCH_SIZE = 450;
            const chunks = [];
            const docs = snapshot.docs;

            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                chunks.push(docs.slice(i, i + BATCH_SIZE));
            }

            addLog(`🔄 Processing in ${chunks.length} batches...`);

            let totalUpdated = 0;

            for (const [index, chunk] of chunks.entries()) {
                const batch = writeBatch(db);
                let batchCount = 0;

                chunk.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.push_notification?.subscriptions?.length > 0 || data.push_notification?.is_enabled) {
                        const ref = doc(db, "account_settings", docSnap.id);
                        batch.update(ref, {
                            "push_notification.subscriptions": [],
                            "push_notification.is_enabled": false,
                            "push_notification.updated_at": new Date().toISOString()
                        });
                        batchCount++;
                    }
                });

                if (batchCount > 0) {
                    await batch.commit();
                    totalUpdated += batchCount;
                    addLog(`✅ Batch ${index + 1}/${chunks.length} committed (${batchCount} updates).`);
                } else {
                    addLog(`⏭️  Batch ${index + 1}/${chunks.length} skipped.`);
                }
            }

            addLog(`🎉 Cleanup Complete! Updated ${totalUpdated} users.`);
            setCompleted(true);

        } catch (error: any) {
            console.error(error);
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <Button variant="ghost" className="-ml-4 gap-2 text-slate-500" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Button>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                            Clear Notifications
                        </h1>
                        <p className="text-slate-600">
                            Safety tool to disarm copied production data.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div className="space-y-2">
                        <h3 className="font-bold text-amber-900">Warning</h3>
                        <p className="text-sm text-amber-800/80 leading-relaxed">
                            This will remove ALL push notification subscriptions from the currently connected database.
                            Use this after importing production data to staging/local to prevent accidental notifications.
                        </p>
                    </div>
                </div>

                <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-6">
                    <Button
                        onClick={handleClearSubscriptions}
                        disabled={isLoading || completed}
                        variant="destructive"
                        className="w-full h-12 text-lg font-bold shadow-red-100"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                        ) : completed ? (
                            <><CheckCircle className="w-5 h-5 mr-2" /> Done</>
                        ) : (
                            "CLEAR ALL SUBSCRIPTIONS"
                        )}
                    </Button>

                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto space-y-1">
                        {logs.length === 0 && <span className="text-slate-600 select-none">Waiting to start...</span>}
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
