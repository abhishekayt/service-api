"use client";

import { useEffect, useState } from "react";
import { Play, Send, KeyRound, CheckCircle2, AlertCircle, Sparkles, Terminal, Code2 } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-toastify";
import axios from "axios";

type ApiKey = {
    _id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
};

export default function ApiPlaygroundPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [selectedApiKey, setSelectedApiKey] = useState<string>("");
    const [service, setService] = useState<"sms" | "email">("sms");
    const [toAddress, setToAddress] = useState<string>("9999999999");
    const [messageBody, setMessageBody] = useState<string>("Hello from Service API Developer Playground!");
    const [emailSubject, setEmailSubject] = useState<string>("Welcome to Service API");
    
    const [loading, setLoading] = useState(false);
    const [responseResult, setResponseResult] = useState<any>(null);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/api-keys");
            if (data?.status && data?.data) {
                const activeKeys = (data.data as ApiKey[]).filter((k) => k.isActive);
                setKeys(activeKeys);
            }
        })();
    }, []);

    const handleSendTestRequest = async () => {
        if (!selectedApiKey) {
            toast.error("Please enter or select an active API key to test!");
            return;
        }

        setLoading(true);
        setResponseResult(null);
        setResponseStatus(null);

        try {
            const endpoint = `http://localhost:5000/api/v1/services/${service}/send`;
            const payload = service === "sms" 
                ? { to: toAddress, message: messageBody }
                : { to: toAddress, subject: emailSubject, body: messageBody };

            const res = await axios.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-api-key": selectedApiKey,
                },
                validateStatus: () => true, // capture all status codes
            });

            setResponseStatus(res.status);
            setResponseResult(res.data);

            if (res.status >= 200 && res.status < 300) {
                toast.success("Test request executed successfully!");
            } else {
                toast.warning(`Request returned status ${res.status}`);
            }
        } catch (err: any) {
            setResponseStatus(500);
            setResponseResult({ error: err.message || "Failed to reach server" });
            toast.error("Network or server error during execution");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Interactive API Playground
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Test live SMS and Email API requests directly from your browser.
                    </p>
                </div>
                <Badge variant="gradient" className="w-fit text-xs px-3 py-1 font-bold">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> LIVE SANDBOX
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Panel: Request Builder */}
                <Card className="border-slate-200/80 dark:border-slate-800 lg:col-span-6">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-indigo-600" />
                            Request Builder
                        </CardTitle>
                        <CardDescription>Configure payload headers and body parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* API Key Selector / Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                                API Secret Key (`x-user-api-key`)
                            </label>
                            <input
                                type="password"
                                placeholder="sk_live_..."
                                value={selectedApiKey}
                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Please paste the full secret API key (e.g. <code>sk_live_...</code>). For security, only the prefix is stored on the server.
                            </p>
                        </div>

                        {/* Service Type Switcher */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Service Endpoint
                            </label>
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setService("sms")}
                                    className={`rounded-lg py-2 text-xs font-bold transition ${
                                        service === "sms"
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                >
                                    SMS Endpoint (`/sms/send`)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setService("email")}
                                    className={`rounded-lg py-2 text-xs font-bold transition ${
                                        service === "email"
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                >
                                    Email Endpoint (`/email/send`)
                                </button>
                            </div>
                        </div>

                        {/* Recipient Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Recipient (`to`)
                            </label>
                            <input
                                type="text"
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                placeholder={service === "sms" ? "+1234567890" : "user@example.com"}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                        </div>

                        {/* Email Subject if Email */}
                        {service === "email" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Subject (`subject`)
                                </label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Subject line"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>
                        )}

                        {/* Message Body */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {service === "sms" ? "Message Content (`message`)" : "Body HTML/Text (`body`)"}
                            </label>
                            <textarea
                                rows={3}
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                        </div>

                        <Button
                            type="button"
                            variant="gradient"
                            size="lg"
                            fullWidth
                            disabled={loading}
                            onClick={handleSendTestRequest}
                            className="mt-2 gap-2"
                        >
                            {loading ? (
                                "Executing Request..."
                            ) : (
                                <>
                                    <Play className="h-4 w-4 fill-white" /> Send Test Request
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Response Inspector */}
                <Card className="border-slate-200/80 dark:border-slate-800 lg:col-span-6 flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Live HTTP Response</CardTitle>
                            {responseStatus && (
                                <Badge
                                    variant={responseStatus >= 200 && responseStatus < 300 ? "success" : "danger"}
                                    className="font-mono text-xs font-bold"
                                >
                                    HTTP {responseStatus}
                                </Badge>
                            )}
                        </div>
                        <CardDescription>Response headers and body JSON returned from server</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-between">
                        {responseResult ? (
                            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 min-h-[260px] flex-1">
                                <p className="text-[10px] uppercase font-semibold text-slate-500 mb-2">
                                    Response Body (JSON)
                                </p>
                                <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
                                    {JSON.stringify(responseResult, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl dark:border-slate-800 flex-1">
                                <Terminal className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                                <p className="mt-3 text-sm font-semibold">No response captured yet.</p>
                                <p className="text-xs text-slate-500 max-w-xs mt-1">
                                    Configure your API key and click "Send Test Request" to execute the call.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
