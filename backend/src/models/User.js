import mongoose from "mongoose";
import { orderId } from "../helpers/utils.js";
import { Counter } from "./Counter.js";

const Schema = new mongoose.Schema(
    {
        userId: { type: String, unique: true, index: true, default: null },
        name: { type: String, required: true, default: null },
        email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
        mobile: { type: String, unique: true, sparse: true, index: true },
        password: { type: String, required: true, default: null, select: false },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        image: { type: String, default: null },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

Schema.pre("save", async function onSave(next) {
    if (this.isNew && !this.userId) {
        const options = this.$session() ? { session: this.$session() } : {};
        const counter = await Counter.findByIdAndUpdate({ _id: "User" }, { $inc: { seq: 1 } }, { upsert: true, new: true, ...options });
        this.userId = orderId(counter.seq, "U", 6);
    }
    next();
});

export const User = mongoose.model("User", Schema);
