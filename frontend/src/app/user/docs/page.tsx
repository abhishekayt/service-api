"use client";

import { useState } from "react";
import {
    BookOpen,
    Code2,
    Copy,
    Check,
    Terminal,
    Cpu,
    Mail,
    MessageSquare,
    AlertTriangle,
    ShieldCheck,
    Coins,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-toastify";

const CODE_EXAMPLES = {
    sms: {
        curl: `curl -X POST http://localhost:5000/api/v1/services/sms/send \\
  -H "Content-Type: application/json" \\
  -H "x-user-api-key: your_api_key_here" \\
  -d '{
    "to": "+1234567890",
    "message": "Hello from Service API!"
  }'`,
        node: `const axios = require('axios');

axios.post('http://localhost:5000/api/v1/services/sms/send', {
  to: '+1234567890',
  message: 'Hello from Service API!'
}, {
  headers: {
    'x-user-api-key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));`,
        python: `import requests

url = "http://localhost:5000/api/v1/services/sms/send"
headers = {
    "x-user-api-key": "your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "to": "+1234567890",
    "message": "Hello from Service API!"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
    },
    email: {
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
    }
};

const RESPONSE_EXAMPLES = {
    sms: `{
  "status": true,
  "message": "SMS dispatched successfully",
  "data": {
    "provider": "test",
    "messageId": "test_sms_1691068200000",
    "to": "+1234567890",
    "delivered": true
  }
}`,
    email: `{
  "status": true,
  "message": "Email sent successfully",
  "data": {
    "provider": "smtp",
    "messageId": "<smtp_1691068200000@server.com>",
    "to": "recipient@example.com",
    "subject": "Welcome to Service API",
    "delivered": true
  }
}`
};

export default function UserDocsPage() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success("Snippet copied to clipboard!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    API Reference & Documentation
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Complete integration specs, parameter tables, and SDK code examples.
                </p>
            </div>

            {/* General Authentication Guide */}
            <Card className="border-indigo-100/80 bg-linear-to-r from-indigo-50/20 to-purple-50/20 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Authentication
                    </CardTitle>
                    <CardDescription>How to authenticate your requests to the Service API gateway.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        All API requests must be authenticated using your project's Secret API key. Your API key provides access to make billing transactions (credits will be deducted from your wallet balance per successful delivery).
                    </p>
                    <p>
                        Pass your API key as a header key name in your HTTP request header parameters:
                    </p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Header Key:</span> x-user-api-key <br />
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Header Value:</span> sk_live_your_secret_key_here
                    </div>
                </CardContent>
            </Card>

            {/* Core Services References */}
            <div className="grid gap-8 lg:grid-cols-12">
                {/* Documentation Section */}
                <div className="lg:col-span-7 space-y-8">
                    {/* SMS Service Documentation */}
                    <Card className="border-slate-200/80 dark:border-slate-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    SMS Endpoint
                                </CardTitle>
                                <Badge variant="gradient" className="font-mono text-xs font-bold">1 Credit / SMS</Badge>
                            </div>
                            <CardDescription>Send mobile text messages via configured providers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Endpoint Path */}
                            <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 font-mono text-xs">
                                <span className="rounded bg-indigo-600 px-2 py-0.5 font-bold text-white text-[10px]">POST</span>
                                <span className="text-slate-800 dark:text-slate-200">/api/v1/services/sms/send</span>
                            </div>

                            {/* Parameters Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                                            <th className="pb-2">Parameter</th>
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
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Recipient's mobile number, including country code (e.g. <code>+1234567890</code>).</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">message</td>
                                            <td className="py-2.5 font-mono text-slate-500">string</td>
                                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">Required</Badge></td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">The message text content to send.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Service Documentation */}
                    <Card className="border-slate-200/80 dark:border-slate-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-indigo-500" />
                                    Email Endpoint
                                </CardTitle>
                                <Badge variant="gradient" className="font-mono text-xs font-bold">2 Credits / Email</Badge>
                            </div>
                            <CardDescription>Dispatch HTML/text email letters through SMTP servers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Endpoint Path */}
                            <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 font-mono text-xs">
                                <span className="rounded bg-indigo-600 px-2 py-0.5 font-bold text-white text-[10px]">POST</span>
                                <span className="text-slate-800 dark:text-slate-200">/api/v1/services/email/send</span>
                            </div>

                            {/* Parameters Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                                            <th className="pb-2">Parameter</th>
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
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Subject line of the email.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">body</td>
                                            <td className="py-2.5 font-mono text-slate-500">string</td>
                                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">Required</Badge></td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">The body text contents. HTML rendering is fully supported.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* HTTP Error Status Codes Table */}
                    <Card className="border-slate-200/80 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Gateway HTTP Error Responses
                            </CardTitle>
                            <CardDescription>Expected response status codes and failure causes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                                            <th className="pb-2">HTTP Status</th>
                                            <th className="pb-2">Standard Code</th>
                                            <th className="pb-2">Error Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        <tr>
                                            <td className="py-2.5"><Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">400 Bad Request</Badge></td>
                                            <td className="py-2.5 font-mono">VALIDATION</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Required payload body parameters are missing, blank, or improperly formatted.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5"><Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/5">401 Unauthorized</Badge></td>
                                            <td className="py-2.5 font-mono">UNAUTHORIZED</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">API Key is missing, deleted, inactive, or invalid. Verify your <code>x-user-api-key</code> request header.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5"><Badge variant="outline" className="border-rose-600/40 text-rose-600 bg-rose-600/5">402 Payment Required</Badge></td>
                                            <td className="py-2.5 font-mono">INSUFFICIENT_CREDITS</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">Wallet balance is lower than the service credit charge cost. Top up credit balance to proceed.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5"><Badge variant="outline" className="border-slate-500/30 text-slate-500">404 Not Found</Badge></td>
                                            <td className="py-2.5 font-mono">NOT_FOUND</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">The specific API Service type is deleted, disabled, or does not exist.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5"><Badge variant="outline" className="border-rose-500/30 text-rose-500">500 Server Error</Badge></td>
                                            <td className="py-2.5 font-mono">PROVIDER_ERROR / INTERNAL</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">External provider integration returned a failure or connection timed out. Spent credits are automatically refunded.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Code Examples & Playgrounds */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Interactive Code Snippets */}
                    <Card className="border-slate-800 bg-slate-950 text-slate-100 flex flex-col min-h-[500px]">
                        <CardHeader className="border-b border-slate-900 pb-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                                <Cpu className="h-4 w-4 text-indigo-400" />
                                Integration SDK Examples
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 flex flex-col justify-between">
                            <Tabs defaultValue="sms" className="flex-1 flex flex-col">
                                <div className="border-b border-slate-900 px-4 py-2 bg-slate-900/40">
                                    <TabsList className="bg-slate-900/60 p-1 border border-slate-800/80">
                                        <TabsTrigger value="sms" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">SMS Integration</TabsTrigger>
                                        <TabsTrigger value="email" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Email Integration</TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* SMS Example Tabs */}
                                <TabsContent value="sms" className="flex-1 flex flex-col mt-0">
                                    <Tabs defaultValue="curl" className="flex-1 flex flex-col">
                                        <div className="flex border-b border-slate-900 px-4 py-1.5 gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                                            <TabsList className="bg-transparent gap-3 border-none p-0">
                                                <TabsTrigger value="curl" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">cURL</TabsTrigger>
                                                <TabsTrigger value="node" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">Node.js</TabsTrigger>
                                                <TabsTrigger value="python" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">Python</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        {(["curl", "node", "python"] as const).map((lang) => (
                                            <TabsContent key={lang} value={lang} className="flex-1 p-4 relative font-mono text-[11px] leading-relaxed select-text mt-0">
                                                <button
                                                    onClick={() => handleCopy(CODE_EXAMPLES.sms[lang], `sms_${lang}`)}
                                                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    {copiedKey === `sms_${lang}` ? (
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
                                                <pre className="overflow-x-auto whitespace-pre-wrap pr-16 text-emerald-400/90">{CODE_EXAMPLES.sms[lang]}</pre>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </TabsContent>

                                {/* Email Example Tabs */}
                                <TabsContent value="email" className="flex-1 flex flex-col mt-0">
                                    <Tabs defaultValue="curl" className="flex-1 flex flex-col">
                                        <div className="flex border-b border-slate-900 px-4 py-1.5 gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                                            <TabsList className="bg-transparent gap-3 border-none p-0">
                                                <TabsTrigger value="curl" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">cURL</TabsTrigger>
                                                <TabsTrigger value="node" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">Node.js</TabsTrigger>
                                                <TabsTrigger value="python" className="data-[state=active]:text-indigo-400 bg-transparent px-0 pb-0">Python</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        {(["curl", "node", "python"] as const).map((lang) => (
                                            <TabsContent key={lang} value={lang} className="flex-1 p-4 relative font-mono text-[11px] leading-relaxed select-text mt-0">
                                                <button
                                                    onClick={() => handleCopy(CODE_EXAMPLES.email[lang], `email_${lang}`)}
                                                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    {copiedKey === `email_${lang}` ? (
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
                                                <pre className="overflow-x-auto whitespace-pre-wrap pr-16 text-emerald-400/90">{CODE_EXAMPLES.email[lang]}</pre>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Sample Success Responses */}
                    <Card className="border-slate-800 bg-slate-950 text-slate-100">
                        <CardHeader className="border-b border-slate-900 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                                <Terminal className="h-4 w-4 text-emerald-400" />
                                Response Payloads (HTTP 200 OK)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="sms">
                                <div className="border-b border-slate-900 px-4 py-2 bg-slate-900/40">
                                    <TabsList className="bg-slate-900/60 p-1 border border-slate-800/80">
                                        <TabsTrigger value="sms" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">SMS Response</TabsTrigger>
                                        <TabsTrigger value="email" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Email Response</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="sms" className="p-4 relative mt-0">
                                    <button
                                        onClick={() => handleCopy(RESPONSE_EXAMPLES.sms, "res_sms")}
                                        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        {copiedKey === "res_sms" ? (
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
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-400/90">{RESPONSE_EXAMPLES.sms}</pre>
                                </TabsContent>
                                <TabsContent value="email" className="p-4 relative mt-0">
                                    <button
                                        onClick={() => handleCopy(RESPONSE_EXAMPLES.email, "res_email")}
                                        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-sans text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        {copiedKey === "res_email" ? (
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
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-indigo-400/90">{RESPONSE_EXAMPLES.email}</pre>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
