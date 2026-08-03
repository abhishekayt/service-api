import { Router } from "express";
import { requireApiKey } from "../middlewares/apiKeyAuth.js";
import { invokeService } from "../controller/v1/services.controller.js";

const router = Router();

router.use(requireApiKey);
router.post("/services/:service/:action", invokeService);

export default router;
