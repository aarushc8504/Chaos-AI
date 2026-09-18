import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileHash: {
      type: String,
      required: true,
      index: true,
    },

    blobName: {
      type: String,
      required: true,
    },

    containerName: {
      type: String,
      required: true,
    },

    contentType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "ready",
        "failed",
      ],
      default: "uploaded",
    },

    extractedText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

materialSchema.index(
  {
    userId: 1,
    fileHash: 1,
  },
  {
    unique: true,
  }
);

const Material =
  mongoose.model(
    "Material",
    materialSchema
  );

export default Material;