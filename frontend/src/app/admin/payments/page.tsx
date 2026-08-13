"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Eye, X, Loader2, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AxiosHelperAdmin from "@/helpers/AxiosHelperAdmin";
import AdminTableHeader from "@/components/admin/AdminTableHeader";
import { Badge, type BadgeVariant } from "@/components/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type PaymentRow = {
    _id: string;
    paymentId?: string;
    credits: number;
    baseAmountInPaise?: number;
    gstPercent?: number;
    gstAmountInPaise?: number;
    amountInPaise: number;
    status: string;
    source?: "self" | "admin" | "reward" | string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    createdAt: string;
    userId?: { name?: string; email?: string; userId?: string } | null;
    creditPackId?: { name?: string } | null;
};

type RazorpayPayment = {
    id: string;
    status: string;
    method?: string;
    invoice_id?: string | null;
    description?: string | null;
    created_at?: number;
    amount?: number;
    currency?: string;
    error_description?: string | null;
    error_code?: string | null;
};

type RazorpayDetailResponse = {
    order: PaymentRow & { meta?: Record<string, unknown> };
    razorpayDetails: RazorpayPayment | null;
};

type SortBy = "userId" | "credits" | "amountInPaise" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-white font-mono break-all">{value ?? "—"}</p>
        </div>
    );
}

