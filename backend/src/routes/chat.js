import express from "express";
import multer from "multer";

import {
  runChaosAgent,
} from "../services/agent.js";

const router =
  express.Router();

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter:
      (
        req,
        file,
        cb
      ) => {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];

        if (
          allowedTypes.includes(
            file.mimetype
          )
        ) {
          cb(
            null,
            true
          );
        } else {
          cb(
            new Error(
              "Only PNG, JPEG, JPG, and WEBP images are supported."
            )
          );
        }
      },
  });


/* =========================================================
   GENERATE MCQS
   ========================================================= */

router.post(
  "/mcqs",
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            message:
              "You must be logged in.",
          });
      }

      const {
        materialId,
        numberOfQuestions,
        difficulty,
        topic,
      } = req.body;

      if (
        !materialId
      ) {
        return res
          .status(400)
          .json({
            message:
              "Material ID is required.",
          });
      }

      const count =
        Number(
          numberOfQuestions
        ) || 10;

      const level =
        difficulty ||
        "medium";

      let question =
        `Generate ${count} ${level} difficulty MCQs from my study material.`;

      if (
        topic &&
        topic.trim()
      ) {
        question +=
          ` Focus on the topic "${topic.trim()}".`;
      }

      console.log(
        "\n========== MCQ REQUEST =========="
      );

      console.log(
        "User:",
        req.session.user.id
      );

      console.log(
        "Material:",
        materialId
      );

      console.log(
        "Questions:",
        count
      );

      console.log(
        "Difficulty:",
        level
      );

      console.log(
        "Topic:",
        topic ||
          "Entire material"
      );

      console.log(
        "=================================\n"
      );

      const result =
        await runChaosAgent({
          question,

          userId:
            req.session.user.id,

          materialId,
        });

      res.json({
        success:
          true,

        mcqs:
          result.mcqs ||
          [],

        sources:
          result.sources ||
          [],
      });

    } catch (
      error
    ) {
      console.error(
        "MCQ generation error:",
        error
      );

      res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to generate MCQs.",
        });
    }
  }
);


/* =========================================================
   GENERATE FLASHCARDS
   ========================================================= */

router.post(
  "/flashcards",
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "You must be logged in.",
          });
      }

      const {
        materialId,
        numberOfCards,
        topic,
      } = req.body;

      if (
        !materialId
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Material ID is required.",
          });
      }

      const count =
        Number(
          numberOfCards
        ) || 10;

      const safeCount =
        Math.min(
          Math.max(
            count,
            1
          ),
          20
        );

      let question =
        `Generate ${safeCount} flashcards from my study material.`;

      if (
        topic &&
        topic.trim()
      ) {
        question +=
          ` Focus on the topic "${topic.trim()}".`;
      }

      console.log(
        "\n========== FLASHCARD REQUEST =========="
      );

      console.log(
        "User:",
        req.session.user.id
      );

      console.log(
        "Material:",
        materialId
      );

      console.log(
        "Cards:",
        safeCount
      );

      console.log(
        "Topic:",
        topic ||
          "Entire material"
      );

      console.log(
        "========================================\n"
      );

      const result =
        await runChaosAgent({
          question,

          userId:
            req.session.user.id,

          materialId,
        });

      res.json({
        success:
          true,

        flashcards:
          result.flashcards ||
          [],

        sources:
          result.sources ||
          [],
      });

    } catch (
      error
    ) {
      console.error(
        "Flashcard generation error:",
        error
      );

      if (
        error.message?.includes(
          "Azure's content safety filter"
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              error.message,
          });
      }

      res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed to generate flashcards.",
        });
    }
  }
);


/* =========================================================
   NORMAL CHAT + MULTIMODAL IMAGE CHAT
   ========================================================= */

router.post(
  "/",
  upload.single(
    "image"
  ),
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.session.user
      ) {
        return res
          .status(401)
          .json({
            message:
              "You must be logged in.",
          });
      }

      const question =
        req.body.question;

      const materialId =
        req.body.materialId;

      if (
        !question ||
        !question.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Question is required.",
          });
      }

      let imageBuffer =
        null;

      let imageMimeType =
        null;

      if (
        req.file
      ) {
        imageBuffer =
          req.file.buffer;

        imageMimeType =
          req.file.mimetype;

        console.log(
          "Multimodal image received:",
          req.file.originalname
        );

        console.log(
          "Image type:",
          imageMimeType
        );

        console.log(
          "Image size:",
          req.file.size,
          "bytes"
        );
      }

      console.log(
        "\n========== CHAOS AGENT REQUEST =========="
      );

      console.log(
        "Question:",
        question
      );

      console.log(
        "User:",
        req.session.user.id
      );

      console.log(
        "Material:",
        materialId ||
          "All materials"
      );

      console.log(
        "Image:",
        req.file
          ? req.file
              .originalname
          : "None"
      );

      console.log(
        "==========================================\n"
      );

      const result =
        await runChaosAgent({
          question:
            question.trim(),

          userId:
            req.session.user.id,

          materialId:
            materialId ||
            null,

          imageBuffer,

          imageMimeType,
        });

      res.json({
        answer:
          result.answer,

        sources:
          result.sources ||
          [],

        mcqs:
          result.mcqs ||
          null,

        flashcards:
          result.flashcards ||
          null,
      });

    } catch (
      error
    ) {
      console.error(
        "Chat/Agent error:",
        error
      );

      if (
        error.message?.includes(
          "Azure's content safety filter"
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              error.message,
          });
      }

      if (
        error.message?.includes(
          "Only PNG"
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              error.message,
          });
      }

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Image must be smaller than 10 MB.",
          });
      }

      res
        .status(500)
        .json({
          message:
            "Failed to generate an answer.",
        });
    }
  }
);


export default router;