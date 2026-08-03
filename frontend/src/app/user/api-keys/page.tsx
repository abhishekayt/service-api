"use client";

import { Form, Formik, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Swal from "sweetalert2";
import moment from "moment";
import { Copy, Trash2 } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui";

type ApiKeyRow = {
    _id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt?: string | null;
    createdAt: string;
};

const schema = Yup.object({
    name: Yup.string().min(2).required("Name is required")
});

export default function UserApiKeysPage() {
    const [keys, setKeys] = useState<ApiKeyRow[]>([]);
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    const loadKeys = async () => {
        const { data } = await AxiosHelperUser.getData("/api-keys");
        if (data?.status) setKeys(data.data || []);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    const copyKey = async (value: string) => {
        await navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
    };

    const revokeKey = async (id: string) => {
        const result = await Swal.fire({
            title: "Revoke API key?",
            text: "This cannot be undone. Requests with this key will fail.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Revoke"
        });
        if (!result.isConfirmed) return;

        const { data } = await AxiosHelperUser.deleteData(`/api-keys/${id}`);
        if (data.status) {
            toast.success(data.message);
            loadKeys();
        } else {
            toast.error(data.message);
        }
    };

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Keys</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create keys to authenticate service requests. Secrets are shown once.</p>
            </div>

            {createdKey ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Copy your new API key now</p>
                    <div className="mt-2 flex items-center gap-2">
                        <code className="flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900">{createdKey}</code>
                        <Button type="button" size="sm" variant="secondary" onClick={() => copyKey(createdKey)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Create key</h2>
                <Formik
                    initialValues={{ name: "" }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        const { data } = await AxiosHelperUser.postData("/api-keys", values);
                        if (data.status) {
                            toast.success(data.message);
                            setCreatedKey(data.data?.apiKey || null);
                            resetForm();
                            loadKeys();
                        } else {
                            toast.error(data.message);
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="mt-3 flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <Field name="name" placeholder="Key name (e.g. Production)" className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
                                <ErrorMessage className="text-xs text-red-600" name="name" component="small" />
                            </div>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Generate key"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Prefix</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Last used</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {keys.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                                    No API keys yet.
                                </td>
                            </tr>
                        ) : null}
                        {keys.map((key) => (
                            <tr key={key._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{key.name}</td>
                                <td className="px-4 py-3 font-mono text-xs">{key.keyPrefix}…</td>
                                <td className="px-4 py-3">{key.isActive ? "Active" : "Revoked"}</td>
                                <td className="px-4 py-3 text-slate-500">{key.lastUsedAt ? moment(key.lastUsedAt).fromNow() : "Never"}</td>
                                <td className="px-4 py-3 text-slate-500">{moment(key.createdAt).format("DD MMM YYYY")}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button type="button" size="sm" variant="ghost" onClick={() => revokeKey(key._id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
