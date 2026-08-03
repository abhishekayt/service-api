"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";

type PaymentRow = {
    _id: string;
    credits: number;
    amountInPaise: number;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
    createdAt: string;
    userId?: { name?: string; email?: string; userId?: string } | null;
    creditPackId?: { name?: string } | null;
};

export default function AdminPaymentsPage() {
    const [param, setParam] = useState({ pageNo: 1, limit: 20 });
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
            <AdminPageHeader title="Payments" subtitle="Razorpay credit top-up orders." />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Pack</th>
                            <th className="px-4 py-3">Credits</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">When</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.record.map((row) => (
                            <tr key={row._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{row.userId?.name || "—"}</p>
                                    <p className="text-xs text-slate-500">{row.userId?.email}</p>
                                </td>
                                <td className="px-4 py-3">{row.creditPackId?.name || "—"}</td>
                                <td className="px-4 py-3">{row.credits}</td>
                                <td className="px-4 py-3">₹{(row.amountInPaise / 100).toFixed(2)}</td>
                                <td className="px-4 py-3 capitalize">{row.status}</td>
                                <td className="px-4 py-3 font-mono text-xs">{row.razorpayOrderId}</td>
                                <td className="px-4 py-3 text-slate-500">{moment(row.createdAt).format("DD MMM YYYY HH:mm")}</td>
                            </tr>
                        ))}
                        {!data.record.length ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                                    No payments yet.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
            <AdminPagination data={data} param={param} setParam={setParam} />
        </section>
    );
}
