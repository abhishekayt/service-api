"use client";

import { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button } from "@/components/ui";

type CreditPack = {
    _id: string;
    name: string;
    credits: number;
    amountInPaise: number;
    currency: string;
    isActive: boolean;
    sortOrder: number;
};

const schema = Yup.object({
    name: Yup.string().required("Required"),
    credits: Yup.number().min(1).required("Required"),
    amountInRupees: Yup.number().min(1).required("Required"),
    sortOrder: Yup.number().min(0)
});

export default function AdminCreditPacksPage() {
    const [packs, setPacks] = useState<CreditPack[]>([]);

    const load = async () => {
        const { data } = await AxiosHelperAdmin.getData("/credit-packs");
        if (data?.status) setPacks(data.data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const remove = async (id: string) => {
        const confirm = await Swal.fire({ title: "Delete pack?", icon: "warning", showCancelButton: true, confirmButtonText: "Delete" });
        if (!confirm.isConfirmed) return;
        const { data } = await AxiosHelperAdmin.deleteData(`/credit-packs/${id}`);
        if (data?.status) {
            toast.success(data.message);
            load();
        } else toast.error(data?.message || "Failed");
    };

    return (
        <section className="space-y-5">
            <AdminPageHeader title="Credit Packs" subtitle="Packs shown on the developer Buy Credits page." />

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Add pack</h2>
                <Formik
                    initialValues={{ name: "", credits: 100, amountInRupees: 100, sortOrder: 0 }}
                    validationSchema={schema}
                    onSubmit={async (values, { resetForm, setSubmitting }) => {
                        const { data } = await AxiosHelperAdmin.postData("/credit-packs", {
                            name: values.name,
                            credits: values.credits,
                            amountInPaise: Math.round(values.amountInRupees * 100),
                            sortOrder: values.sortOrder,
                            isActive: true
                        });
                        if (data?.status) {
                            toast.success(data.message);
                            resetForm();
                            load();
                        } else toast.error(data?.message || "Failed");
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="mt-3 grid gap-3 md:grid-cols-4">
                            <div>
                                <Field name="name" placeholder="Name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
                                <ErrorMessage name="name" component="small" className="text-xs text-red-600" />
                            </div>
                            <div>
                                <Field type="number" name="credits" placeholder="Credits" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
                                <ErrorMessage name="credits" component="small" className="text-xs text-red-600" />
                            </div>
                            <div>
                                <Field type="number" name="amountInRupees" placeholder="Price (₹)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
                                <ErrorMessage name="amountInRupees" component="small" className="text-xs text-red-600" />
                            </div>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Create"}
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
                            <th className="px-4 py-3">Credits</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {packs.map((pack) => (
                            <tr key={pack._id} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3 font-medium">{pack.name}</td>
                                <td className="px-4 py-3">{pack.credits}</td>
                                <td className="px-4 py-3">₹{(pack.amountInPaise / 100).toFixed(2)}</td>
                                <td className="px-4 py-3">{pack.isActive ? "Yes" : "No"}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button type="button" size="sm" variant="ghost" onClick={() => remove(pack._id)}>
                                        Delete
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
