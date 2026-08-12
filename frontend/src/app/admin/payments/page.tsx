"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import { Badge, type BadgeVariant } from "@/components/ui";

type PaymentRow = {
    _id: string;
    paymentId?: string;
    credits: number;
    baseAmountInPaise?: number;
    gstPercent?: number;
    gstAmountInPaise?: number;
    amountInPaise: number;
    status: string;
    source?: "self" | "admin" | "reward" | string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    createdAt: string;
    userId?: { name?: string; email?: string; userId?: string } | null;
    creditPackId?: { name?: string } | null;
};

type SortBy = "userId" | "credits" | "amountInPaise" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminPaymentsPage() {
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy?: SortBy; sortOrder?: SortOrder }>({
        limit: 20,
        pageNo: 1,
        query: ""
    });
    const [data, setData] = useState<{ count: number; record: PaymentRow[]; totalPages: number; pagination: number[] }>({
        count: 0,
        record: [],
        totalPages: 0,
        pagination: []
    });

    const load = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData("/payments", param);
        if (res?.status) setData(res.data);
    }, [param]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Payments" subtitle="Razorpay credit top-up orders ledger." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search payment ID, order ID, user..."
                    />
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Payment ID</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Source</th>
                                <th className="px-3 py-2">Pack</th>
                                <th className="px-3 py-2">Credits</th>
                                <th className="px-3 py-2">Amount (Base + GST)</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const totalRupees = (row.amountInPaise / 100).toFixed(2);
                                const baseRupees = row.baseAmountInPaise != null ? (row.baseAmountInPaise / 100).toFixed(2) : null;
                                const gstRupees = row.gstAmountInPaise != null ? (row.gstAmountInPaise / 100).toFixed(2) : null;
                                const sourceLabel = row.source === "admin" ? "Admin" : row.source === "reward" ? "Reward" : "Self";
                                const sourceVariant: BadgeVariant = row.source === "admin" ? "secondary" : row.source === "reward" ? "warning" : "outline";
                                const statusLabel = row.status === "created" ? "Pending" : row.status;
                                const statusVariant: BadgeVariant = row.status === "captured" || row.status === "paid" ? "success" : row.status === "created" ? "warning" : "secondary";

                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                                            {row.paymentId || row.razorpayOrderId || "—"}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{row.userId?.name || "—"}</p>
                                            <p className="text-xs text-slate-500">{row.userId?.email}</p>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={sourceVariant} size="sm" className="capitalize font-semibold">
                                                {sourceLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.creditPackId?.name || "—"}</td>
                                        <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">{row.credits} credits</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">₹{totalRupees}</p>
                                            {baseRupees && gstRupees ? (
                                                <p className="text-[11px] text-slate-500">₹{baseRupees} + {row.gstPercent ?? 18}% GST (₹{gstRupees})</p>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={statusVariant} size="sm" className="capitalize font-semibold">
                                                {statusLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-500">{moment(row.createdAt).format("DD-MM-YYYY HH:mm")}</td>
                                    </tr>
                                );
                            })}
                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                        No Records Available.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>
        </section>
    );
}

