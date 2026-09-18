import mongoose from "mongoose";

const quizResultSchema =
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

      difficulty: {
        type: String,
        enum: [
          "easy",
          "medium",
          "hard",
        ],
        required: true,
      },

      totalQuestions: {
        type: Number,
        required: true,
        min: 1,
      },

      correctAnswers: {
        type: Number,
        required: true,
        min: 0,
      },

      percentage: {
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

quizResultSchema.index({
  userId: 1,
  createdAt: -1,
});

const QuizResult =
  mongoose.model(
    "QuizResult",
    quizResultSchema
  );

export default QuizResult;