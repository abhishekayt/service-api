"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Coins,
    KeyRound,
    Activity,
    Copy,
    Check,
    ArrowUpRight,
    Terminal,
    Zap,
    TrendingUp,
    Clock,
    Sparkles,
} from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";

type UsageItem = {
    _id: string;
    serviceSlug: string;
    creditsCharged: number;
    status: string;
    createdAt: string;
};

type LedgerItem = {
    _id: string;
    txnId?: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description?: string;
    createdAt: string;
};

const CODE_SNIPPETS = {
    curl: `curl -X POST http://localhost:5000/api/v1/services/sms/send \\
  -H "Content-Type: application/json" \\
  -H "x-user-api-key: sk_live_YOUR_API_KEY" \\
  -d '{"to": "+1234567890", "message": "Hello from Service API"}'`,

    node: `const axios = require('axios');

const response = await axios.post('http://localhost:5000/api/v1/services/sms/send', {
  to: '+1234567890',
  message: 'Hello from Service API'
}, {
  headers: { 'x-user-api-key': 'sk_live_YOUR_API_KEY' }
});

console.log(response.data);`,

    python: `import requests

url = "http://localhost:5000/api/v1/services/sms/send"
headers = {"x-user-api-key": "sk_live_YOUR_API_KEY"}
data = {"to": "+1234567890", "message": "Hello from Service API"}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
};

export default function UserDashboardPage() {
    const dispatch = useAppDispatch();
    const [balance, setBalance] = useState(0);
    const [usage, setUsage] = useState<UsageItem[]>([]);
    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [copiedTab, setCopiedTab] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/dashboard");
            if (data?.status && data?.data) {
                const bal = Number(data.data.balance || 0);
                setBalance(bal);
                setUsage(data.data.recentUsage || []);
                setLedger(data.data.recentLedger || []);
                dispatch(updateUser({ balance: bal }));
            }
        })();
    }, [dispatch]);

    const handleCopy = (lang: keyof typeof CODE_SNIPPETS) => {
        navigator.clipboard.writeText(CODE_SNIPPETS[lang]);
        setCopiedTab(lang);
        toast.success(`Copied ${lang.toUpperCase()} snippet to clipboard!`);
        setTimeout(() => setCopiedTab(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Developer Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Live credit metrics, quick integration code snippets, and API usage timeline.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/user/credits">
                        <Button variant="gradient" size="sm" className="gap-2 shadow-sm">
                            <Zap className="h-4 w-4" /> Buy Credits
                        </Button>
                    </Link>
                    <Link href="/user/api-keys">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <KeyRound className="h-4 w-4" /> API Keys
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metric Stat Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Credit Balance Card */}
                <Card className="relative overflow-hidden border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-1 dark:border-slate-800 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            Available Balance
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                            <Coins className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{balance}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">credits</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <Badge variant="success" className="text-[10px] font-semibold">
                                Active Wallet
                            </Badge>
                            <Link href="/user/credits" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                                Top up now <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* API Keys Card */}
                <Link href="/user/api-keys">
                    <Card className="group border-slate-200/80 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                API Keys
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-300">
                                <KeyRound className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                Manage Keys
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                Secret API Tokens & Permissions <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Usage Analytics Card */}
                <Link href="/user/usage">
                    <Card className="group border-slate-200/80 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-500/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Request Analytics
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-300">
                                <Activity className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                Usage Logs
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                Real-time API execution stream <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Quick Integration Code Snippets Widget */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                <Terminal className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Quick Start Integration</CardTitle>
                                <CardDescription>Send your first API call in seconds</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="curl" className="w-full">
                        <div className="flex items-center justify-between pb-2">
                            <TabsList className="bg-slate-100 dark:bg-slate-800">
                                <TabsTrigger value="curl">cURL</TabsTrigger>
                                <TabsTrigger value="node">Node.js</TabsTrigger>
                                <TabsTrigger value="python">Python</TabsTrigger>
                            </TabsList>
                        </div>

                        {(["curl", "node", "python"] as const).map((lang) => (
                            <TabsContent key={lang} value={lang} className="relative mt-2">
                                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200">
                                    <button
                                        onClick={() => handleCopy(lang)}
                                        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        {copiedTab === lang ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                <span className="text-emerald-400 font-semibold">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy Code</span>
                                            </>
                                        )}
                                    </button>
                                    <pre className="overflow-x-auto pr-24 leading-relaxed">{CODE_SNIPPETS[lang]}</pre>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Activity Stream Split (Recent Usage & Credit Ledger) */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent API Usage Card */}
                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                Recent API Requests
                            </CardTitle>
                            <CardDescription>Latest execution calls across all services</CardDescription>
                        </div>
                        <Link href="/user/usage" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                            View All →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {usage.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <Clock className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                <p className="mt-2 text-sm">No API calls recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {usage.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm transition-colors hover:bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                                                {item.serviceSlug}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {moment(item.createdAt).fromNow()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={item.status === "success" ? "success" : "danger"}
                                                className="text-[10px] capitalize"
                                            >
                                                {item.status}
                                            </Badge>
                                            <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                -{item.creditsCharged} cr
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Credit Ledger Card */}
                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Credit Ledger History
                            </CardTitle>
                            <CardDescription>Wallet balance changes and transactions</CardDescription>
                        </div>
                        <Link href="/user/credits" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                            Buy Credits →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {ledger.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <Coins className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                <p className="mt-2 text-sm">No ledger entries recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ledger.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm transition-colors hover:bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {item.txnId ? (
                                                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                        {item.txnId}
                                                    </span>
                                                ) : null}
                                                <p className="font-semibold text-slate-900 dark:text-white capitalize text-xs">
                                                    {item.type.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {item.description || moment(item.createdAt).fromNow()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xs font-bold ${
                                                    item.amount >= 0
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-rose-600 dark:text-rose-400"
                                                }`}
                                            >
                                                {item.amount >= 0 ? "+" : ""}
                                                {item.amount} cr
                                            </span>
                                            <p className="text-[11px] text-slate-400">
                                                bal {item.balanceAfter}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
