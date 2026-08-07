"use client";

import { useEffect, useState, useMemo } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Badge } from "@/components/ui";

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
    isActive: boolean;
};

const validationSchema = Yup.object({
    name: Yup.string().trim().required("Pack name is required"),
    credits: Yup.number().min(1, "Must be at least 1 credit").required("Credits required"),
    amountInRupees: Yup.number().min(1, "Price must be at least ₹1").required("Price required"),
    sortOrder: Yup.number().min(0, "Sort order cannot be negative")
});

export default function AdminCreditPacksPage() {
    const [packs, setPacks] = useState<CreditPack[]>([]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState<null | "add" | "edit">(null);
    const [initialValues, setInitialValues] = useState<FormValues>({
        _id: "",
        name: "",
        credits: 100,
        amountInRupees: 100,
        sortOrder: 0,
        isActive: true
    });

    const loadPacks = async () => {
        const { data } = await AxiosHelperAdmin.getData("/credit-packs");
        if (data?.status) setPacks(data.data || []);
    };

    useEffect(() => {
        loadPacks();
    }, []);

    const filteredPacks = useMemo(() => {
        if (!query.trim()) return packs;
        const q = query.toLowerCase().trim();
        return packs.filter((p) => p.name.toLowerCase().includes(q));
    }, [packs, query]);

    const handleDelete = async (id: string) => {
        const confirm = await Swal.fire({
            title: "Delete pack?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete"
        });
        if (!confirm.isConfirmed) return;
        const { data } = await AxiosHelperAdmin.deleteData(`/credit-packs/${id}`);
        if (data?.status) {
            toast.success(data.message);
            loadPacks();
        } else {
            toast.error(data?.message || "Failed to delete pack");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader
                title="Credit Packs"
                subtitle="Packs shown on the developer Buy Credits page."
                action={
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            setInitialValues({
                                _id: "",
                                name: "",
                                credits: 100,
                                amountInRupees: 100,
                                sortOrder: 0,
                                isActive: true
                            });
                            setOpen("add");
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Credit Pack
                    </Button>
                }
            />

            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pack name"
                    className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Credits</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Sort Order</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPacks.map((pack) => {
                            const priceInRupees = (pack.amountInPaise / 100).toFixed(2);

                            return (
                                <tr key={pack._id} className="border-t border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                        {pack.name}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                                        {pack.credits}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        ₹{priceInRupees}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                        {pack.sortOrder ?? 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={pack.isActive ? "success" : "secondary"} size="sm">
                                            {pack.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setInitialValues({
                                                        _id: pack._id,
                                                        name: pack.name,
                                                        credits: pack.credits,
                                                        amountInRupees: pack.amountInPaise / 100,
                                                        sortOrder: pack.sortOrder || 0,
                                                        isActive: pack.isActive
                                                    });
                                                    setOpen("edit");
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(pack._id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!filteredPacks.length ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                                    No credit packs found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Dialog */}
            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {open === "add" ? "Create Credit Pack" : "Edit Credit Pack"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Set pack name, credit amount, INR price, and availability.
                            </p>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            enableReinitialize
                            validationSchema={validationSchema}
                            onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                                const payload = {
                                    name: values.name,
                                    credits: values.credits,
                                    amountInPaise: Math.round(values.amountInRupees * 100),
                                    sortOrder: values.sortOrder,
                                    isActive: values.isActive
                                };

                                if (open === "add") {
                                    const { data } = await AxiosHelperAdmin.postData("/credit-packs", payload);
                                    if (data?.status) {
                                        toast.success(data.message);
                                        setOpen(null);
                                        loadPacks();
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
                                        loadPacks();
                                        resetForm();
                                    } else {
                                        toast.error(data?.message || "Failed to update pack");
                                        setErrors(data?.data || {});
                                    }
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form className="space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500">Pack Name</label>
                                        <Field
                                            name="name"
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                            placeholder="e.g. Starter Pack"
                                        />
                                        <ErrorMessage name="name" component="small" className="text-xs text-red-600" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500">Credits</label>
                                            <Field
                                                type="number"
                                                name="credits"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                                placeholder="100"
                                            />
                                            <ErrorMessage name="credits" component="small" className="text-xs text-red-600" />
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-500">Price (₹)</label>
                                            <Field
                                                type="number"
                                                name="amountInRupees"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                                placeholder="100"
                                            />
                                            <ErrorMessage name="amountInRupees" component="small" className="text-xs text-red-600" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500">Sort Order</label>
                                            <Field
                                                type="number"
                                                name="sortOrder"
                                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                                                placeholder="0"
                                            />
                                            <ErrorMessage name="sortOrder" component="small" className="text-xs text-red-600" />
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
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setOpen(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                                            {isSubmitting ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            ) : null}
        </section>
    );
}


