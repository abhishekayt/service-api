import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        creditPackId: { type: mongoose.Schema.Types.ObjectId, ref: "CreditPack", default: null },
        credits: { type: Number, required: true, min: 1 },
        baseAmountInPaise: { type: Number, default: 0 },
        gstPercent: { type: Number, default: 18 },
        gstAmountInPaise: { type: Number, default: 0 },
        amountInPaise: { type: Number, required: true, min: 1 },
        currency: { type: String, default: "INR" },
        razorpayOrderId: { type: String, required: true, unique: true, index: true },
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

Schema.index({ userId: 1, createdAt: -1 });

export const PaymentOrder = mongoose.model("PaymentOrder", Schema);
