import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";
import Agent from "../models/Agent";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ MongoDB connected successfully.");

    // Migrate all agent models in MongoDB to openrouter/free
    try {
      await Agent.updateMany(
        { model: { $ne: "openrouter/free" } },
        { $set: { model: "openrouter/free" } }
      );
    } catch (migErr: any) {
      logger.warn(`Model migration notice: ${migErr.message}`);
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};