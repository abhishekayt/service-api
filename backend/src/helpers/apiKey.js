import crypto from "crypto";

export const hashApiKey = (rawKey) => crypto.createHash("sha256").update(rawKey).digest("hex");

export const generateApiKey = () => {
    const raw = `sk_live_${crypto.randomBytes(24).toString("hex")}`;
    return {
        raw,
        hash: hashApiKey(raw),
        prefix: raw.slice(0, 12)
    };
};
