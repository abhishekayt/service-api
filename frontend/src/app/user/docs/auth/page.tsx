"use client";

import Link from "next/link";
import { ShieldCheck, Copy, Check, KeyRound, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";

const HEADERS_CODE = `Host: api.service.local
Content-Type: application/json
x-user-api-key: sk_live_f0e8a7bc...`;

export default function DocsAuthPage() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(HEADERS_CODE);
        setCopied(true);
        toast.success("Headers copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <span>Developer Portal</span>
                    <span>•</span>
                    <span>Security</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    Authentication Protocol
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Secure your integration connections using API Keys.
                </p>
            </div>

            {/* Core Specs */}
            <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
                <p>
                    The Service API uses API keys to authenticate requests. You can manage your API keys in the <Link href="/user/api-keys" className="font-semibold text-indigo-600 hover:underline">API Keys Console</Link>.
                </p>
                <p>
                    Your API keys carry powerful privileges and are billed directly against your wallet credit balance. Please keep your secret keys completely confidential and do not share them in public repositories (e.g. GitHub client repositories).
                </p>

                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">API Request Headers</h3>
                <p>
                    All API calls to our service endpoints must include the <code>x-user-api-key</code> header along with your secret API key. Requests without this header, or requests referencing deleted/deactivated keys, will result in an <code>HTTP 401 Unauthorized</code> response.
                </p>

                {/* Code highlight */}
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <button
                        onClick={handleCopy}
                        className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Headers</span>
                            </>
                        )}
                    </button>
                    <pre className="text-indigo-600 dark:text-indigo-400">{HEADERS_CODE}</pre>
                </div>
            </div>

            {/* Security Best Practices */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-indigo-500" />
                        API Key Best Practices
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Server-Side Only:</strong> Never include API keys directly in frontend Javascript code (React, Vue, angular, or HTML browser files). Call the Service API gateway only from secure backend servers.</li>
                        <li><strong>Rotation:</strong> If you suspect a key is leaked or compromised, navigate to your dashboard and immediately create a new key and delete/deactivate the compromised key.</li>
                        <li><strong>Environment Variables:</strong> Store keys safely in server environment variables (e.g. <code>.env</code> file or secrets managers).</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Call to action section */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 dark:border-slate-850 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ready to send SMS?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Explore the details, pricing, payloads, and parameters of our SMS service.</p>
                </div>
                <Link href="/user/docs/sms">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition flex items-center gap-1.5">
                        <span>SMS Endpoint</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
