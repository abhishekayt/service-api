import mongoose from "mongoose";
import { CreditLedger, Wallet } from "../models/index.js";

export const getOrCreateWallet = async (userId, session = null) => {
    const options = session ? { session } : {};
    let wallet = await Wallet.findOne({ userId }, null, options);
    if (!wallet) {
        const created = await Wallet.create([{ userId, balance: 0 }], options);
        wallet = created[0];
    }
    return wallet;
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
