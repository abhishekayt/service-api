import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";

const Schema = new mongoose.Schema(
    {
        paymentId: { type: String, unique: true, sparse: true, index: true, default: null },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        creditPackId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditPack", default: null },
        credits: { type: Number, required: true },
        baseAmountInPaise: { type: Number, default: 0 },
        gstPercent: { type: Number, default: 18 },
        gstAmountInPaise: { type: Number, default: 0 },
        amountInPaise: { type: Number, required: true, default: 0 },
        currency: { type: String, default: "INR" },
        source: { type: String, enum: ["self", "admin", "reward"], default: "self", index: true },
        razorpayOrderId: { type: String, default: null, sparse: true, index: true },
        razorpayPaymentId: { type: String, default: null, index: true },
        status: {
            type: String,
            enum: ["created", "paid", "failed", "cancelled"],
            default: "created",
            index: true
        },
        meta: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.paymentId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate(
            { _id: "PaymentOrder" },
            { $inc: { seq: 1 } },
            { upsert: true, new: true, ...options }
        );
        this.paymentId = orderId(counter.seq, "PAY", 5);
    }
    next();
});

Schema.index({ userId: 1, createdAt: -1 });

export const PaymentOrder = mongoose.model("PaymentOrder", Schema);

