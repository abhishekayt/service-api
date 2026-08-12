import { CreditLedger, UsageLog } from "../../models/index.js";
import { getOrCreateWallet } from "../../helpers/credits.js";

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
