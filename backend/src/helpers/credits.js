import mongoose from "mongoose";
import { CreditLedger, Wallet } from "../models/index.js";
import { orderId } from "./utils.js";
import { Counter } from "../models/Counter.js";

export const ensureCreditLedgerTxnIds = async () => {
    try {
        const unassigned = await CreditLedger.find({ $or: [{ txnId: null }, { txnId: { $exists: false } }] }).sort({ createdAt: 1 });
        for (const doc of unassigned) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: "CreditLedger" },
                { $inc: { seq: 1 } },
                { upsert: true, new: true }
            );
            doc.txnId = orderId(counter.seq, "TXN", 5);
            await doc.save();
        }
    } catch (e) {
        console.error("Failed to backfill CreditLedger txnId:", e);
    }
};

export const creditWallet = async ({ userId, amount, type, description, referenceType = null, referenceId = null, meta = null, session = null }) => {
    if (amount <= 0) throw new Error("Credit amount must be positive");

    const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true, upsert: true, setDefaultsOnInsert: true, session }
    );

    const ledgerDoc = new CreditLedger({
        userId,
        type,
        amount,
        balanceAfter: wallet.balance,
        referenceType,
        referenceId,
        description,
        meta
    });
    await ledgerDoc.save({ session });

    return wallet;
};

export const debitWallet = async ({ userId, amount, description, referenceType = null, referenceId = null, meta = null, session = null }) => {
    if (amount <= 0) throw new Error("Debit amount must be positive");

    const wallet = await Wallet.findOneAndUpdate(
        { userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session }
    );

    if (!wallet) {
        const err = new Error("Insufficient credits");
        err.code = "INSUFFICIENT_CREDITS";
        throw err;
    }

    const ledgerDoc = new CreditLedger({
        userId,
        type: "debit",
        amount: -amount,
        balanceAfter: wallet.balance,
        referenceType,
        referenceId,
        description,
        meta
    });
    await ledgerDoc.save({ session });

    return wallet;
};

export const refundCredits = async ({ userId, amount, description, referenceType = null, referenceId = null, meta = null, session = null }) => {
    return creditWallet({
        userId,
        amount,
        type: "refund",
        description,
        referenceType,
        referenceId,
        meta,
        session
    });
};

export const withOptionalTransaction = async (fn) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
