import { ApiService, UsageLog, Wallet } from "../../models/index.js";
import { debitWallet, refundCredits } from "../../helpers/credits.js";
import { ensureDefaultApiServices } from "../../helpers/seedServices.js";
import { executeProvider } from "../../providers/registry.js";

export const invokeService = async (req, res) => {
    const started = Date.now();
    const serviceName = String(req.params.service || "").toLowerCase();
    const action = String(req.params.action || "").toLowerCase();
    const slug = `${serviceName}.${action}`;

    let usageLog = null;
    let debited = false;
    let creditCost = 0;

    try {
        await ensureDefaultApiServices();

        const service = await ApiService.findOne({ slug, deletedAt: null, isActive: true });
        if (!service) {
            return res.status(404).json({ status: false, message: `Service '${slug}' not found`, data: [] });
        }

        creditCost = service.creditCost;

        try {
            await debitWallet({
                userId: req.apiUser._id,
                amount: creditCost,
                description: `Usage: ${slug}`,
                referenceType: "ApiService",
                referenceId: service._id,
                meta: { apiKeyId: req.apiKey._id }
            });
            debited = true;
        } catch (error) {
            if (error.code === "INSUFFICIENT_CREDITS") {
                usageLog = await UsageLog.create({
                    userId: req.apiUser._id,
                    apiKeyId: req.apiKey._id,
                    serviceId: service._id,
                    serviceSlug: slug,
                    creditsCharged: 0,
                    status: "rejected",
                    requestMeta: { body: req.body },
                    errorMessage: "Insufficient credits",
                    latencyMs: Date.now() - started
                });

                return res.status(402).json({
                    status: false,
                    message: "Insufficient credits",
                    data: { usageId: usageLog._id, creditsRequired: creditCost }
                });
            }
            throw error;
        }

        const result = await executeProvider({
            serviceType: serviceName,
            provider: service.provider || "stub",
            body: req.body
        });

        usageLog = await UsageLog.create({
            userId: req.apiUser._id,
            apiKeyId: req.apiKey._id,
            serviceId: service._id,
            serviceSlug: slug,
            creditsCharged: creditCost,
            status: "success",
            requestMeta: { body: req.body },
            responseMeta: result,
            latencyMs: Date.now() - started
        });

        const wallet = await Wallet.findOne({ userId: req.apiUser._id });

        return res.success(
            {
                usageId: usageLog._id,
                service: slug,
                provider: result.provider,
                creditsCharged: creditCost,
                balanceRemaining: wallet?.balance ?? null,
                result
            },
            "Service executed successfully"
        );
    } catch (error) {
        if (debited && creditCost > 0) {
            try {
                await refundCredits({
                    userId: req.apiUser._id,
                    amount: creditCost,
                    description: `Refund: ${slug} failed`,
                    referenceType: "ApiService",
                    meta: { reason: error.message }
                });
            } catch (refundError) {
                // keep original error path
            }
        }

        usageLog = await UsageLog.create({
            userId: req.apiUser._id,
            apiKeyId: req.apiKey._id,
            serviceId: null,
            serviceSlug: slug,
            creditsCharged: 0,
            status: "failed",
            requestMeta: { body: req.body },
            errorMessage: error.message,
            latencyMs: Date.now() - started
        });

        const statusCode = error.code === "VALIDATION" || error.code === "PROVIDER_CONFIG" ? 400 : 502;
        return res.status(statusCode).json({
            status: false,
            message: error.message || "Service failed",
            data: { usageId: usageLog._id }
        });
    }
};
