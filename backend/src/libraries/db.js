import dns from "dns";
import mongoose from "mongoose";
import { config } from "../config/index.js";

// Some Windows/ISP DNS resolvers refuse SRV lookups required by mongodb+srv://
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDb = async () => {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
};
