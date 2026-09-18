import express from "express";
import QuizResult from "../../models/QuizResult.js";
import Material from "../../models/Material.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in.",
      });
    }

    const userId =
      req.session.user._id ||
      req.session.user.id;

    const {
      materialId,
      topic = "",
      difficulty,
      totalQuestions,
      correctAnswers,
    } = req.body;

    console.log("[QuizResults] POST");
    console.log("[QuizResults] User:", userId);
    console.log("[QuizResults] Material:", materialId);
    console.log("[QuizResults] Score:", {
      correctAnswers,
      totalQuestions,
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in session.",
      });
    }

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "Material ID is required.",
      });
    }

    if (
      !["easy", "medium", "hard"].includes(
        difficulty
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty.",
      });
    }

    const total = Number(totalQuestions);
    const correct = Number(correctAnswers);

    if (
      !Number.isInteger(total) ||
      total < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid total question count.",
      });
    }

    if (
      !Number.isInteger(correct) ||
      correct < 0 ||
      correct > total
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid correct answer count.",
      });
    }

    const material =
      await Material.findOne({
        _id: materialId,
        userId,
      });

    if (!material) {
      console.log(
        "[QuizResults] Material not found for user."
      );

      return res.status(404).json({
        success: false,
        message:
          "Material not found or does not belong to this user.",
      });
    }

    const percentage = Math.round(
      (correct / total) * 100
    );

    const quizResult =
      await QuizResult.create({
        userId,
        materialId,
        topic: String(topic || "").trim(),
        difficulty,
        totalQuestions: total,
        correctAnswers: correct,
        percentage,
      });

    console.log(
      "[QuizResults] SAVED:",
      quizResult._id.toString()
    );

    return res.status(201).json({
      success: true,
      result: {
        id: quizResult._id,
        materialId: quizResult.materialId,
        topic: quizResult.topic,
        difficulty: quizResult.difficulty,
        totalQuestions:
          quizResult.totalQuestions,
        correctAnswers:
          quizResult.correctAnswers,
        percentage: quizResult.percentage,
        createdAt: quizResult.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "[QuizResults] POST error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save quiz result.",
      error: error.message,
    });
  }
});


router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in.",
      });
    }

    const userId =
      req.session.user._id ||
      req.session.user.id;

    console.log("[QuizResults] GET");
    console.log("[QuizResults] User:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in session.",
      });
    }

    const results =
      await QuizResult.find({
        userId,
      })
        .populate(
          "materialId",
          "originalName"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

    console.log(
      "[QuizResults] Found:",
      results.length
    );

    const formattedResults =
      results.map((result) => ({
        id: result._id,
        materialId:
          result.materialId?._id ||
          result.materialId,
        materialName:
          result.materialId?.originalName ||
          "Untitled material",
        topic: result.topic || "",
        difficulty: result.difficulty,
        totalQuestions:
          result.totalQuestions,
        correctAnswers:
          result.correctAnswers,
        percentage:
          result.percentage,
        createdAt:
          result.createdAt,
      }));

    return res.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error(
      "[QuizResults] GET error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load quiz history.",
      error: error.message,
    });
  }
});


export default router;