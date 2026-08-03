import Razorpay from "razorpay";
import crypto from "crypto";
import { getSettingsMap } from "./settings.js";

export const getRazorpayCredentials = async () => {
    const settings = await getSettingsMap(4);
    const keyId = settings.razorpay_key;
    const keySecret = settings.razorpay_secret;
    if (!keyId || !keySecret || String(keyId).startsWith("change_me") || String(keySecret).startsWith("change_me")) {
        const err = new Error("Razorpay is not configured. Update Payment Settings in admin.");
        err.code = "PROVIDER_CONFIG";
        throw err;
    }
    return { keyId, keySecret, merchantId: settings.merchant_id || null };
};

export const getRazorpayClient = async () => {
    const { keyId, keySecret } = await getRazorpayCredentials();
    return {
        client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
        keyId,
        keySecret
    };
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature, keySecret }) => {
    const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
    return expected === signature;
};

export const verifyWebhookSignature = ({ rawBody, signature, keySecret }) => {
    const expected = crypto.createHmac("sha256", keySecret).update(rawBody).digest("hex");
    return expected === signature;
};
