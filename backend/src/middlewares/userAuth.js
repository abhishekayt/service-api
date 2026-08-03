import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const requireUserAuth = (req, res, next) => {
    try {
        const token = req.cookies?.user_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized Access..!!", data: [] });

        const payload = jwt.verify(token, config.jwtSecret);
        if (payload.role !== "user") return res.status(403).json({ status: false, message: "Forbidden Access..!!", data: [] });

        req.user = payload;
        return next();
    } catch (error) {
        return res.status(401).json({ status: false, message: "Invalid user session", data: [] });
    }
};
