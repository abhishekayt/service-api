import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
        name: { type: String, required: true },
        description: { type: String, default: null },
        creditCost: { type: Number, required: true, min: 0, default: 1 },
        provider: { type: String, default: "stub" },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const ApiService = mongoose.model("ApiService", Schema);
