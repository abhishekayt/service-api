"use client";

import { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { ScrollText, Filter, Eye, Clock, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

type UsageItem = {
    _id: string;
    serviceSlug: string;
    creditsCharged: number;
    status: string;
    errorMessage?: string | null;
    latencyMs?: number | null;
    createdAt: string;
};

export default function UserUsagePage() {
    const [records, setRecords] = useState<UsageItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<UsageItem | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/usage", { pageNo: 1, limit: 100 });
            if (data?.status) {
                setRecords(data.data?.record || []);
            }
        })();
    }, []);

    const filteredRecords = useMemo(() => {
        if (statusFilter === "all") return records;
        return records.filter((r) => r.status.toLowerCase() === statusFilter);
    }, [records, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <ScrollText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        API Request Logs & Analytics
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Detailed execution stream, latencies, credit charges, and error trace logs.
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
                    <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        {(["all", "success", "failed"] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                                    statusFilter === st
                                        ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logs Table Card */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-base">Execution History ({filteredRecords.length})</CardTitle>
                    <CardDescription>Click on any log row to inspect detailed execution metadata.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Endpoint</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Credits Charged</TableHead>
                                <TableHead>Latency</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead className="text-right">Inspect</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <Activity className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                            <p className="text-sm font-medium">No request logs match the selected filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {filteredRecords.map((row) => (
                                <TableRow
                                    key={row._id}
                                    onClick={() => setSelectedItem(row)}
                                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                >
                                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                                        <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {row.serviceSlug}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={row.status === "success" ? "success" : "danger"}
                                            className="text-[11px] font-semibold capitalize"
                                        >
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                                        {row.creditsCharged} cr
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {row.latencyMs != null ? `${row.latencyMs} ms` : "—"}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {moment(row.createdAt).format("DD MMM YYYY, hh:mm:ss A")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(row);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 text-slate-400 hover:text-indigo-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detailed Log Inspector Slide-Over Sheet */}
            <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Request Execution Inspector
                        </SheetTitle>
                        <SheetDescription>
                            Log ID: <code className="font-mono text-xs text-slate-500">{selectedItem?._id}</code>
                        </SheetDescription>
                    </SheetHeader>

                    {selectedItem && (
                        <div className="mt-6 space-y-5 text-sm">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Execution Status</span>
                                    <Badge
                                        variant={selectedItem.status === "success" ? "success" : "danger"}
                                        className="capitalize font-bold"
                                    >
                                        {selectedItem.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-500">Service Endpoint</span>
                                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        /api/v1/services/{selectedItem.serviceSlug}/send
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-500">Credits Deducted</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedItem.creditsCharged} credits
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-500">Response Latency</span>
                                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                        {selectedItem.latencyMs != null ? `${selectedItem.latencyMs} ms` : "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                    <span className="text-xs font-semibold text-slate-500">Created At</span>
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        {moment(selectedItem.createdAt).format("DD MMM YYYY, hh:mm:ss A")}
                                    </span>
                                </div>
                            </div>

                            {selectedItem.errorMessage && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs dark:border-rose-900/40 dark:bg-rose-950/40">
                                    <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300 mb-1">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Error Details</span>
                                    </div>
                                    <p className="font-mono text-rose-600 dark:text-rose-400 leading-relaxed">
                                        {selectedItem.errorMessage}
                                    </p>
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-200">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Sample Request Header
                                </p>
                                <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
{`POST /api/v1/services/${selectedItem.serviceSlug}/send
Host: localhost:5000
Content-Type: application/json
x-user-api-key: sk_live_••••••••`}
                                </pre>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
