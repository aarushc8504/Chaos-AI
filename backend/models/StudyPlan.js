import mongoose from "mongoose";

const studyTaskSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    date: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 5,
      max: 600,
    },

    type: {
      type: String,
      enum: [
        "study",
        "revision",
        "mcq",
        "flashcards",
      ],
      default: "study",
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    materialIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true,
      },
    ],

    title: {
      type: String,
      default: "My Study Plan",
      trim: true,
    },

    examDate: {
      type: String,
      required: true,
    },

    dailyMinutes: {
      type: Number,
      required: true,
      min: 15,
      max: 720,
    },

    tasks: {
      type: [studyTaskSchema],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "active",
        "completed",
        "archived",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

studyPlanSchema.index({
  userId: 1,
  createdAt: -1,
});

const StudyPlan = mongoose.model(
  "StudyPlan",
  studyPlanSchema
);

export default StudyPlan;