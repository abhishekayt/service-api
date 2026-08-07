"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Badge, Button } from "@/components/ui";
import { getSweetAlertConfig } from "@/helpers/utils";
import AdminTableHeader from "@/components/admin/AdminTableHeader";

type CreditPack = {
    _id: string;
    name: string;
    credits: number;
    amountInPaise: number;
    currency: string;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
};

type FormValues = {
    _id: string;
    name: string;
    credits: number;
    amountInRupees: number;
    sortOrder: number;
    status: number;
};

type SortBy = "name" | "credits" | "amountInRupees" | "sortOrder" | "status";
type SortOrder = "asc" | "desc";

const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required("Pack name required."),
    credits: Yup.number().min(1, "Must be at least 1 credit").required("Credits required."),
    amountInRupees: Yup.number().min(1, "Price must be at least ₹1").required("Price required."),
    sortOrder: Yup.number().min(0, "Sort order cannot be negative"),
    status: Yup.number().required("Status required.")
});

export default function AdminCreditPacksPage() {
    const [packs, setPacks] = useState<CreditPack[]>([]);
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<"" | 0 | 1>("");
    const [sortBy, setSortBy] = useState<SortBy>("sortOrder");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const [initialValues, setInitialValues] = useState<FormValues>({
        _id: "",
        name: "",
        credits: 100,
        amountInRupees: 100,
        sortOrder: 0,
        status: 1
    });

    const fetchPacks = useCallback(async () => {
        const { data } = await AxiosHelperAdmin.getData("/credit-packs");
        if (data?.status && Array.isArray(data.data)) {
            setPacks(data.data);
        } else {
            setPacks([]);
        }
    }, []);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({ title: "Delete Credit Pack?" }));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/credit-packs/${id}`);
            if (data?.status) {
                toast.success(data.message);
                fetchPacks();
            } else {
                toast.error(data?.message || "Failed to delete pack");
            }
        }
    };

    const onSort = (nextSortBy: SortBy) => {
        if (sortBy === nextSortBy) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(nextSortBy);
            setSortOrder("asc");
        }
    };

    const filteredPacks = useMemo(() => {
        let result = [...packs];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter((p) => p.name.toLowerCase().includes(q));
        }

        if (statusFilter !== "") {
            const isActiveBool = statusFilter === 1;
            result = result.filter((p) => p.isActive === isActiveBool);
        }

        result.sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            if (sortBy === "status") {
                valA = a.isActive ? 1 : 0;
                valB = b.isActive ? 1 : 0;
            } else if (sortBy === "amountInRupees") {
                valA = a.amountInPaise / 100;
                valB = b.amountInPaise / 100;
            } else {
                valA = a[sortBy] ?? 0;
                valB = b[sortBy] ?? 0;
            }

            if (typeof valA === "string") {
                const cmp = valA.localeCompare(String(valB));
                return sortOrder === "asc" ? cmp : -cmp;
            } else {
                return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
            }
        });

        return result;
    }, [packs, searchQuery, statusFilter, sortBy, sortOrder]);

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Credit Packs"
                subtitle="Manage pricing packs displayed on developer top-up page."
                action={
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => {
                            setInitialValues({
                                _id: "",
                                name: "",
                                credits: 100,
                                amountInRupees: 100,
                                sortOrder: 0,
                                status: 1
                            });
                            setOpen("add");
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Create Credit Pack
                    </Button>
                }
            />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search Credit Pack..."
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

                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {filteredPacks.length}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("name")} name="Name" active={sortBy === "name"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("credits")} name="Credits" active={sortBy === "credits"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("amountInRupees")} name="Price (₹)" active={sortBy === "amountInRupees"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("sortOrder")} name="Sort Order" active={sortBy === "sortOrder"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2">
                                    <AdminTableHeader onClick={() => onSort("status")} name="Status" active={sortBy === "status"} sortOrder={sortOrder} />
                                </th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPacks.map((row) => (
                                <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-medium">
                                        {row.name}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-semibold text-emerald-600 dark:text-emerald-400">
                                        {row.credits.toLocaleString()} credits
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-semibold">
                                        ₹{(row.amountInPaise / 100).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                                        {row.sortOrder ?? 0}
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
                                                        name: row.name,
                                                        credits: row.credits,
                                                        amountInRupees: row.amountInPaise / 100,
                                                        sortOrder: row.sortOrder || 0,
                                                        status: row.isActive ? 1 : 0
                                                    });
                                                    setOpen("edit");
                                                }}
                                                title="Edit Credit Pack"
                                                aria-label="Edit Credit Pack"
                                            >
                                                <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(row._id)}
                                                title="Delete Credit Pack"
                                                aria-label="Delete Credit Pack"
                                            >
                                                <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!filteredPacks.length ? (
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
                            <h3 className="font-semibold leading-none tracking-tight">
                                {open === "add" ? "Create Credit Pack" : "Update Credit Pack"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Set pack name, credit count, INR price, and availability status.
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
                                        credits: Number(values.credits),
                                        amountInPaise: Math.round(Number(values.amountInRupees) * 100),
                                        sortOrder: Number(values.sortOrder),
                                        isActive: Number(values.status) === 1
                                    };

                                    if (open === "add") {
                                        const { data } = await AxiosHelperAdmin.postData("/credit-packs", payload);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchPacks();
                                            resetForm();
                                        } else {
                                            toast.error(data?.message || "Failed to create pack");
                                            setErrors(data?.data || {});
                                        }
                                    } else {
                                        const { data } = await AxiosHelperAdmin.putData(`/credit-packs/${values._id}`, payload);
                                        if (data?.status) {
                                            toast.success(data.message);
                                            setOpen(null);
                                            fetchPacks();
                                            resetForm();
                                        } else {
                                            toast.error(data?.message || "Failed to update pack");
                                            setErrors(data?.data || {});
                                        }
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-3">
                                        <div className="space-y-2">
                                            <label htmlFor="pack-name" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                Pack Name
                                            </label>
                                            <Field
                                                id="pack-name"
                                                name="name"
                                                data-slot="input"
                                                className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                                                placeholder="e.g. Starter Pack"
                                            />
                                            <ErrorMessage className="text-xs text-rose-600" name="name" component="small" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label htmlFor="pack-credits" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Credits
                                                </label>
                                                <Field
                                                    type="number"
                                                    id="pack-credits"
                                                    name="credits"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="credits" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="pack-price" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Price (₹)
                                                </label>
                                                <Field
                                                    type="number"
                                                    id="pack-price"
                                                    name="amountInRupees"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="amountInRupees" component="small" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label htmlFor="pack-sortOrder" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Sort Order
                                                </label>
                                                <Field
                                                    type="number"
                                                    id="pack-sortOrder"
                                                    name="sortOrder"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                />
                                                <ErrorMessage className="text-xs text-rose-600" name="sortOrder" component="small" />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="pack-status" data-slot="label" className="flex items-center gap-2 text-sm font-medium leading-none select-none">
                                                    Status
                                                </label>
                                                <Field
                                                    as="select"
                                                    id="pack-status"
                                                    name="status"
                                                    data-slot="input"
                                                    className="h-9 w-full min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    <option value={1}>Active</option>
                                                    <option value={0}>Inactive</option>
                                                </Field>
                                                <ErrorMessage className="text-xs text-rose-600" name="status" component="small" />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="md"
                                                className="border border-indigo-100 dark:border-indigo-100"
                                                onClick={() => setOpen(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button disabled={isSubmitting} type="submit" variant="primary" size="md">
                                                {isSubmitting ? "Saving..." : "Save"}
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}


