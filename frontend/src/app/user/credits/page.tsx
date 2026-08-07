"use client";

import { useEffect, useState, useCallback } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { Coins, Zap, CheckCircle2, ArrowRight, Receipt, History } from "lucide-react";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui/Button";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";

type CreditPack = {
    _id: string;
    name: string;
    credits: number;
    amountInPaise: number;
    currency: string;
};

type PaymentItem = {
    _id: string;
    credits: number;
    amountInPaise: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
    status: "created" | "paid" | "failed" | "cancelled" | string;
    createdAt: string;
};

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    }
}

const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

export default function BuyCreditsPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const [packs, setPacks] = useState<CreditPack[]>([]);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [loadingPayments, setLoadingPayments] = useState<boolean>(true);

    const fetchPayments = useCallback(async () => {
        setLoadingPayments(true);
        try {
            const { data } = await AxiosHelperUser.getData("/payments", { limit: 50, pageNo: 1 });
            if (data?.status) {
                setPayments(data.data?.record || []);
            }
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/credit-packs");
            if (data?.status) setPacks(data.data || []);
        })();
        fetchPayments();
    }, [fetchPayments]);

    const buyPack = async (pack: CreditPack) => {
        setBuyingId(pack._id);
        try {
            const ready = await loadRazorpay();
            if (!ready || !window.Razorpay) {
                toast.error("Unable to load Razorpay checkout SDK");
                return;
            }

            const { data } = await AxiosHelperUser.postData("/payments/create-order", { creditPackId: pack._id });
            if (!data?.status) {
                toast.error(data?.message || "Could not create payment order");
                return;
            }

            const order = data.data;
            const rzp = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Service API Credits",
                description: `${order.packName} · ${order.credits} credits`,
                order_id: order.orderId,
                prefill: { name: user.name, email: user.email },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    const verify = await AxiosHelperUser.postData("/payments/verify", response);
                    if (verify.data?.status) {
                        toast.success(verify.data.message || "Credits added to your wallet!");
                        if (verify.data.data?.balance != null) {
                            dispatch(updateUser({ balance: verify.data.data.balance }));
                        }
                    } else {
                        toast.error(verify.data?.message || "Payment verification failed");
                    }
                    fetchPayments();
                }
            });
            rzp.open();
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Coins className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        Credit Packs & Top-Up
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Purchase non-expiring credits to power your SMS and Email API requests.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/40">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Balance:</span>
                    <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                        {user.balance ?? 0} <span className="text-xs font-normal">credits</span>
                    </span>
                </div>
            </div>

            {/* Credit Packs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packs.map((pack, idx) => {
                    const priceInRupees = pack.amountInPaise / 100;
                    const pricePerCredit = (priceInRupees / pack.credits).toFixed(2);
                    const isPopular = idx === 1 || pack.credits >= 1000;

                    return (
                        <Card
                            key={pack._id}
                            className={`relative flex flex-col justify-between border-slate-200/80 transition-all duration-200 hover:shadow-xl dark:border-slate-800 ${
                                isPopular
                                    ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10 dark:ring-indigo-400"
                                    : ""
                            }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge variant="gradient" className="px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                        Best Value
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                                        <Zap className="h-4 w-4" />
                                    </div>
                                </div>
                                <CardDescription>Instant credit addition</CardDescription>

                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                        ₹{priceInRupees.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        / {pack.credits} credits
                                    </span>
                                </div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    ₹{pricePerCredit} per credit
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Never expires</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Use across SMS & Email APIs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>Instant Razorpay Checkout</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant={isPopular ? "gradient" : "primary"}
                                    size="lg"
                                    fullWidth
                                    disabled={buyingId === pack._id}
                                    onClick={() => buyPack(pack)}
                                    className="gap-2 shadow-sm"
                                >
                                    {buyingId === pack._id ? (
                                        "Opening Checkout..."
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Buy {pack.credits} Credits <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {!packs.length && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <Coins className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="mt-2 text-sm font-semibold">No credit packs available at the moment.</p>
                    <p className="text-xs text-slate-500">Please check back later or contact platform support.</p>
                </div>
            )}

            {/* Payment Ledger History Section */}
            <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Payment Ledger & Order History
                        </CardTitle>
                        <CardDescription>
                            Track all top-up transactions, Razorpay order IDs, and status updates.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Reference</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingPayments ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        Loading payment ledger...
                                    </TableCell>
                                </TableRow>
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <History className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                            <p className="text-sm font-medium">No payment history found.</p>
                                            <p className="text-xs text-slate-400">Your top-up transactions will appear here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((p) => {
                                    const amountInRupees = (p.amountInPaise / 100).toLocaleString("en-IN", {
                                        minimumFractionDigits: 0
                                    });
                                    const badgeVariant =
                                        p.status === "paid"
                                            ? "success"
                                            : p.status === "created"
                                            ? "warning"
                                            : p.status === "failed" || p.status === "cancelled"
                                            ? "danger"
                                            : statusToBadgeVariant(p.status);

                                    return (
                                        <TableRow key={p._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                                                {p.razorpayOrderId}
                                            </TableCell>
                                            <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                +{p.credits.toLocaleString()} credits
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                                                ₹{amountInRupees}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {p.razorpayPaymentId ? p.razorpayPaymentId : <span className="text-slate-400 italic">Pending</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badgeVariant} className="text-[11px] font-bold capitalize">
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">
                                                {moment(p.createdAt).format("DD MMM YYYY, hh:mm A")}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

