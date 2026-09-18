import mongoose from "mongoose";

const flashcardResultSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true,
      },

      topic: {
        type: String,
        default: "",
        trim: true,
      },

      totalCards: {
        type: Number,
        required: true,
        min: 1,
      },

      knownCards: {
        type: Number,
        required: true,
        min: 0,
      },

      reviewCards: {
        type: Number,
        required: true,
        min: 0,
      },

      completionPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    {
      timestamps: true,
    }
  );

flashcardResultSchema.index({
  userId: 1,
  createdAt: -1,
});

const FlashcardResult =
  mongoose.model(
    "FlashcardResult",
    flashcardResultSchema
  );

export default FlashcardResult;