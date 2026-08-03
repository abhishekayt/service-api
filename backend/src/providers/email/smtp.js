import nodemailer from "nodemailer";

export const send = async ({ to, subject, body }, credentials = {}) => {
    const host = credentials.smtp_host;
    const port = Number(credentials.smtp_port || 465);
    const user = credentials.smtp_user;
    const pass = credentials.smtp_pass;
    const from = credentials.email_from || user;

    if (!host || !user || !pass) {
        const err = new Error("Email provider is not configured (SMTP settings missing)");
        err.code = "PROVIDER_CONFIG";
        throw err;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: body,
        html: `<pre style="font-family:inherit;white-space:pre-wrap">${String(body)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>`
    });

    return {
        provider: "smtp",
        messageId: info.messageId || `smtp_${Date.now()}`,
        to,
        subject,
        delivered: true,
        raw: { accepted: info.accepted, rejected: info.rejected, response: info.response }
    };
};
