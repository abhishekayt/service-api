"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Wallet } from "lucide-react";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Badge, type BadgeVariant } from "@/components/ui";
import AdminPagination from "@/components/admin/AdminPagination";

type Transaction = {
    _id: string;
    txnId?: string;
    type: string;
    source?: "self" | "admin" | "reward" | "api_usage" | "signup_bonus" | string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

type LedgerData = {
    user: { name: string; userId: string; balance: number };
    transactions: Transaction[];
    count: number;
    totalPages: number;
    pagination: number[];
};

export default function PlatformUserLedgerPage() {
    const params = useParams();
    const router = useRouter();
    const [param, setParam] = useState({ pageNo: 1, limit: 10, query: "", type: "All" });
    const [data, setData] = useState<LedgerData>({
        user: { name: "", userId: "", balance: 0 },
        transactions: [],
        count: 0,
        totalPages: 0,
        pagination: []
    });

    const fetchLedger = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData(`/platform-users/${params.id}/ledger`, param);
        if (res?.status) setData(res.data);
    }, [param, params.id]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const handleAddEntry = async () => {
        const result = await Swal.fire({
            title: `Adjust credits for ${data.user.name}`,
            input: "text",
            inputLabel: "Amount (positive to add, negative to deduct)",
            inputPlaceholder: "100 or -50",
            showCancelButton: true,
            confirmButtonText: "Apply"
        });
        if (!result.isConfirmed || !result.value) return;

        const amount = Number(result.value);
        if (!Number.isFinite(amount) || amount === 0) {
            toast.error("Enter a non-zero number");
            return;
        }

        const { data: res } = await AxiosHelperAdmin.postData(`/platform-users/${params.id}/credits`, {
            amount,
            description: "Admin credit adjustment"
        });
        if (res?.status) {
            toast.success(res.message);
            fetchLedger();
        } else {
            toast.error(res?.message || "Failed");
        }
    };

    return (
        <section className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Customer Ledger</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage wallet ledger for {data.user.name || "User"} ({data.user.userId || "—"}).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </Button>
                    <Button onClick={handleAddEntry} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                        <Plus className="h-4 w-4" /> Add Entry
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Balance</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                ₹{data.user.balance?.toFixed(2) || "0.00"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Customer ID</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{data.user.userId || "—"}</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Entries</p>
                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{data.count}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        placeholder="Search Ledger ID, particulars..."
                        className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-transparent px-3.5 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:text-slate-100"
                    />
                    <select
                        value={param.type}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, type: e.target.value }))}
                        className="h-10 rounded-lg border border-slate-200 bg-transparent px-3.5 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:text-slate-100"
                    >
                        <option value="All">All Types</option>
                        <option value="Credit">Credit (+)</option>
                        <option value="Debit">Debit (-)</option>
                    </select>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50/90 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3.5 font-semibold">Ledger ID</th>
                                <th className="px-4 py-3.5 font-semibold">Source</th>
                                <th className="px-4 py-3.5 font-semibold">Type</th>
                                <th className="px-4 py-3.5 font-semibold">Amount</th>
                                <th className="px-4 py-3.5 font-semibold">Updated Balance</th>
                                <th className="px-4 py-3.5 font-semibold">Particulars</th>
                                <th className="px-4 py-3.5 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.transactions.map((txn) => {
                                const isCredit = ["topup", "signup_bonus", "refund"].includes(txn.type);
                                const isPositive = txn.amount > 0;
                                const isActuallyCredit = isCredit || (txn.type === "adjustment" && isPositive);

                                const sourceLabel = txn.source === "admin"
                                    ? "Admin"
                                    : txn.source === "reward"
                                    ? "Reward"
                                    : txn.source === "api_usage"
                                    ? "API Usage"
                                    : txn.source === "signup_bonus"
                                    ? "Bonus"
                                    : "Self";
                                const sourceVariant: BadgeVariant = txn.source === "admin"
                                    ? "secondary"
                                    : txn.source === "reward"
                                    ? "warning"
                                    : txn.source === "api_usage"
                                    ? "outline"
                                    : txn.source === "signup_bonus"
                                    ? "info"
                                    : "outline";

                                return (
                                    <tr key={txn._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {txn.txnId || `TR${txn._id.slice(-6).toUpperCase()}`}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Badge variant={sourceVariant} size="sm" className="capitalize font-semibold">
                                                {sourceLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isActuallyCredit ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                {isActuallyCredit ? "Credit" : "Debit"}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3.5 font-medium ${isActuallyCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                            ₹{Math.abs(txn.amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-900 dark:text-slate-300">₹{txn.balanceAfter?.toFixed(2) || "0.00"}</td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{txn.description || txn.type}</td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{moment(txn.createdAt).format("DD-MM-YYYY hh:mm A")}</td>
                                    </tr>
                                );
                            })}
                            {!data.transactions.length && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <AdminPagination data={data} param={param} setParam={setParam} />
                </div>
            </div>
        </section>
    );
}
