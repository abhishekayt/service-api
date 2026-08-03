"use client";

import Link from "next/link";
import { Mail, Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-toastify";

const CODE_EXAMPLES = {
    curl: `curl -X POST http://localhost:5000/api/v1/services/email/send \\
  -H "Content-Type: application/json" \\
  -H "x-user-api-key: your_api_key_here" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Welcome to Service API",
    "body": "Hello! This is a test email sent via Service API."
  }'`,
    node: `const axios = require('axios');

axios.post('http://localhost:5000/api/v1/services/email/send', {
  to: 'recipient@example.com',
  subject: 'Welcome to Service API',
  body: 'Hello! This is a test email sent via Service API.'
}, {
  headers: {
    'x-user-api-key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));`,
    python: `import requests

url = "http://localhost:5000/api/v1/services/email/send"
headers = {
    "x-user-api-key": "your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "to": "recipient@example.com",
    "subject": "Welcome to Service API",
    "body": "Hello! This is a test email sent via Service API."
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
};

const RESPONSE_EXAMPLE = `{
  "status": true,
  "message": "Email sent successfully",
  "data": {
    "provider": "smtp",
    "messageId": "<smtp_1691068200000@server.com>",
    "to": "recipient@example.com",
    "subject": "Welcome to Service API",
    "delivered": true
  }
}`;

export default function DocsEmailPage() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success("Snippet copied!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <span>Developer Portal</span>
                    <span>•</span>
                    <span>API Reference</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Mail className="h-8 w-8 text-purple-500" />
                    Email Service
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Dispatch rich HTML or plain text emails through our high-speed SMTP relays.
                </p>
            </div>

            {/* Path and cost */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2.5 font-mono text-xs">
                    <span className="rounded bg-indigo-600 px-2 py-0.5 font-bold text-white text-[10px]">POST</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">/api/v1/services/email/send</span>
                </div>
                <Badge variant="gradient" className="font-mono text-xs font-bold bg-purple-600">Cost: 2 Credits</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Details Column */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Parameters Table */}
                    <Card className="border-slate-200/80 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Request Body Parameters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                                            <th className="pb-2">Field</th>
                                            <th className="pb-2">Type</th>
                                            <th className="pb-2">Status</th>
                                            <th className="pb-2">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        <tr>
                                            <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">to</td>
                                            <td className="py-2.5 font-mono text-slate-500">string</td>
                                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">Required</Badge></td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Destination email address (e.g. <code>user@example.com</code>).</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">subject</td>
                                            <td className="py-2.5 font-mono text-slate-500">string</td>
                                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">Required</Badge></td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Subject line content for the email.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">body</td>
                                            <td className="py-2.5 font-mono text-slate-500">string</td>
                                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">Required</Badge></td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">The body text content. Full HTML syntax is parsed and rendered.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Success response preview */}
                    <Card className="border-slate-800 bg-slate-950 text-slate-100">
                        <CardHeader className="border-b border-slate-900 pb-3">
                            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-white">
                                Response Body (HTTP 200 OK)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 relative">
                            <button
                                onClick={() => handleCopy(RESPONSE_EXAMPLE, "res")}
                                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                {copiedKey === "res" ? (
                                    <>
                                        <Check className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-400 font-semibold">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                            <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-400/90 font-mono">{RESPONSE_EXAMPLE}</pre>
                        </CardContent>
                    </Card>
                </div>

                {/* Code Examples Column */}
                <div className="lg:col-span-6">
                    <Card className="border-slate-800 bg-slate-950 text-slate-100 flex flex-col h-full min-h-[400px]">
                        <CardHeader className="border-b border-slate-900 pb-4">
                            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-white">
                                Code Snippets
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 flex flex-col justify-between">
                            <Tabs defaultValue="curl" className="flex-1 flex flex-col">
                                <div className="border-b border-slate-900 px-4 py-2 bg-slate-900/40 text-[10px] uppercase font-semibold text-slate-400">
                                    <TabsList className="bg-slate-900/60 p-1 border border-slate-850 gap-2">
                                        <TabsTrigger value="curl" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">cURL</TabsTrigger>
                                        <TabsTrigger value="node" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Node.js</TabsTrigger>
                                        <TabsTrigger value="python" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Python</TabsTrigger>
                                    </TabsList>
                                </div>

                                {(["curl", "node", "python"] as const).map((lang) => (
                                    <TabsContent key={lang} value={lang} className="flex-1 p-4 relative font-mono text-[11px] leading-relaxed select-text mt-0">
                                        <button
                                            onClick={() => handleCopy(CODE_EXAMPLES[lang], lang)}
                                            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                        >
                                            {copiedKey === lang ? (
                                                <>
                                                    <Check className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-emerald-400 font-semibold">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                        <pre className="overflow-x-auto whitespace-pre-wrap pr-16 text-emerald-400/95">{CODE_EXAMPLES[lang]}</pre>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Next route Call to action */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 dark:border-slate-850 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review error responses?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Understand API validation errors, unauthorized states, and refund structures.</p>
                </div>
                <Link href="/user/docs/errors">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition flex items-center gap-1.5">
                        <span>Error Reference</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
