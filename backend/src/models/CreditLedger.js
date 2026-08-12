import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";

const Schema = new mongoose.Schema(
    {
        txnId: { type: String, unique: true, sparse: true, index: true, default: null },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, required: true, enum: ["topup", "debit", "refund", "adjustment", "signup_bonus"] },
        source: { type: String, enum: ["self", "admin", "reward", "api_usage", "signup_bonus", "system"], default: "self", index: true },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        referenceType: { type: String, default: null },
        referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
        description: { type: String, default: null },
        meta: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.txnId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate(
            { _id: "CreditLedger" },
            { $inc: { seq: 1 } },
            { upsert: true, new: true, ...options }
        );
        this.txnId = orderId(counter.seq, "TXN", 5);
    }
    next();
});

Schema.index({ userId: 1, createdAt: -1 });

export const CreditLedger = mongoose.model("CreditLedger", Schema);

