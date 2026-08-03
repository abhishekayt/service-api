"use client";

import { AlertTriangle, ShieldAlert, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";

export default function DocsErrorsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <span>Developer Portal</span>
                    <span>•</span>
                    <span>Troubleshooting</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    Error Reference
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Understand HTTP error response states, JSON validation formats, and refund guarantees.
                </p>
            </div>

            {/* Error Table */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-bold">Standard API Gateway Errors</CardTitle>
                    <CardDescription>All API errors return a standard JSON envelope detailing the error cause.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                                    <th className="pb-3 w-1/4">HTTP Status</th>
                                    <th className="pb-3 w-1/4">Error Code</th>
                                    <th className="pb-3">Description & Resolution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                <tr>
                                    <td className="py-4">
                                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">400 Bad Request</Badge>
                                    </td>
                                    <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-355">VALIDATION</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        One or more parameters in the request payload body are missing or blank. 
                                        <br /><span className="text-[10px] text-slate-400">Example: Field 'to' and 'message' are required.</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <Badge variant="outline" className="border-rose-500/30 text-rose-500 bg-rose-500/5">401 Unauthorized</Badge>
                                    </td>
                                    <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-355">UNAUTHORIZED</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        The credentials passed in the <code>x-user-api-key</code> header are invalid or inactive. Check that the key has not been deleted.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <Badge variant="outline" className="border-rose-600/40 text-rose-600 bg-rose-600/5">402 Payment Required</Badge>
                                    </td>
                                    <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-355">INSUFFICIENT_CREDITS</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        The user's credit balance is too low to process this dispatch request. Please top up in the billing console.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <Badge variant="outline" className="border-slate-500/30 text-slate-505">404 Not Found</Badge>
                                    </td>
                                    <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-355">NOT_FOUND</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        The path/endpoint called does not exist or the service type has been disabled in the admin dashboard.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <Badge variant="outline" className="border-rose-500/30 text-rose-505">500 Server Error</Badge>
                                    </td>
                                    <td className="py-4 font-mono font-bold text-slate-700 dark:text-slate-355">PROVIDER_ERROR</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        The provider selected for this route (SMTP, TextLocal, etc.) failed to execute the delivery. Spent credits are immediately refunded.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Error Payload Structure */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200/80 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                            Validation Error Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                        <pre>{`{
  "status": false,
  "message": "Fields 'to' and 'message' are required",
  "data": []
}`}</pre>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 bg-linear-to-br from-indigo-50/10 to-emerald-50/10 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-emerald-500 animate-spin-slow" />
                            Refund Guarantees
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
                        <p>
                            To maintain maximum transparency, the Service API implements **pre-delivery billing**. Wallet credits are debited immediately before calling the communication provider.
                        </p>
                        <p>
                            If the communication provider fails to dispatch the message (e.g. SMTP server offline or API credits empty), our gateway catches the failure, logs the exception, and automatically executes a **full wallet refund** of the debited credits back to your account.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
