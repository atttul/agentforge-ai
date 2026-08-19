import mongoose, { Document, Model, Schema } from "mongoose";

export enum AgentStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
}

export interface IAgent extends Omit<Document, "model"> {
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  knowledgeBases: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    systemPrompt: {
      type: String,
      required: true,
      default: "You are a helpful AI assistant created on AgentForge AI platform.",
    },
    model: {
      type: String,
      required: true,
      default: "openrouter/free",
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 2048,
    },
    tools: {
      type: [String],
      default: [],
    },
    knowledgeBases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(AgentStatus),
      default: AgentStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Agent: Model<IAgent> = mongoose.model<IAgent>("Agent", agentSchema);

export default Agent;
