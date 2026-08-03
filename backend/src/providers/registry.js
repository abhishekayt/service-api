import * as smsStub from "./sms/stub.js";
import * as smsTextlocal from "./sms/textlocal.js";
import * as smsTest from "./sms/test.js";
import * as emailStub from "./email/stub.js";
import * as emailSmtp from "./email/smtp.js";
import { getSettingsMap } from "../helpers/settings.js";

const adapters = {
    sms: {
        stub: smsStub,
        textlocal: smsTextlocal,
        test: smsTest
    },
    email: {
        stub: emailStub,
        smtp: emailSmtp
    }
};

const normalizePayload = (serviceType, body) => {
    if (serviceType === "sms") {
        const to = String(body.to || "").trim();
        const message = String(body.message || "").trim();
        if (!to || !message) {
            const err = new Error("Fields 'to' and 'message' are required");
            err.code = "VALIDATION";
            throw err;
        }
        return { to, message };
    }

    if (serviceType === "email") {
        const to = String(body.to || "").trim();
        const subject = String(body.subject || "").trim();
        const emailBody = String(body.body || body.message || "").trim();
        if (!to || !subject || !emailBody) {
            const err = new Error("Fields 'to', 'subject' and 'body' are required");
            err.code = "VALIDATION";
            throw err;
        }
        return { to, subject, body: emailBody };
    }

    const err = new Error(`Unsupported service type '${serviceType}'`);
    err.code = "NOT_IMPLEMENTED";
    throw err;
};

const loadCredentials = async (serviceType, provider) => {
    if (provider === "stub" || provider === "test") return {};
    if (serviceType === "sms") return getSettingsMap(5);
    if (serviceType === "email") return getSettingsMap(3);
    return {};
};

export const executeProvider = async ({ serviceType, provider, body }) => {
    const family = adapters[serviceType];
    if (!family) {
        const err = new Error(`No adapters for service '${serviceType}'`);
        err.code = "NOT_IMPLEMENTED";
        throw err;
    }

    const adapter = family[provider] || family.stub;
    if (!adapter?.send) {
        const err = new Error(`Provider '${provider}' is not implemented for ${serviceType}`);
        err.code = "NOT_IMPLEMENTED";
        throw err;
    }

    const payload = normalizePayload(serviceType, body);
    const credentials = await loadCredentials(serviceType, provider || "stub");
    return adapter.send(payload, credentials);
};
