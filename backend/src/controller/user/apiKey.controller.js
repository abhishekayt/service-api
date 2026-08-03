import { ApiKey } from "../../models/index.js";
import { generateApiKey } from "../../helpers/apiKey.js";

export const listApiKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find(
            { userId: req.user.id, deletedAt: null },
            { name: 1, keyPrefix: 1, isActive: 1, lastUsedAt: 1, createdAt: 1 }
        ).sort({ createdAt: -1 });

        return res.success(keys);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createApiKey = async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        if (!name) return res.someThingWentWrong({ message: "API key name is required" });

        const { raw, hash, prefix } = generateApiKey();
        const apiKey = await ApiKey.create({
            userId: req.user.id,
            name,
            keyHash: hash,
            keyPrefix: prefix
        });

        return res.successInsert(
            {
                _id: apiKey._id,
                name: apiKey.name,
                keyPrefix: apiKey.keyPrefix,
                isActive: apiKey.isActive,
                createdAt: apiKey.createdAt,
                apiKey: raw
            },
            "API key created. Copy it now — it will not be shown again."
        );
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const revokeApiKey = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({
            _id: req.params.id,
            userId: req.user.id,
            deletedAt: null
        });
        if (!apiKey) return res.noRecords(false, "API key not found");

        apiKey.isActive = false;
        apiKey.deletedAt = new Date();
        await apiKey.save();

        return res.successDelete(apiKey, "API key revoked");
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};