function PaymentGatewayModal({
    open,
    onClose,
    row,
}: {
    open: boolean;
    onClose: () => void;
    row: PaymentRow | null;
}) {
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<RazorpayDetailResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !row) return;
        setDetail(null);
        setError(null);
        setLoading(true);
        AxiosHelperAdmin.getData(`/payments/${row._id}/razorpay`, {})
            .then(({ data: res }) => {
                if (res?.status) {
                    setDetail(res.data);
                } else {
                    setError(res?.message || "Failed to load payment details.");
                }
            })
            .catch(() => setError("An unexpected error occurred."))
            .finally(() => setLoading(false));
    }, [open, row]);

    const order = detail?.order ?? row;
    const rzp = detail?.razorpayDetails;

    const systemStatusVariant: BadgeVariant =
        order?.status === "paid" || order?.status === "captured"
            ? "success"
            : order?.status === "created"
                ? "warning"
                : "secondary";

    const rzpStatusVariant: BadgeVariant =
        rzp?.status === "paid"
            ? "success"
            : rzp?.status === "warning"
                ? "gradient"
                : "secondary";

    const methodLabel = rzp?.method
        ? rzp.method.charAt(0).toUpperCase() + rzp.method.slice(1)
        : null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md w-full bg-slate-900 border border-slate-700 text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-700/60">
                    <div>
                        <DialogTitle className="text-base font-bold text-white">
                            Payment gateway status
                        </DialogTitle>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            {order?.paymentId || order?.razorpayOrderId || "—"}
                            {order?.userId?.name ? ` · ${order.userId.name.toUpperCase()}` : ""}
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Saved in System — shown immediately from row data */}
                    {row && (
                        <section className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                                <h3 className="text-sm font-semibold text-slate-200">Saved in system</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Payment status</p>
                                    <Badge variant={systemStatusVariant} size="sm" className="capitalize font-semibold">
                                        {row.status === "paid" || row.status === "captured" ? "Success" : row.status === "created" ? "Pending" : row.status}
                                    </Badge>
                                </div>
                                <DetailRow label="Order ID" value={row.razorpayOrderId} />
                                <DetailRow label="Payment ID" value={row.razorpayPaymentId} />
                                <DetailRow
                                    label="Message"
                                    value={
                                        row.status === "paid" || row.status === "captured"
                                            ? "Payment successful."
                                            : row.status === "created"
                                                ? "Payment pending."
                                                : row.status === "failed"
                                                    ? "Payment failed."
                                                    : "—"
                                    }
                                />
                            </div>
                        </section>
                    )}

                    {/* Payment Gateway Details — fetched from Razorpay */}
                    <section className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-sm font-semibold text-slate-200">Payment gateway details</h3>
                        </div>

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-6 gap-3 text-slate-400">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p className="text-xs">Fetching from Razorpay...</p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/50 px-3 py-2.5 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {!loading && !error && rzp && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Payment status</p>
                                    <Badge variant={rzpStatusVariant} size="sm" className="capitalize font-semibold">
                                        {rzp.status ? rzp.status.charAt(0).toUpperCase() + rzp.status.slice(1) : "—"}
                                    </Badge>
                                </div>
                                <DetailRow label="Invoice ID" value={rzp.invoice_id} />
                                <DetailRow
                                    label="Created"
                                    value={rzp.created_at ? moment.unix(rzp.created_at).format("DD-MM-YYYY hh:mm A") : null}
                                />
                                <DetailRow label="Method" value={methodLabel} />
                                {rzp.description ? (
                                    <div className="col-span-2">
                                        <DetailRow label="Message" value={rzp.description} />
                                    </div>
                                ) : null}
                                {rzp.error_description ? (
                                    <div className="col-span-2">
                                        <DetailRow label="Error" value={rzp.error_description} />
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {!loading && !error && !rzp && (
                            <p className="text-center text-sm text-slate-400 py-4">
                                No Razorpay transaction details found for this payment.
                            </p>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminPaymentsPage() {
    const [param, setParam] = useState<{ limit: number; pageNo: number; query: string; sortBy?: SortBy; sortOrder?: SortOrder }>({
        limit: 20,
        pageNo: 1,
        query: ""
    });
    const [data, setData] = useState<{ count: number; record: PaymentRow[]; totalPages: number; pagination: number[] }>({
        count: 0,
        record: [],
        totalPages: 0,
        pagination: []
    });
    const [selectedRow, setSelectedRow] = useState<PaymentRow | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const load = useCallback(async () => {
        const { data: res } = await AxiosHelperAdmin.getData("/payments", param);
        if (res?.status) setData(res.data);
    }, [param]);

    useEffect(() => {
        load();
    }, [load]);

    const openDetail = (row: PaymentRow) => {
        setSelectedRow(row);
        setModalOpen(true);
    };

    return (
        <section className="space-y-4">
            <AdminPageHeader title="Payments" subtitle="Razorpay credit top-up orders ledger." />

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-100 dark:bg-slate-900">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <input
                        value={param.query}
                        onChange={(e) => setParam((prev) => ({ ...prev, pageNo: 1, query: e.target.value }))}
                        data-slot="input"
                        className="h-9 w-full max-w-xs min-w-0 rounded-md border border-indigo-100 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-[3px] focus-visible:ring-indigo-200 dark:border-indigo-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                        placeholder="Search payment ID, order ID, user..."
                    />
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total: {data.count}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#edf3ff] text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-3 py-2">Payment ID</th>
                                <th className="px-3 py-2">User</th>
                                <th className="px-3 py-2">Source</th>
                                <th className="px-3 py-2">Pack</th>
                                <th className="px-3 py-2">Credits</th>
                                <th className="px-3 py-2">Amount (Base + GST)</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.record.map((row) => {
                                const totalRupees = (row.amountInPaise / 100).toFixed(2);
                                const baseRupees = row.baseAmountInPaise != null ? (row.baseAmountInPaise / 100).toFixed(2) : null;
                                const gstRupees = row.gstAmountInPaise != null ? (row.gstAmountInPaise / 100).toFixed(2) : null;
                                const sourceLabel = row.source === "admin" ? "Admin" : row.source === "reward" ? "Reward" : "Self";
                                const sourceVariant: BadgeVariant = row.source === "admin" ? "secondary" : row.source === "reward" ? "warning" : "outline";
                                const statusLabel = row.status === "created" ? "Pending" : row.status;
                                const statusVariant: BadgeVariant = row.status === "captured" || row.status === "paid" ? "success" : row.status === "created" ? "warning" : "secondary";

                                return (
                                    <tr key={row._id} className="border-t border-indigo-100 dark:border-slate-700">
                                        <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">
                                            {row.paymentId || row.razorpayOrderId || "—"}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{row.userId?.name || "—"}</p>
                                            <p className="text-xs text-slate-500">{row.userId?.email}</p>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={sourceVariant} size="sm" className="capitalize font-semibold">
                                                {sourceLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.creditPackId?.name || "—"}</td>
                                        <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">{row.credits} credits</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">₹{totalRupees}</p>
                                            {baseRupees && gstRupees ? (
                                                <p className="text-[11px] text-slate-500">₹{baseRupees} + {row.gstPercent ?? 18}% GST (₹{gstRupees})</p>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                            <Badge variant={statusVariant} size="sm" className="capitalize font-semibold">
                                                {statusLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-slate-500">{moment(row.createdAt).format("DD-MM-YYYY HH:mm")}</td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => openDetail(row)}
                                                title="View gateway details"
                                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!data.record.length ? (
                                <tr>
                                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                                        No Records Available.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
                <AdminPagination data={data} param={param} setParam={setParam} />
            </div>

            <PaymentGatewayModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                row={selectedRow}
            />
        </section>
    );
}
