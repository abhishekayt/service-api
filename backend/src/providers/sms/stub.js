export const send = async ({ to, message }) => {
    return {
        provider: "stub",
        messageId: `stub_sms_${Date.now()}`,
        to,
        message,
        delivered: true
    };
};
