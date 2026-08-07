"use client";

import { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Pencil, Server, Zap } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Badge } from "@/components/ui";

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
    sms: ["stub", "textlocal", "test"],
    email: ["stub", "smtp"]
};

const validationSchema = Yup.object({
    name: Yup.string().trim().required("Service name is required"),
    description: Yup.string().nullable(),
    creditCost: Yup.number().min(0, "Credit cost cannot be negative").required("Credit cost is required"),
    provider: Yup.string().required("Provider is required"),
    isActive: Yup.boolean().required("Status is required")
});

export default function AdminApiServicesPage() {
    const [services, setServices] = useState<ApiServiceRow[]>([]);
    const [selectedService, setSelectedService] = useState<ApiServiceRow | null>(null);

    const loadServices = async () => {
        const { data } = await AxiosHelperAdmin.getData("/api-services");
        if (data?.status) setServices(data.data || []);
    };

    useEffect(() => {
        loadServices();
    }, []);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="API Services"
                subtitle="Configure pricing, provider adapter, and status for public developer APIs."
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Configured Endpoints ({services.length})
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold">Slug / Endpoint</th>
                                <th className="px-4 py-2.5 font-semibold">Service Name</th>
                                <th className="px-4 py-2.5 font-semibold">Credit Cost</th>
                                <th className="px-4 py-2.5 font-semibold">Provider Adapter</th>
                                <th className="px-4 py-2.5 font-semibold">Status</th>
                                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50 dark:divide-slate-800">
                            {services.map((service) => (
                                <tr key={service._id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                        {service.slug}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{service.name}</div>
                                        {service.description && (
                                            <div className="text-xs text-slate-500 line-clamp-1">{service.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                                        {service.creditCost} credits
                                    </td>
                                    <td className="px-4 py-3">
                                        <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {service.provider}
                                        </code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={service.isActive ? "success" : "secondary"} size="sm">
                                            {service.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setSelectedService(service)}
                                            title="Edit API Service"
                                            aria-label="Edit API Service"
                                        >
                                            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {!services.length ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                        No API services registered in system.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Form Modal Dialog */}
            {selectedService ? (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div data-slot="card" className="w-full max-w-md rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100">
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold leading-none tracking-tight">Edit API Service</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Update credit pricing, active provider, and availability for <code className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedService.slug}</code>.
                            </p>
                        </div>
                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={{
                                    name: selectedService.name,
                                    description: selectedService.description || "",
                                    creditCost: selectedService.creditCost,
                                    provider: selectedService.provider,
                                    isActive: selectedService.isActive
                                }}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, setErrors }) => {
                                    const { data } = await AxiosHelperAdmin.putData(`/api-services/${selectedService._id}`, values);
                                    if (data?.status) {
                                        toast.success(data.message || "Service updated successfully");
                                        setSelectedService(null);
                                        loadServices();
                                    } else {
                                        toast.error(data?.message || "Failed to update service");
                                        setErrors(data?.data || {});
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting, values, setFieldValue }) => {
                                    const family = selectedService.slug.split(".")[0] || "sms";
                                    const providerOptions = PROVIDERS[family] || ["stub"];

                                    return (
                                        <Form className="space-y-3">
                                            <div className="space-y-1.5">
                                                <label htmlFor="service-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Service Name
                                                </label>
                                                <Field
                                                    id="service-name"
                                                    name="name"
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="e.g. SMS Send Service"
                                                />
                                                <ErrorMessage name="name" component="small" className="text-xs text-rose-600" />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="service-description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Description
                                                </label>
                                                <Field
                                                    id="service-description"
                                                    as="textarea"
                                                    name="description"
                                                    rows={2}
                                                    className="w-full rounded-md border border-indigo-100 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Short summary of this API endpoint"
                                                />
                                                <ErrorMessage name="description" component="small" className="text-xs text-rose-600" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label htmlFor="service-creditCost" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Credit Cost
                                                    </label>
                                                    <Field
                                                        id="service-creditCost"
                                                        type="number"
                                                        name="creditCost"
                                                        min={0}
                                                        className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    />
                                                    <ErrorMessage name="creditCost" component="small" className="text-xs text-rose-600" />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label htmlFor="service-provider" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Provider Adapter
                                                    </label>
                                                    <Field
                                                        id="service-provider"
                                                        as="select"
                                                        name="provider"
                                                        className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    >
                                                        {providerOptions.map((prov) => (
                                                            <option key={prov} value={prov}>
                                                                {prov}
                                                            </option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name="provider" component="small" className="text-xs text-rose-600" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="service-status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Status
                                                </label>
                                                <select
                                                    id="service-status"
                                                    value={values.isActive ? "true" : "false"}
                                                    onChange={(e) => setFieldValue("isActive", e.target.value === "true")}
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="md"
                                                    className="border border-indigo-100 dark:border-indigo-900"
                                                    onClick={() => setSelectedService(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button disabled={isSubmitting} type="submit" variant="primary" size="md">
                                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        </Form>
                                    );
                                }}
                            </Formik>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

