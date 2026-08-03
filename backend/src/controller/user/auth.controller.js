import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { User } from "../../models/index.js";
import { creditWallet, getOrCreateWallet } from "../../helpers/credits.js";

const SIGNUP_BONUS_CREDITS = 100;

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const userRegister = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name || !email || !password) {
            return res.someThingWentWrong({ message: "Name, email and password are required" });
        }

        const existing = await User.findOne({
            deletedAt: null,
            $or: [{ email: email.toLowerCase() }, ...(mobile ? [{ mobile }] : [])]
        });
        if (existing) return res.someThingWentWrong({ message: "User with this email/mobile already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            ...(mobile ? { mobile } : {}),
            password: hashed
        });

        await getOrCreateWallet(user._id);
        await creditWallet({
            userId: user._id,
            amount: SIGNUP_BONUS_CREDITS,
            type: "signup_bonus",
            description: "Welcome credits"
        });

        const token = jwt.sign({ id: user._id, role: "user" }, config.jwtSecret, { expiresIn: "7d" });
        res.cookie("user_token", token, cookieOptions);

        return res.successInsert(
            { _id: user._id, userId: user.userId, name: user.name, email: user.email, mobile: user.mobile },
            "Registration successful"
        );
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.someThingWentWrong({ message: "Email and password are required" });

        const user = await User.findOne({
            email: email.toLowerCase(),
            deletedAt: null,
            isActive: true
        }).select("+password");
        if (!user) return res.someThingWentWrong({ message: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.someThingWentWrong({ message: "Invalid credentials" });

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, role: "user" }, config.jwtSecret, { expiresIn: "7d" });
        res.cookie("user_token", token, cookieOptions);

        return res.success(
            { _id: user._id, userId: user.userId, name: user.name, email: user.email, mobile: user.mobile },
            "Login successful"
        );
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const userProfile = async (req, res) => {
    try {
        const user = await User.findOne(
            { _id: req.user.id, deletedAt: null },
            { userId: 1, name: 1, email: 1, mobile: 1, createdAt: 1, lastLogin: 1 }
        );
        if (!user) return res.noRecords(false, "User not found");

        const wallet = await getOrCreateWallet(user._id);
        return res.success({ ...user.toObject(), balance: wallet.balance });
    } catch (error) {
        return res.someThingWentWrong(error);
    }
};

export const userLogout = async (req, res) => {
    res.clearCookie("user_token");
    return res.success([], "Logged out");
};
