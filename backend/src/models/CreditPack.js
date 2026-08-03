import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        credits: { type: Number, required: true, min: 1 },
        amountInPaise: { type: Number, required: true, min: 100 },
        currency: { type: String, default: "INR" },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const CreditPack = mongoose.model("CreditPack", Schema);
