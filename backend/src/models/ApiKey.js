import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        keyHash: { type: String, required: true, unique: true, index: true },
        keyPrefix: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        lastUsedAt: { type: Date, default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

Schema.index({ userId: 1, deletedAt: 1 });

export const ApiKey = mongoose.model("ApiKey", Schema);
