import { CreditPack, PaymentOrder } from "../../models/index.js";
import { creditWallet } from "../../helpers/credits.js";
import { getRazorpayClient, getRazorpayCredentials, verifyPaymentSignature, verifyWebhookSignature } from "../../helpers/razorpay.js";
import { ensureDefaultCreditPacks } from "../../helpers/seedCreditPacks.js";

export const listCreditPacks = async (req, res) => {
    try {
        await ensureDefaultCreditPacks();
        const packs = await CreditPack.find({ deletedAt: null, isActive: true }).sort({ sortOrder: 1, credits: 1 });
        return res.success(packs);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const createPaymentOrder = async (req, res) => {
    try {
        const packId = req.body.creditPackId;
        if (!packId) return res.someThingWentWrong({ message: "creditPackId is required" });

        const pack = await CreditPack.findOne({ _id: packId, deletedAt: null, isActive: true });
        if (!pack) return res.noRecords(false, "Credit pack not found");

        const { client, keyId } = await getRazorpayClient();
        const order = await client.orders.create({
            amount: pack.amountInPaise,
            currency: pack.currency || "INR",
            receipt: `pack_${pack._id}_${Date.now()}`.slice(0, 40),
            notes: {
                userId: String(req.user.id),
                creditPackId: String(pack._id),
                credits: String(pack.credits)
            }
        });

        const paymentOrder = await PaymentOrder.create({
            userId: req.user.id,
            creditPackId: pack._id,
            credits: pack.credits,
            amountInPaise: pack.amountInPaise,
            currency: pack.currency || "INR",
            razorpayOrderId: order.id,
            status: "created",
            meta: { receipt: order.receipt }
        });

        return res.successInsert(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId,
                paymentOrderId: paymentOrder._id,
                credits: pack.credits,
                packName: pack.name
            },
            "Payment order created"
        );
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.someThingWentWrong({ message: "Missing Razorpay payment fields" });
        }

        const { keySecret } = await getRazorpayCredentials();
        const valid = verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            keySecret
        });
        if (!valid) return res.someThingWentWrong({ message: "Invalid payment signature" });

        const paymentOrder = await PaymentOrder.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: req.user.id
        });
        if (!paymentOrder) return res.noRecords(false, "Payment order not found");

        if (paymentOrder.status === "paid") {
            return res.success(paymentOrder, "Payment already processed");
        }

        const claimed = await PaymentOrder.findOneAndUpdate(
            { _id: paymentOrder._id, status: { $ne: "paid" } },
            { $set: { status: "paid", razorpayPaymentId: razorpay_payment_id } },
            { new: true }
        );

        if (!claimed) {
            const existing = await PaymentOrder.findById(paymentOrder._id);
            return res.success(existing, "Payment already processed");
        }

        const wallet = await creditWallet({
            userId: claimed.userId,
            amount: claimed.credits,
            type: "topup",
            description: `Razorpay top-up (${claimed.credits} credits)`,
            referenceType: "PaymentOrder",
            referenceId: claimed._id,
            meta: { razorpay_order_id, razorpay_payment_id }
        });

        return res.success(
            {
                paymentOrder: claimed,
                balance: wallet.balance
            },
            "Credits added successfully"
        );
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const listMyPayments = async (req, res) => {
    try {
        const { limit, pageNo } = req.query;
        const skip = (pageNo - 1) * limit;
        const filter = { userId: req.user.id };
        const [count, record] = await Promise.all([
            PaymentOrder.countDocuments(filter),
            PaymentOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);
        return res.pagination(record, count, limit, pageNo);
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

const markOrderPaidFromWebhook = async (orderId, paymentId, payload) => {
    const claimed = await PaymentOrder.findOneAndUpdate(
        { razorpayOrderId: orderId, status: { $ne: "paid" } },
        {
            $set: {
                status: "paid",
                razorpayPaymentId: paymentId,
                meta: { webhook: payload }
            }
        },
        { new: true }
    );
    if (!claimed) return null;

    await creditWallet({
        userId: claimed.userId,
        amount: claimed.credits,
        type: "topup",
        description: `Razorpay webhook top-up (${claimed.credits} credits)`,
        referenceType: "PaymentOrder",
        referenceId: claimed._id,
        meta: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, source: "webhook" }
    });

    return claimed;
};

export const razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const { keySecret } = await getRazorpayCredentials();
        const rawBody = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);

        if (!signature || !verifyWebhookSignature({ rawBody, signature, keySecret })) {
            return res.status(400).json({ status: false, message: "Invalid webhook signature" });
        }

        const event = req.body?.event;
        const paymentEntity = req.body?.payload?.payment?.entity;
        if (event === "payment.captured" && paymentEntity?.order_id) {
            await markOrderPaidFromWebhook(paymentEntity.order_id, paymentEntity.id, req.body);
        }

        return res.status(200).json({ status: true });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message || "Webhook failed" });
    }
};
