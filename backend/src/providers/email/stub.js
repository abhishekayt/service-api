export const send = async ({ to, subject, body }) => {
    return {
        provider: "stub",
        messageId: `stub_email_${Date.now()}`,
        to,
        subject,
        body,
        delivered: true
    };
};
