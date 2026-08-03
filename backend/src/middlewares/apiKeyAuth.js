import { ApiKey, User } from "../models/index.js";
import { hashApiKey } from "../helpers/apiKey.js";

const extractRawKey = (req) => {
    const headerKey = req.headers["x-user-api-key"];
    if (headerKey) return String(headerKey).trim();

    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();

    return null;
};

export const requireApiKey = async (req, res, next) => {
    try {
        const rawKey = extractRawKey(req);
        if (!rawKey) {
            return res.status(401).json({ status: false, message: "API key is required", data: [] });
        }

        const keyHash = hashApiKey(rawKey);
        const apiKey = await ApiKey.findOne({ keyHash, deletedAt: null, isActive: true });
        if (!apiKey) {
            return res.status(401).json({ status: false, message: "Invalid API key", data: [] });
        }

        const user = await User.findOne({ _id: apiKey.userId, deletedAt: null, isActive: true });
        if (!user) {
            return res.status(401).json({ status: false, message: "API key owner is inactive", data: [] });
        }

        apiKey.lastUsedAt = new Date();
        await apiKey.save();

        req.apiKey = apiKey;
        req.apiUser = user;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid API key", data: [] });
    }
};
