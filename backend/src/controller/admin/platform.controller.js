import { ApiKey, ApiService, CreditLedger, CreditPack, PaymentOrder, UsageLog, User, Wallet } from "../../models/index.js";
import { creditWallet, debitWallet, getOrCreateWallet } from "../../helpers/credits.js";
import { escapeRegex } from "../../helpers/utils.js";
import { ensureDefaultApiServices } from "../../helpers/seedServices.js";
import { ensureDefaultCreditPacks } from "../../helpers/seedCreditPacks.js";

export const listPlatformUsers = async (req, res) => {
    try {
        const { limit, pageNo, query } = req.query;
        const skip = (pageNo - 1) * limit;
        const filter = { deletedAt: null };
        if (query) {
            const q = escapeRegex(query);
            filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }, { userId: { $regex: q, $options: "i" } }];
        }

        const [count, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter, { name: 1, email: 1, mobile: 1, userId: 1, isActive: 1, createdAt: 1, lastLogin: 1 })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        const userIds = users.map((u) => u._id);
        const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
        const walletMap = Object.fromEntries(wallets.map((w) => [String(w.userId), w.balance]));

        const record = users.map((u) => ({ ...u, balance: walletMap[String(u._id)] ?? 0 }));
        return res.pagination(record, count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const adjustUserCredits = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        const description = String(req.body.description || "Admin credit adjustment").trim();
        if (!Number.isFinite(amount) || amount === 0) {
            return res.someThingWentWrong({ message: "amount must be a non-zero number" });
        }

        const user = await User.findOne({ _id: req.params.id, deletedAt: null });
        if (!user) return res.noRecords(false, "User not found");

        await getOrCreateWallet(user._id);

        if (amount > 0) {
            const wallet = await creditWallet({
                userId: user._id,
                amount,
                type: "adjustment",
                description,
                meta: { adminId: req.admin.id }
            });
            return res.successUpdate({ userId: user._id, balance: wallet.balance }, "Credits added");
        }

        try {
            const wallet = await debitWallet({
                userId: user._id,
                amount: Math.abs(amount),
                description,
                meta: { adminId: req.admin.id }
            });
            return res.successUpdate({ userId: user._id, balance: wallet.balance }, "Credits deducted");
        } catch (error) {
            if (error.code === "INSUFFICIENT_CREDITS") {
                return res.someThingWentWrong({ message: "User does not have enough credits to deduct" });
            }
            throw error;
        }
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listApiServicesAdmin = async (req, res) => {
    try {
        await ensureDefaultApiServices();
        const services = await ApiService.find({ deletedAt: null }).sort({ slug: 1 });
        return res.success(services);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateApiServiceAdmin = async (req, res) => {
    try {
        const service = await ApiService.findOne({ _id: req.params.id, deletedAt: null });
        if (!service) return res.noRecords(false, "Service not found");

        const vData = req.getBody(["name", "description", "creditCost", "provider", "isActive"]);
        if (vData.creditCost !== undefined) vData.creditCost = Number(vData.creditCost);
        if (vData.isActive !== undefined) vData.isActive = Boolean(vData.isActive);

        Object.assign(service, vData);
        await service.save();
        return res.successUpdate(service, "Service updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listCreditPacksAdmin = async (req, res) => {
    try {
        await ensureDefaultCreditPacks();
        const packs = await CreditPack.find({ deletedAt: null }).sort({ sortOrder: 1, credits: 1 });
        return res.success(packs);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createCreditPackAdmin = async (req, res) => {
    try {
        const { name, credits, amountInPaise, currency, isActive, sortOrder } = req.body;
        if (!name || !credits || !amountInPaise) {
            return res.someThingWentWrong({ message: "name, credits and amountInPaise are required" });
        }
        const pack = await CreditPack.create({
            name,
            credits: Number(credits),
            amountInPaise: Number(amountInPaise),
            currency: currency || "INR",
            isActive: isActive !== false,
            sortOrder: Number(sortOrder || 0)
        });
        return res.successInsert(pack, "Credit pack created");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const updateCreditPackAdmin = async (req, res) => {
    try {
        const pack = await CreditPack.findOne({ _id: req.params.id, deletedAt: null });
        if (!pack) return res.noRecords(false, "Credit pack not found");

        const vData = req.getBody(["name", "credits", "amountInPaise", "currency", "isActive", "sortOrder"]);
        if (vData.credits !== undefined) vData.credits = Number(vData.credits);
        if (vData.amountInPaise !== undefined) vData.amountInPaise = Number(vData.amountInPaise);
        if (vData.sortOrder !== undefined) vData.sortOrder = Number(vData.sortOrder);
        if (vData.isActive !== undefined) vData.isActive = Boolean(vData.isActive);

        Object.assign(pack, vData);
        await pack.save();
        return res.successUpdate(pack, "Credit pack updated");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const deleteCreditPackAdmin = async (req, res) => {
    try {
        const pack = await CreditPack.findOne({ _id: req.params.id, deletedAt: null });
        if (!pack) return res.noRecords(false, "Credit pack not found");
        pack.deletedAt = new Date();
        pack.isActive = false;
        await pack.save();
        return res.successDelete(pack, "Credit pack deleted");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listPaymentsAdmin = async (req, res) => {
    try {
        const { limit, pageNo, query } = req.query;
        const skip = (pageNo - 1) * limit;
        const filter = {};
        if (query) filter.razorpayOrderId = { $regex: escapeRegex(query), $options: "i" };

        const [count, record] = await Promise.all([
            PaymentOrder.countDocuments(filter),
            PaymentOrder.find(filter)
                .populate("userId", "name email userId")
                .populate("creditPackId", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);
        return res.pagination(record, count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listUsageAdmin = async (req, res) => {
    try {
        const { limit, pageNo } = req.query;
        const skip = (pageNo - 1) * limit;
        const [count, record] = await Promise.all([
            UsageLog.countDocuments({}),
            UsageLog.find({})
                .populate("userId", "name email userId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);
        return res.pagination(record, count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const platformStats = async (req, res) => {
    try {
        const [users, apiKeys, paidOrders, usageCount, ledgerTopups] = await Promise.all([
            User.countDocuments({ deletedAt: null }),
            ApiKey.countDocuments({ deletedAt: null, isActive: true }),
            PaymentOrder.countDocuments({ status: "paid" }),
            UsageLog.countDocuments({}),
            CreditLedger.aggregate([
                { $match: { type: { $in: ["topup", "signup_bonus"] } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        return res.success({
            users,
            apiKeys,
            paidOrders,
            usageCount,
            creditsIssued: ledgerTopups[0]?.total || 0
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
