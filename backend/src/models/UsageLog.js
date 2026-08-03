import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: "ApiKey", default: null },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "ApiService", default: null },
        serviceSlug: { type: String, required: true, index: true },
        creditsCharged: { type: Number, default: 0 },
        status: { type: String, required: true, enum: ["success", "failed", "rejected"], index: true },
        requestMeta: { type: mongoose.Schema.Types.Mixed, default: null },
        responseMeta: { type: mongoose.Schema.Types.Mixed, default: null },
        errorMessage: { type: String, default: null },
        latencyMs: { type: Number, default: null }
    },
    { timestamps: true }
);

Schema.index({ userId: 1, createdAt: -1 });

export const UsageLog = mongoose.model("UsageLog", Schema);
