"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Swal from "sweetalert2";
import moment from "moment";
import { Copy, Trash2, Plus, KeyRound, ShieldAlert, Check, Lock, Sparkles } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

type ApiKeyRow = {
    _id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt?: string | null;
    createdAt: string;
};

const schema = Yup.object({
    name: Yup.string().min(2, "Name must be at least 2 characters").required("Key name is required"),
});

export default function UserApiKeysPage() {
    const [keys, setKeys] = useState<ApiKeyRow[]>([]);
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const loadKeys = async () => {
        const { data } = await AxiosHelperUser.getData("/api-keys");
        if (data?.status) setKeys(data.data || []);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    const copyKey = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedKey(true);
        toast.success("API key copied to clipboard!");
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const revokeKey = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: `Revoke "${name}"?`,
            text: "This action is permanent. Any application using this key will be blocked immediately.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Revoke Key",
            confirmButtonColor: "#ef4444",
        });
        if (!result.isConfirmed) return;

        const { data } = await AxiosHelperUser.deleteData(`/api-keys/${id}`);
        if (data.status) {
            toast.success(data.message || "Key revoked successfully");
            loadKeys();
        } else {
            toast.error(data.message || "Failed to revoke key");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        API Keys Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Create secret access keys to authenticate your SMS and Email service requests.
                    </p>
                </div>
                <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="gap-2 shadow-sm"
                >
                    <Plus className="h-4 w-4" /> Create New Key
                </Button>
            </div>

            {/* One-Time Secret Alert Banner */}
            {createdKey && (
                <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 backdrop-blur-md dark:border-amber-500/30">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                    Save your secret API Key now!
                                </h3>
                                <Badge variant="warning" className="text-[10px] uppercase font-bold">
                                    One-Time Secret
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/80">
                                For security reasons, this secret key will <strong>never be shown again</strong>. Store it safely in your environment variables.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <code className="flex-1 overflow-x-auto rounded-xl border border-amber-200 bg-white px-3.5 py-2 font-mono text-xs font-semibold text-slate-900 shadow-xs dark:border-amber-900/40 dark:bg-slate-950 dark:text-amber-200">
                                    {createdKey}
                                </code>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    onClick={() => copyKey(createdKey)}
                                    className="gap-1.5 shrink-0"
                                >
                                    {copiedKey ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-300" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Copy Key</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys Data Table */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-base">Active & Revoked Credentials</CardTitle>
                    <CardDescription>
                        Key prefixes are shown below to help identify your configured services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key Name</TableHead>
                                <TableHead>Key Prefix</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <KeyRound className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                            <p className="text-sm font-medium">No API keys created yet.</p>
                                            <p className="text-xs text-slate-400">
                                                Click "Create New Key" above to generate your first secret token.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {keys.map((key) => (
                                <TableRow key={key._id}>
                                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                                        {key.name}
                                    </TableCell>
                                    <TableCell>
                                        <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {key.keyPrefix}••••••••
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={key.isActive ? "success" : "danger"}
                                            className="text-[11px] font-semibold capitalize"
                                        >
                                            {key.isActive ? "Active" : "Revoked"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                                        {key.lastUsedAt ? moment(key.lastUsedAt).fromNow() : "Never used"}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                                        {moment(key.createdAt).format("DD MMM YYYY, hh:mm A")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {key.isActive ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => revokeKey(key._id, key.name)}
                                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Revoked</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create API Key Dialog Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            Generate New API Key
                        </DialogTitle>
                        <DialogDescription>
                            Enter a label to help identify where this secret key will be used (e.g. "Production Backend", "Staging Server").
                        </DialogDescription>
                    </DialogHeader>

                    <Formik
                        initialValues={{ name: "" }}
                        validationSchema={schema}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            const { data } = await AxiosHelperUser.postData("/api-keys", values);
                            if (data.status) {
                                toast.success("API Key generated!");
                                setCreatedKey(data.data?.apiKey || null);
                                resetForm();
                                setIsCreateOpen(false);
                                loadKeys();
                            } else {
                                toast.error(data.message || "Failed to generate API Key");
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="mt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Key Name / Purpose
                                    </label>
                                    <Field
                                        name="name"
                                        placeholder="e.g. Production Server SMS"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                    <ErrorMessage className="text-xs font-medium text-rose-500" name="name" component="p" />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="md"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        size="md"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Generating..." : "Generate Secret Key"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
}
