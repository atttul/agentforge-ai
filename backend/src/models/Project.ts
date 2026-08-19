import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface IProject extends MongooseDocument {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  agents: mongoose.Types.ObjectId[];
  documents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Project: Model<IProject> = mongoose.model<IProject>("Project", projectSchema);

export default Project;
