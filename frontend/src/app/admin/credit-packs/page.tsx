"use client";

import { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, Coins } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button, Badge } from "@/components/ui";
import { getSweetAlertConfig } from "@/helpers/utils";

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

    const handleDelete = async (id: string) => {
        const { isConfirmed } = await Swal.fire(getSweetAlertConfig({ title: "Delete Credit Pack?" }));
        if (isConfirmed) {
            const { data } = await AxiosHelperAdmin.deleteData(`/credit-packs/${id}`);
            if (data?.status) {
                toast.success(data.message);
                loadPacks();
            } else {
                toast.error(data?.message || "Failed to delete credit pack");
            }
        }
    };

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
                                isActive: true
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
                <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Coins className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Available Packs ({packs.length})
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-2.5 font-semibold">Name</th>
                                <th className="px-4 py-2.5 font-semibold">Credits</th>
                                <th className="px-4 py-2.5 font-semibold">Price (₹)</th>
                                <th className="px-4 py-2.5 font-semibold">Sort Order</th>
                                <th className="px-4 py-2.5 font-semibold">Status</th>
                                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50 dark:divide-slate-800">
                            {packs.map((pack) => {
                                const priceInRupees = pack.amountInPaise / 100;

                                return (
                                    <tr key={pack._id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{pack.name}</td>
                                        <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                                            {pack.credits.toLocaleString()} credits
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                                            ₹{priceInRupees.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{pack.sortOrder ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={pack.isActive ? "success" : "secondary"} size="sm">
                                                {pack.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                                <Button
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
                                                    title="Edit Credit Pack"
                                                    aria-label="Edit Credit Pack"
                                                >
                                                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(pack._id)}
                                                    title="Delete Credit Pack"
                                                    aria-label="Delete Credit Pack"
                                                >
                                                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!packs.length ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                        No credit packs available. Click "Create Credit Pack" to add one.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Pop-up Dialog Modal */}
            {open ? (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div data-slot="card" className="w-full max-w-md rounded-xl border border-indigo-100 bg-white text-slate-900 shadow-xl transition-shadow duration-200 dark:border-indigo-100 dark:bg-slate-900 dark:text-slate-100">
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
                                        <div className="space-y-1.5">
                                            <label htmlFor="pack-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Pack Name
                                            </label>
                                            <Field
                                                id="pack-name"
                                                name="name"
                                                className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                placeholder="e.g. Starter Pack, Growth Pack"
                                            />
                                            <ErrorMessage name="name" component="small" className="text-xs text-rose-600" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label htmlFor="pack-credits" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Credits
                                                </label>
                                                <Field
                                                    id="pack-credits"
                                                    type="number"
                                                    name="credits"
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="100"
                                                />
                                                <ErrorMessage name="credits" component="small" className="text-xs text-rose-600" />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="pack-price" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Price (₹)
                                                </label>
                                                <Field
                                                    id="pack-price"
                                                    type="number"
                                                    name="amountInRupees"
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="100"
                                                />
                                                <ErrorMessage name="amountInRupees" component="small" className="text-xs text-rose-600" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label htmlFor="pack-sort" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Sort Order
                                                </label>
                                                <Field
                                                    id="pack-sort"
                                                    type="number"
                                                    name="sortOrder"
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="0"
                                                />
                                                <ErrorMessage name="sortOrder" component="small" className="text-xs text-rose-600" />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="pack-status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    Status
                                                </label>
                                                <select
                                                    id="pack-status"
                                                    value={values.isActive ? "true" : "false"}
                                                    onChange={(e) => setFieldValue("isActive", e.target.value === "true")}
                                                    className="h-9 w-full rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-indigo-900/50 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="md"
                                                className="border border-indigo-100 dark:border-indigo-900"
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

