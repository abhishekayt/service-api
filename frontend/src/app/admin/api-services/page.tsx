"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button } from "@/components/ui";
import AdminTableHeader from "@/components/admin/AdminTableHeader";

type ApiServiceRow = {
    _id: string;
    slug: string;
    name: string;
    description?: string | null;
    creditCost: number;
    provider: string;
    isActive: boolean;
};

type FormValues = {
    _id: string;
    slug: string;
    name: string;
    description: string;
    creditCost: number;
    provider: string;
    status: number;
};

type SortBy = "slug" | "name" | "creditCost" | "provider" | "status";
type SortOrder = "asc" | "desc";

const PROVIDERS: Record<string, string[]> = {
    sms: ["stub", "textlocal", "test"],
    email: ["stub", "smtp"]
};

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, "Too Short!").max(100, "Too Long!").required("Service name required.").trim(),
    description: Yup.string().nullable().optional(),
    creditCost: Yup.number().min(0, "Credit cost must be 0 or more").required("Credit cost required."),
    provider: Yup.string().required("Provider required."),
    status: Yup.number().required("Status required.")
});

export default function AdminApiServicesPage() {
    const [services, setServices] = useState<ApiServiceRow[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<"" | 0 | 1>("");
    const [sortBy, setSortBy] = useState<SortBy>("slug");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const [initialValues, setInitialValues] = useState<FormValues>({
        _id: "",
        slug: "",
        name: "",
        description: "",
        creditCost: 1,
        provider: "stub",
        status: 1
    });

    const fetchServices = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/api-services");
        if (data?.status && Array.isArray(data.data)) {
            setServices(data.data);
        } else {
            setServices([]);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const onSort = (nextSortBy: SortBy) => {
        if (sortBy === nextSortBy) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(nextSortBy);
            setSortOrder("asc");
        }
    };

    const filteredServices = useMemo(() => {
        let result = [...services];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (s) =>
                    s.slug.toLowerCase().includes(q) ||
                    s.name.toLowerCase().includes(q) ||
                    s.provider.toLowerCase().includes(q) ||
                    (s.description && s.description.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== "") {
            const isActiveBool = statusFilter === 1;
            result = result.filter((s) => s.isActive === isActiveBool);
        }

        result.sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            if (sortBy === "status") {
                valA = a.isActive ? 1 : 0;
                valB = b.isActive ? 1 : 0;
            } else {
                valA = a[sortBy] ?? "";
                valB = b[sortBy] ?? "";
            }

            if (typeof valA === "string") {
                const cmp = valA.localeCompare(String(valB));
                return sortOrder === "asc" ? cmp : -cmp;
            } else {
                return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
            }
        });

        return result;
    }, [services, searchQuery, statusFilter, sortBy, sortOrder]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="API Services"
                subtitle="Configure pricing, provider adapter, and status for public developer APIs."
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search API Service..."
                    />

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                const v = e.target.value;
                                setStatusFilter(v === "" ? "" : (Number(v) as 0 | 1));
                            }}
                            className="h-9 rounded-md border border-indigo-100 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option value="">All</option>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>

                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {filteredServices.length}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("slug")} name="Slug" active={sortBy === "slug"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={sortBy === "name"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("creditCost")} name="Credit Cost" active={sortBy === "creditCost"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("provider")} name="Provider" active={sortBy === "provider"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("status")} name="Status" active={sortBy === "status"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        {row.slug}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-medium">
                                        {row.name}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        {row.creditCost} credits
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                            {row.provider}
                                        </code>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <Badge variant={row.isActive ? "success" : "secondary"} size="sm">
                                            {row.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setInitialValues({
                                                        _id: row._id,
                                                        slug: row.slug,
                                                        name: row.name,
                                                        description: row.description || "",
                                                        creditCost: row.creditCost,
                                                        provider: row.provider,
                                                        status: row.isActive ? 1 : 0
                                                    });
                                                    setOpen(true);
                                                }}
                                                title="Edit API service"
                                                aria-label="Edit API service"
                                            >
                                                <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!filteredServices.length ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                        No Records Available.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {open ? (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div
                        data-slot="card"
                        className="w-full max-w-md rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <div data-slot="card-header" className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Update API Service</h3>
                            <p className="text-sm text-muted-foreground">
                                Update credit pricing, active provider adapter, and status.
                            </p>
                        </div>
                        <div data-slot="card-content" className="space-y-4 p-6 pt-0">
                            <Formik
                                initialValues={initialValues}
                                enableReinitialize
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                    const payload = {
                                        name: values.name,
                                        description: values.description,
                                        creditCost: Number(values.creditCost),
                                        provider: values.provider,
                                        isActive: Number(values.status) === 1
                                    };

                                    const { data } = await AxiosHelperAdmin.putData(`/api-services/${values._id}`, payload);
                                    if (data?.status) {
                                        toast.success(data.message);
                                        setOpen(false);
                                        fetchServices();
                                        resetForm();
                                    } else {
                                        toast.error(data?.message || "Failed to update service");
                                        setErrors(data?.data || {});
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting, values }) => {
                                    const family = values.slug.split(".")[0] || "sms";
                                    const providerOptions = PROVIDERS[family] || ["stub"];

                                    return (
                                        <Form className="space-y-3">
                                            <div className="space-y-2">
                                                <label htmlFor="service-slug-disabled" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Slug / Endpoint
                                                </label>
                                                <input
                                                    id="service-slug-disabled"
                                                    value={values.slug}
                                                    disabled
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-indigo-600 shadow-xs outline-none cursor-not-allowed dark:border-indigo-100 dark:bg-slate-800 dark:text-indigo-400"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="service-name" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Service Name
                                                </label>
                                                <Field
                                                    id="service-name"
                                                    name="name"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                    placeholder="e.g. SMS Send Service"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="service-description" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Description
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    id="service-description"
                                                    name="description"
                                                    rows={2}
                                                    data-slot="input"
                                                    className="w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                    placeholder="Short summary of this API service"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="description" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="service-creditCost" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Credit Cost
                                                </label>
                                                <Field
                                                    type="number"
                                                    id="service-creditCost"
                                                    name="creditCost"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="creditCost" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="service-provider" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Provider Adapter
                                                </label>
                                                <Field
                                                    as="select"
                                                    id="service-provider"
                                                    name="provider"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    {providerOptions.map((p) => (
                                                        <option key={p} value={p}>
                                                            {p}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage className="text-xs text-rose-600" name="provider" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="service-status" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Status
                                                </label>
                                                <Field
                                                    as="select"
                                                    id="service-status"
                                                    name="status"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    <option value={1}>Active</option>
                                                    <option value={0}>Inactive</option>
                                                </Field>
                                                <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="md"
                                                    className="border border-indigo-100 dark:border-indigo-100"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button disabled={isSubmitting} type="submit" variant="primary" size="md">
                                                    {isSubmitting ? "Saving..." : "Save"}
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


