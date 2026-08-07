"use client";

import { useEffect, useState, useMemo } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

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
    const [query, setQuery] = useState("");
    const [selectedService, setSelectedService] = useState<ApiServiceRow | null>(null);

    const loadServices = async () => {
        const { data } = await AxiosHelperAdmin.getData("/api-services");
        if (data?.status) setServices(data.data || []);
    };

    useEffect(() => {
        loadServices();
    }, []);

    const filteredServices = useMemo(() => {
        if (!query.trim()) return services;
        const q = query.toLowerCase().trim();
        return services.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.slug.toLowerCase().includes(q) ||
                s.provider.toLowerCase().includes(q)
        );
    }, [services, query]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="API Services"
                subtitle="Set pricing, provider, and availability for each public service."
            />

            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, slug, provider"
                    className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Credit Cost</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map((service) => (
                            <tr key={service._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{service.name}</p>
                                    {service.description ? (
                                        <p className="text-xs text-slate-500">{service.description}</p>
                                    ) : null}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                                    {service.slug}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                                    {service.creditCost}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{service.provider}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={service.isActive ? "success" : "secondary"} size="sm">
                                        {service.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setSelectedService(service)}
                                    >
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {!filteredServices.length ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                                    No services found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal Pop-Up */}
            {selectedService ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit API Service</h3>
                            <p className="text-xs text-slate-500">
                                Endpoint: <code className="font-mono text-indigo-600 dark:text-indigo-400">{selectedService.slug}</code>
                            </p>
                        </div>

                        <Formik
                            initialValues={{
                                name: selectedService.name,
                                description: selectedService.description || "",
                                creditCost: selectedService.creditCost,
                                provider: selectedService.provider,
                                isActive: selectedService.isActive
                            }}
                            validationSchema={validationSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                const { data } = await AxiosHelperAdmin.putData(`/api-services/${selectedService._id}`, values);
                                if (data?.status) {
                                    toast.success(data.message);
                                    setSelectedService(null);
                                    loadServices();
                                } else {
                                    toast.error(data?.message || "Update failed");
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting, values, setFieldValue }) => {
                                const family = selectedService.slug.split(".")[0] || "sms";
                                const providerOptions = PROVIDERS[family] || ["stub"];

                                return (
                                    <Form className="space-y-3">
                                        <div>
                                            <label className="text-xs text-slate-500">Service Name</label>
                                            <Field
                                                name="name"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                            />
                                            <ErrorMessage name="name" component="small" className="text-xs text-red-600" />
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-500">Description</label>
                                            <Field
                                                as="textarea"
                                                name="description"
                                                rows={2}
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                            />
                                            <ErrorMessage name="description" component="small" className="text-xs text-red-600" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-slate-500">Credit Cost</label>
                                                <Field
                                                    type="number"
                                                    min={0}
                                                    name="creditCost"
                                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                                />
                                                <ErrorMessage name="creditCost" component="small" className="text-xs text-red-600" />
                                            </div>

                                            <div>
                                                <label className="text-xs text-slate-500">Provider</label>
                                                <Field
                                                    as="select"
                                                    name="provider"
                                                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                                >
                                                    {providerOptions.map((p) => (
                                                        <option key={p} value={p}>
                                                            {p}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="provider" component="small" className="text-xs text-red-600" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-500">Status</label>
                                            <select
                                                value={values.isActive ? "true" : "false"}
                                                onChange={(e) => setFieldValue("isActive", e.target.value === "true")}
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedService(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                                                {isSubmitting ? "Saving..." : "Save"}
                                            </Button>
                                        </div>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </div>
            ) : null}
        </section>
    );
}



