"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, ShieldCheck, MessageSquare, Mail, AlertTriangle, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";

export default function DocsIntroPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Hero Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <span>Developer Portal</span>
                    <span>•</span>
                    <span>API Specs</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight sm:text-4xl">
                    Service API Developer Guide
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    Integrate reliable communication adapters into your software application. Clean payload protocols, live usage logs, wallet credit billing, and high-performance delivery channels.
                </p>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-indigo-100/80 bg-linear-to-br from-indigo-50/15 via-white to-purple-50/10 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <Badge className="w-fit text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300">CORE SERVICE</Badge>
                        <CardTitle className="text-base flex items-center gap-2 mt-2">
                            <MessageSquare className="h-5 w-5 text-indigo-500" />
                            SMS API Gateway
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-xs text-slate-500">
                            Dispatch text notifications and OTP verifications worldwide with automatic credit debits and retry logic.
                        </p>
                        <Link href="/user/docs/sms" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition">
                            SMS API Reference <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-indigo-100/80 bg-linear-to-br from-indigo-50/15 via-white to-purple-50/10 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <Badge className="w-fit text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/60 dark:text-purple-300">CORE SERVICE</Badge>
                        <CardTitle className="text-base flex items-center gap-2 mt-2">
                            <Mail className="h-5 w-5 text-purple-500" />
                            Email API Gateway
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-xs text-slate-500">
                            Send transaction receipts, newsletters, or verification codes formatted in plain text or customizable rich HTML.
                        </p>
                        <Link href="/user/docs/email" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition">
                            Email API Reference <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Steps Section */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Three Steps to Integrate</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 rounded-xl border border-slate-100 bg-white/60 p-4 shadow-2xs dark:border-slate-850 dark:bg-slate-900/60">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            1
                        </div>
                        <h4 className="text-xs font-bold">Generate Secret API Key</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Navigate to the <Link href="/user/api-keys" className="font-semibold text-indigo-600 hover:underline">API Keys</Link> page and create a secret key. Safely copy the secret credential.
                        </p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-slate-100 bg-white/60 p-4 shadow-2xs dark:border-slate-850 dark:bg-slate-900/60">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            2
                        </div>
                        <h4 className="text-xs font-bold">Top-up Wallet Credits</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Each request consumes wallet credits (1 cr for SMS, 2 cr for Email). Top up your wallet in <Link href="/user/credits" className="font-semibold text-indigo-600 hover:underline">Buy Credits</Link>.
                        </p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-slate-100 bg-white/60 p-4 shadow-2xs dark:border-slate-850 dark:bg-slate-900/60">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            3
                        </div>
                        <h4 className="text-xs font-bold">Configure headers & payload</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Make HTTP POST requests to the respective service routes including the API key in the headers under <code>x-user-api-key</code>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to action section */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 dark:border-slate-850 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ready to authenticate?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Learn how the headers and key authorization layers work in detail.</p>
                </div>
                <Link href="/user/docs/auth">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition">
                        Next: Authentication
                    </button>
                </Link>
            </div>
        </div>
    );
}
