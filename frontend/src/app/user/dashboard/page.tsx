"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, KeyRound, Activity } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";
import moment from "moment";

type UsageItem = {
    _id: string;
    serviceSlug: string;
    creditsCharged: number;
    status: string;
    createdAt: string;
};

type LedgerItem = {
    _id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description?: string;
    createdAt: string;
};

export default function UserDashboardPage() {
    const dispatch = useAppDispatch();
    const [balance, setBalance] = useState(0);
    const [usage, setUsage] = useState<UsageItem[]>([]);
    const [ledger, setLedger] = useState<LedgerItem[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/dashboard");
            if (data?.status && data?.data) {
                setBalance(Number(data.data.balance || 0));
                setUsage(data.data.recentUsage || []);
                setLedger(data.data.recentLedger || []);
                dispatch(updateUser({ balance: Number(data.data.balance || 0) }));
            }
        })();
    }, [dispatch]);

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Credits, API keys, and recent usage.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Credit balance</p>
                            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{balance}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                            <Coins className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <Link href="/user/api-keys" className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">API Keys</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Manage keys</p>
                        </div>
                        <KeyRound className="h-5 w-5 text-indigo-600" />
                    </div>
                </Link>
                <Link href="/user/usage" className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Usage</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">View history</p>
                        </div>
                        <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent usage</h2>
                    <div className="mt-3 space-y-2">
                        {usage.length === 0 ? <p className="text-sm text-slate-500">No usage yet.</p> : null}
                        {usage.map((item) => (
                            <div key={item._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.serviceSlug}</p>
                                    <p className="text-xs text-slate-500">{moment(item.createdAt).fromNow()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="capitalize text-slate-700 dark:text-slate-200">{item.status}</p>
                                    <p className="text-xs text-slate-500">{item.creditsCharged} cr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">Credit ledger</h2>
                    <div className="mt-3 space-y-2">
                        {ledger.length === 0 ? <p className="text-sm text-slate-500">No ledger entries yet.</p> : null}
                        {ledger.map((item) => (
                            <div key={item._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                                <div>
                                    <p className="font-medium capitalize text-slate-800 dark:text-slate-100">{item.type.replace("_", " ")}</p>
                                    <p className="text-xs text-slate-500">{item.description || moment(item.createdAt).fromNow()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={item.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                        {item.amount >= 0 ? "+" : ""}
                                        {item.amount}
                                    </p>
                                    <p className="text-xs text-slate-500">bal {item.balanceAfter}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-sm dark:border-indigo-500/30 dark:bg-indigo-500/5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Call a service</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{`POST /api/v1/services/sms/send
Header: x-user-api-key: sk_live_...
Body: { "to": "9999999999", "message": "Hello" }`}</pre>
            </div>
        </section>
    );
}
