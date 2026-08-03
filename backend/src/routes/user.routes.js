import { Router } from "express";
import { requireUserAuth } from "../middlewares/userAuth.js";
import { userLogout, userProfile } from "../controller/user/auth.controller.js";
import { createApiKey, listApiKeys, revokeApiKey } from "../controller/user/apiKey.controller.js";
import { getDashboard, listUsage } from "../controller/user/dashboard.controller.js";
import { validator } from "../libraries/validator.js";

const router = Router();

router.use(requireUserAuth);

router.get("/profile", userProfile);
router.post("/logout", userLogout);

router.get("/dashboard", getDashboard);
router.get("/usage", listUsage);

router.get("/api-keys", listApiKeys);
router.post("/api-keys", validator("api-key-create"), createApiKey);
router.delete("/api-keys/:id", revokeApiKey);

export default router;
