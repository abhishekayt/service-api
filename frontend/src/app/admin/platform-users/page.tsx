"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import { Button } from "@/components/ui";

type PlatformUser = {
    _id: string;
    userId?: string;
    name: string;
    email: string;
    mobile?: string | null;
    balance: number;
    isActive: boolean;
    createdAt?: string;
};

export default function AdminPlatformUsersPage() {
    const router = useRouter();
    const [param, setParam] = useState({ pageNo: 1, limit: 10, query: "" });
    const [data, setData] = useState<{ count: number; record: PlatformUser[]; totalPages: number; pagination: number[] }>({
        count: 0,
        record: [],
        totalPages: 0,
        pagination: []
    });

    const fetchUsers = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData("/platform-users", param);
        if (res?.status) setData(res.data);
    }, [param]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const [updatingUser, setUpdatingUser] = useState<PlatformUser | null>(null);

    const handleBlockUnblock = async (user: PlatformUser) => {
        const { data: res } = await AxiosHelperAdmin.putData(`/platform-users/${user._id}/status`, {
            isActive: !user.isActive
        });
        if (res?.status) {
            toast.success(res.message);
            fetchUsers();
            setUpdatingUser(null);
        } else {
            toast.error(res?.message || "Failed");
        }
    };

    const handleDelete = async (user: PlatformUser) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will delete the user permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            confirmButtonColor: "#ef4444"
        });

        if (!result.isConfirmed) return;

        const { data: res } = await AxiosHelperAdmin.deleteData(`/platform-users/${user._id}`);
        if (res?.status) {
            toast.success(res.message);
            fetchUsers();
            setUpdatingUser(null);
        } else {
            toast.error(res?.message || "Failed");
        }
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Platform Users" subtitle="Developer accounts, wallets, and manual credit adjustments." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search name, email, id..."
                    />
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Balance</th>
                                <th className="px-3 py-2">Joined</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((user) => (
                                <tr key={user._id} className="border-t border-indigo-100 dark:border-slate-700">
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.userId}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{user.email}</td>
                                    <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">{user.balance} credits</td>
                                    <td className="px-3 py-2 text-slate-500">{user.createdAt ? moment(user.createdAt).format("DD-MM-YYYY") : "—"}</td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" size="sm" variant="secondary" onClick={() => router.push(`/admin/platform-users/${user._id}/ledger`)}>
                                                Ledger
                                            </Button>
                                            <Button type="button" size="sm" variant="outline" onClick={() => setUpdatingUser(user)}>
                                                Update
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                        No Records Available.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            {updatingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Manage User</h3>
                            <button onClick={() => setUpdatingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{updatingUser.name}</p>
                                <p className="text-xs text-slate-500">{updatingUser.email}</p>
                            </div>
                            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</p>
                                <Button
                                    type="button"
                                    variant={updatingUser.isActive ? "outline" : "gradient"}
                                    className="w-full justify-center"
                                    onClick={() => handleBlockUnblock(updatingUser)}
                                >
                                    {updatingUser.isActive ? "Block User" : "Unblock User"}
                                </Button>
                                <p className="mt-2 text-xs text-slate-500">
                                    {updatingUser.isActive ? "Blocking will prevent the user from accessing the platform." : "Unblocking will restore the user's access."}
                                </p>
                            </div>
                            <div className="border-t border-red-100 pt-4 dark:border-red-900/30">
                                <p className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</p>
                                <Button
                                    type="button"
                                    variant="gradient"
                                    className="w-full justify-center bg-red-500 text-white hover:bg-red-600"
                                    onClick={() => handleDelete(updatingUser)}
                                >
                                    Delete User
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

