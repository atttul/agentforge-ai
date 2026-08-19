import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  MONGODB_URI: process.env.MONGODB_URI || "",

  REDIS_URL: process.env.REDIS_URL || "",

  PINECONE_API_KEY: process.env.PINECONE_API_KEY || "",
  PINECONE_INDEX: process.env.PINECONE_INDEX || "",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",

  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};