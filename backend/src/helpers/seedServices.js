import { ApiService } from "../models/index.js";

const DEFAULT_SERVICES = [
    {
        slug: "sms.send",
        name: "Send SMS",
        description: "Send an SMS message via the configured provider (stub in MVP).",
        creditCost: 1,
        provider: "stub",
        isActive: true
    },
    {
        slug: "email.send",
        name: "Send Email",
        description: "Send an email via the configured provider (stub in MVP).",
        creditCost: 1,
        provider: "stub",
        isActive: true
    }
];

export const ensureDefaultApiServices = async () => {
    for (const service of DEFAULT_SERVICES) {
        await ApiService.updateOne(
            { slug: service.slug },
            { $setOnInsert: service },
            { upsert: true }
        );
    }
};
