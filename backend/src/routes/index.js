import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import adminAuthRoutes from "./adminAuth.routes.js";
import openRoutes from "./open.routes.js";
import userAuthRoutes from "./userAuth.routes.js";
import userRoutes from "./user.routes.js";
import v1Routes from "./v1.routes.js";
import webhookRoutes from "./webhook.routes.js";

const router = Router();

router.use("/", openRoutes);
router.use("/auth", authRoutes);
router.use("/webhooks", webhookRoutes);

router.use("/admin", adminAuthRoutes);
router.use("/admin", adminRoutes);

router.use("/user", userAuthRoutes);
router.use("/user", userRoutes);

router.use("/v1", v1Routes);

export default router;
