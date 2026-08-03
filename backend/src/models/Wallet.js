import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        balance: { type: Number, required: true, default: 0, min: 0 }
    },
    { timestamps: true }
);

export const Wallet = mongoose.model("Wallet", Schema);
