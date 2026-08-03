export const send = async ({ to, message }, credentials = {}) => {
    const url = credentials.sms_url || "https://api.textlocal.in/send/";
    const apiKey = credentials.sms_key;
    const sender = credentials.sms_sender || "TXTLCL";

    if (!apiKey) {
        const err = new Error("SMS provider is not configured (missing sms_key)");
        err.code = "PROVIDER_CONFIG";
        throw err;
    }

    const params = new URLSearchParams({
        apikey: apiKey,
        numbers: String(to).replace(/\D/g, ""),
        message: String(message),
        sender
    });

    if (credentials.sms_hash) params.set("hash", credentials.sms_hash);

    const response = await fetch(`${url}?${params.toString()}`, { method: "POST" });
    const raw = await response.json().catch(async () => ({ body: await response.text() }));

    const failed =
        !response.ok ||
        raw?.status === "failure" ||
        raw?.status === "error" ||
        Number(raw?.status) === 0;

    if (failed) {
        const err = new Error(raw?.errors?.[0]?.message || raw?.message || "TextLocal SMS send failed");
        err.code = "PROVIDER_ERROR";
        err.raw = raw;
        throw err;
    }

    return {
        provider: "textlocal",
        messageId: String(raw?.messages?.[0]?.id || raw?.batch_id || `tl_${Date.now()}`),
        to,
        delivered: true,
        raw
    };
};
