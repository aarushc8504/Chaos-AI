import express from "express";

import FlashcardResult from "../../models/FlashcardResult.js";
import Material from "../../models/Material.js";

const router = express.Router();

router.post(
  "/",
  async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({
          message:
            "You must be logged in.",
        });
      }

      const userId =
        req.session.user._id ||
        req.session.user.id;

      const {
        materialId,
        topic,
        totalCards,
        knownCards,
        reviewCards,
      } = req.body;

      if (!materialId) {
        return res.status(400).json({
          message:
            "Material ID is required.",
        });
      }

      if (
        !Number.isInteger(
          Number(totalCards)
        ) ||
        Number(totalCards) < 1
      ) {
        return res.status(400).json({
          message:
            "A valid total card count is required.",
        });
      }

      if (
        !Number.isInteger(
          Number(knownCards)
        ) ||
        Number(knownCards) < 0
      ) {
        return res.status(400).json({
          message:
            "A valid known card count is required.",
        });
      }

      if (
        !Number.isInteger(
          Number(reviewCards)
        ) ||
        Number(reviewCards) < 0
      ) {
        return res.status(400).json({
          message:
            "A valid review card count is required.",
        });
      }

      const total =
        Number(totalCards);

      const known =
        Number(knownCards);

      const review =
        Number(reviewCards);

      if (
        known + review >
        total
      ) {
        return res.status(400).json({
          message:
            "Known and review cards cannot exceed total cards.",
        });
      }

      const material =
        await Material.findOne({
          _id: materialId,
          userId,
        });

      if (!material) {
        return res.status(404).json({
          message:
            "Material not found.",
        });
      }

      const completionPercentage =
        Math.round(
          (known / total) * 100
        );

      const result =
        await FlashcardResult.create({
          userId,
          materialId,
          topic:
            typeof topic === "string"
              ? topic.trim()
              : "",
          totalCards: total,
          knownCards: known,
          reviewCards: review,
          completionPercentage,
        });

      return res.status(201).json({
        success: true,
        result,
      });

    } catch (error) {
      console.error(
        "Saving flashcard result failed:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to save flashcard result.",
      });
    }
  }
);

router.get(
  "/",
  async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({
          message:
            "You must be logged in.",
        });
      }

      const userId =
        req.session.user._id ||
        req.session.user.id;

      const results =
        await FlashcardResult.find({
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

      return res.json({
        success: true,
        results,
      });

    } catch (error) {
      console.error(
        "Loading flashcard results failed:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load flashcard results.",
      });
    }
  }
);

export default router;