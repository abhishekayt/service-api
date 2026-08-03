import { Router } from "express";
import { userLogin, userRegister } from "../controller/user/auth.controller.js";
import { validator } from "../libraries/validator.js";

const router = Router();

router.post("/register", validator("user-register"), userRegister);
router.post("/login", validator("user-login"), userLogin);

export default router;
