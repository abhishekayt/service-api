"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";

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

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/usage", { pageNo: 1, limit: 50 });
            if (data?.status) {
                setRecords(data.data?.record || []);
            }
        })();
    }, []);

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Usage</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Recent service calls and credit charges.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Credits</th>
                            <th className="px-4 py-3">Latency</th>
                            <th className="px-4 py-3">When</th>
                            <th className="px-4 py-3">Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                                    No usage yet. Call an API with your key to see entries here.
                                </td>
                            </tr>
                        ) : null}
                        {records.map((row) => (
                            <tr key={row._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.serviceSlug}</td>
                                <td className="px-4 py-3 capitalize">{row.status}</td>
                                <td className="px-4 py-3">{row.creditsCharged}</td>
                                <td className="px-4 py-3">{row.latencyMs != null ? `${row.latencyMs} ms` : "—"}</td>
                                <td className="px-4 py-3 text-slate-500">{moment(row.createdAt).format("DD MMM YYYY HH:mm")}</td>
                                <td className="px-4 py-3 text-xs text-red-600">{row.errorMessage || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
