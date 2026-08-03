"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button } from "@/components/ui";

type ApiServiceRow = {
    _id: string;
    slug: string;
    name: string;
    description?: string | null;
    creditCost: number;
    provider: string;
    isActive: boolean;
};

const PROVIDERS: Record<string, string[]> = {
    sms: ["stub", "textlocal"],
    email: ["stub", "smtp"]
};

export default function AdminApiServicesPage() {
    const [services, setServices] = useState<ApiServiceRow[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null);

    const load = async () => {
        const { data } = await AxiosHelperAdmin.getData("/api-services");
        if (data?.status) setServices(data.data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const save = async (service: ApiServiceRow) => {
        setSavingId(service._id);
        const { data } = await AxiosHelperAdmin.putData(`/api-services/${service._id}`, {
            name: service.name,
            description: service.description,
            creditCost: service.creditCost,
            provider: service.provider,
            isActive: service.isActive
        });
        setSavingId(null);
        if (data?.status) {
            toast.success(data.message);
            load();
        } else {
            toast.error(data?.message || "Update failed");
        }
    };

    const updateLocal = (id: string, patch: Partial<ApiServiceRow>) => {
        setServices((prev) => prev.map((s) => (s._id === id ? { ...s, ...patch } : s)));
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="API Services" subtitle="Set pricing, provider, and availability for each public service." />
            <div className="space-y-3">
                {services.map((service) => {
                    const family = service.slug.split(".")[0] || "sms";
                    const providerOptions = PROVIDERS[family] || ["stub"];
                    return (
                        <div key={service._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{service.slug}</p>
                                    <p className="text-xs text-slate-500">{service.name}</p>
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={service.isActive}
                                        onChange={(e) => updateLocal(service._id, { isActive: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <div>
                                    <label className="text-xs text-slate-500">Credit cost</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={service.creditCost}
                                        onChange={(e) => updateLocal(service._id, { creditCost: Number(e.target.value) })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Provider</label>
                                    <select
                                        value={service.provider}
                                        onChange={(e) => updateLocal(service._id, { provider: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                    >
                                        {providerOptions.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" variant="primary" disabled={savingId === service._id} onClick={() => save(service)}>
                                        {savingId === service._id ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
