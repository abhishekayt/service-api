import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, required: true, enum: ["topup", "debit", "refund", "adjustment", "signup_bonus"] },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        referenceType: { type: String, default: null },
        referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
        description: { type: String, default: null },
        meta: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    { timestamps: true }
);

Schema.index({ userId: 1, createdAt: -1 });

export const CreditLedger = mongoose.model("CreditLedger", Schema);
