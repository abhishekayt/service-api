import { Router } from "express";
import { razorpayWebhook } from "../controller/user/payment.controller.js";

const router = Router();

router.post("/razorpay/webhook", razorpayWebhook);

export default router;
