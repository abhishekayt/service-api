import { CreditLedger, UsageLog } from "../../models/index.js";
import { getOrCreateWallet } from "../../helpers/credits.js";
import { escapeRegex } from "../../helpers/utils.js";

export const getDashboard = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.id);
        const recentUsage = await UsageLog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("serviceSlug creditsCharged status errorMessage createdAt latencyMs");

        const recentLedger = await CreditLedger.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("txnId type amount balanceAfter description createdAt");

        return res.success({
            balance: wallet.balance,
            recentUsage,
            recentLedger
        });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listUsage = async (req, res) => {
    try {
        const { limit, pageNo } = req.query;
        const skip = (pageNo - 1) * limit;
        const filter = { userId: req.user.id };

        const [count, record] = await Promise.all([
            UsageLog.countDocuments(filter),
            UsageLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("serviceSlug creditsCharged status errorMessage createdAt latencyMs")
        ]);

        return res.pagination(record, count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listLedger = async (req, res) => {
    try {
        const { limit = 10, pageNo = 1, query, type } = req.query;
        const skip = (pageNo - 1) * limit;
        const filter = { userId: req.user.id };

        if (type && type !== "All") {
            if (type === "Credit") {
                filter.$or = [
                    { type: { $in: ["topup", "signup_bonus", "refund"] } },
                    { type: "adjustment", amount: { $gt: 0 } }
                ];
            } else if (type === "Debit") {
                filter.$or = [
                    { type: "debit" },
                    { type: "adjustment", amount: { $lt: 0 } }
                ];
            }
        }

        if (query) {
            const q = escapeRegex(query);
            const queryFilter = {
                $or: [
                    { txnId: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { type: { $regex: q, $options: "i" } },
                    { source: { $regex: q, $options: "i" } }
                ]
            };
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, queryFilter];
                delete filter.$or;
            } else {
                Object.assign(filter, queryFilter);
            }
        }

        const [count, record] = await Promise.all([
            CreditLedger.countDocuments(filter),
            CreditLedger.find(filter)
                .sort({ createdAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit))
                .select("txnId type source amount balanceAfter description createdAt")
                .lean()
        ]);

        const wallet = await getOrCreateWallet(req.user.id);

        return res.pagination(record, count, Number(limit), Number(pageNo), { balance: wallet.balance });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
