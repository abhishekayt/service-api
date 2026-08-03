import { CreditPack } from "../models/index.js";

const DEFAULT_PACKS = [
    { name: "Starter", credits: 100, amountInPaise: 10000, currency: "INR", isActive: true, sortOrder: 1 },
    { name: "Growth", credits: 500, amountInPaise: 45000, currency: "INR", isActive: true, sortOrder: 2 },
    { name: "Pro", credits: 1000, amountInPaise: 80000, currency: "INR", isActive: true, sortOrder: 3 }
];

export const ensureDefaultCreditPacks = async () => {
    const count = await CreditPack.countDocuments({ deletedAt: null });
    if (count > 0) return;
    await CreditPack.insertMany(DEFAULT_PACKS);
};
