"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AxiosHelperUser from "@/helpers/AxiosHelperUser";
import { Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/userSlice";

type CreditPack = {
    _id: string;
    name: string;
    credits: number;
    amountInPaise: number;
    currency: string;
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

    useEffect(() => {
        (async () => {
            const { data } = await AxiosHelperUser.getData("/credit-packs");
            if (data?.status) setPacks(data.data || []);
        })();
    }, []);

    const buyPack = async (pack: CreditPack) => {
        setBuyingId(pack._id);
        try {
            const ready = await loadRazorpay();
            if (!ready || !window.Razorpay) {
                toast.error("Unable to load Razorpay checkout");
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
                        toast.success(verify.data.message || "Credits added");
                        if (verify.data.data?.balance != null) {
                            dispatch(updateUser({ balance: verify.data.data.balance }));
                        }
                    } else {
                        toast.error(verify.data?.message || "Payment verification failed");
                    }
                }
            });
            rzp.open();
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <section className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Buy credits</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Current balance: <span className="font-semibold">{user.balance}</span> credits
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {packs.map((pack) => (
                    <div key={pack._id} className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-sm text-slate-500">{pack.name}</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{pack.credits}</p>
                        <p className="text-xs text-slate-500">credits</p>
                        <p className="mt-3 text-lg font-semibold text-indigo-600">₹{(pack.amountInPaise / 100).toFixed(2)}</p>
                        <Button
                            type="button"
                            variant="primary"
                            fullWidth
                            className="mt-4"
                            disabled={buyingId === pack._id}
                            onClick={() => buyPack(pack)}
                        >
                            {buyingId === pack._id ? "Opening checkout..." : "Buy now"}
                        </Button>
                    </div>
                ))}
            </div>

            {!packs.length ? <p className="text-sm text-slate-500">No credit packs available yet.</p> : null}
        </section>
    );
}
