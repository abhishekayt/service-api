"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Coins, History, TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";

type LedgerTransaction = {
    _id: string;
    txnId?: string;
    type: string;
    source?: "self" | "admin" | "reward" | "api_usage" | "signup_bonus" | string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

type LedgerResponse = {
    balance: number;
    count: number;
    limit: number;
    pageNo: number;
    record: LedgerTransaction[];
};

export default function UserLedgerPage() {
    const dispatch = useAppDispatch();
    const [param, setParam] = useState({ pageNo: 1, limit: 15, query: "", type: "All" });
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<LedgerResponse>({
        balance: 0,
        count: 0,
        limit: 15,
        pageNo: 1,
        record: []
    });

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const { data: res } = await AxiosHelperUser.getData("/ledger", param);
            if (res?.status) {
                setData(res.data);
                if (res.data.balance !== undefined) {
                    dispatch(updateUser({ balance: res.data.balance }));
                }
            }
        } finally {
            setLoading(false);
        }
    }, [param, dispatch]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const totalPages = Math.ceil(data.count / param.limit) || 1;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Credit Ledger
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Complete financial passbook statement of credit additions, API usage debits, and balance updates.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/user/credits">
                        <Button variant="gradient" size="sm" className="gap-2 shadow-sm">
                            <Zap className="h-4 w-4" /> Buy Credits
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:border-slate-800 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            Current Balance
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                            <Coins className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{data.balance}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">credits</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <Badge variant="success" className="text-[10px] font-semibold">
                                Active Wallet
                            </Badge>
                            <Link href="/user/credits" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                                Top up <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Statement Entries
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {data.count}
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            All historical credit transactions & dispatches
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table Card */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Ledger Statement
                            </CardTitle>
                            <CardDescription>Filter and search your credit history transactions.</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                value={param.query}
                                onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                                placeholder="Search Ledger ID, particulars..."
                                className="h-9 w-full max-w-xs min-w-0 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
                            />
                            <select
                                value={param.type}
                                onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, type: e.target.value }))}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <option value="All">All Types</option>
                                <option value="Credit">Credit (+)</option>
                                <option value="Debit">Debit (-)</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ledger ID</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Updated Balance</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead className="text-right">Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        Loading ledger statement...
                                    </TableCell>
                                </TableRow>
                            ) : data.record.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <History className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                            <p className="text-sm font-medium">No ledger entries found.</p>
                                            <p className="text-xs text-slate-400">Your wallet balance changes will appear here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.record.map((item) => {
                                    const isCredit = ["topup", "signup_bonus", "refund"].includes(item.type);
                                    const isPositive = item.amount > 0;
                                    const isActuallyCredit = isCredit || (item.type === "adjustment" && isPositive);

                                    const sourceLabel = item.source === "admin"
                                        ? "Admin"
                                        : item.source === "reward"
                                        ? "Reward"
                                        : item.source === "api_usage"
                                        ? "API Usage"
                                        : item.source === "signup_bonus"
                                        ? "Bonus"
                                        : "Self";
                                    const sourceVariant: BadgeVariant = item.source === "admin"
                                        ? "secondary"
                                        : item.source === "reward"
                                        ? "warning"
                                        : item.source === "api_usage"
                                        ? "outline"
                                        : item.source === "signup_bonus"
                                        ? "info"
                                        : "outline";

                                    return (
                                        <TableRow key={item._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {item.txnId || `TR${item._id.slice(-6).toUpperCase()}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sourceVariant} className="text-[11px] font-bold capitalize">
                                                    {sourceLabel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isActuallyCredit ? "success" : "danger"}
                                                    className="text-[11px] font-bold capitalize"
                                                >
                                                    {isActuallyCredit ? "Credit" : "Debit"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`font-semibold ${isActuallyCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {isActuallyCredit ? "+" : ""}{item.amount} cr
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                                                {item.balanceAfter} cr
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                                                {item.description || item.type.replace(/_/g, " ")}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">
                                                {moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Page <span className="font-semibold">{param.pageNo}</span> of{" "}
                                <span className="font-semibold">{totalPages}</span> ({data.count} entries)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={param.pageNo <= 1}
                                    onClick={() => setParam((prev) => ({ ...prev, pageNo: prev.pageNo - 1 }))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={param.pageNo >= totalPages}
                                    onClick={() => setParam((prev) => ({ ...prev, pageNo: prev.pageNo + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
