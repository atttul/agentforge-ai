import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface IDocument extends MongooseDocument {
  title: string;
  content: string;
  chunksCount: number;
  vectorIds: string[];
  agentId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileType: string;
  fileSize: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    chunksCount: {
      type: Number,
      default: 0,
    },
    vectorIds: {
      type: [String],
      default: [],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileType: {
      type: String,
      default: "text/plain",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DocumentModel: Model<IDocument> = mongoose.model<IDocument>(
  "Document",
  documentSchema
);

export default DocumentModel;
