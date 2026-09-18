import express from "express";
import mongoose from "mongoose";

import StudyPlan from "../../models/StudyPlan.js";
import Material from "../../models/Material.js";
import { runChaosAgent } from "../services/agent.js";

const router = express.Router();

const getSessionUserId = (req) =>
  req.session?.user?._id ||
  req.session?.user?.id;

const extractJson = (text) => {
  if (!text) {
    return null;
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    return null;
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  } catch {
    return null;
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

router.get("/", async (req, res) => {
  try {
    const userId =
      getSessionUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const plans =
      await StudyPlan.find({
        userId,
      })
        .populate(
          "materialIds",
          "originalName status"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20);

    return res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(
      "Load study plans error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load study plans.",
    });
  }
});

router.post(
  "/generate",
  async (req, res) => {
    try {
      const userId =
        getSessionUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const {
        materialIds,
        examDate,
        dailyMinutes,
        title,
      } = req.body;

      if (
        !Array.isArray(materialIds) ||
        materialIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Select at least one study material.",
        });
      }

      if (!examDate) {
        return res.status(400).json({
          success: false,
          message:
            "Exam date is required.",
        });
      }

      const exam = new Date(
        `${examDate}T23:59:59`
      );

      if (
        Number.isNaN(
          exam.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid exam date.",
        });
      }

      if (
        exam.getTime() <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exam date must be in the future.",
        });
      }

      const minutes = Math.min(
        720,
        Math.max(
          15,
          Number(dailyMinutes) ||
            60
        )
      );

      const validIds =
        materialIds.filter(
          (id) =>
            mongoose.Types.ObjectId.isValid(
              id
            )
        );

      if (
        validIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid materials were selected.",
        });
      }

      const materials =
        await Material.find({
          _id: {
            $in: validIds,
          },
          userId,
        }).select(
          "_id originalName status"
        );

      if (
        materials.length !==
        validIds.length
      ) {
        return res.status(403).json({
          success: false,
          message:
            "One or more selected materials are not available.",
        });
      }

      const materialId =
        materials[0]._id.toString();

      const question = `
Create a personalized study plan from my selected study material.

Exam date: ${examDate}
Daily study time: ${minutes} minutes
Selected materials: ${materials
        .map(
          (item) =>
            item.originalName
        )
        .join(", ")}

Use the study material retrieved through your tools as the ONLY academic source.

Identify important chapters and topics from the material.

Distribute the material across the available study days.

Include:
- study sessions
- revision sessions
- MCQ practice
- flashcard review

Keep each day's total duration at or below ${minutes} minutes.

Include final revision before the exam.

IMPORTANT:
The server will calculate the actual calendar dates.
Use only the day number to represent the order.

Return ONLY valid JSON in this exact shape:

{
  "title": "short plan title",
  "tasks": [
    {
      "day": 1,
      "title": "task title",
      "description": "short task description",
      "durationMinutes": 30,
      "type": "study"
    }
  ]
}

Allowed type values:
study
revision
mcq
flashcards

Do not include markdown fences.

Do not invent topics that are not supported by the study material.
`.trim();

      const result =
        await runChaosAgent({
          question,
          userId:
            userId.toString(),
          materialId,
        });

      const parsed =
        extractJson(
          result.answer
        );

      if (
        !parsed ||
        !Array.isArray(
          parsed.tasks
        )
      ) {
        return res.status(502).json({
          success: false,
          message:
            "The AI did not return a valid study plan. Please try again.",
        });
      }

      /*
       * IMPORTANT:
       * Calculate dates ourselves.
       *
       * Day 1 = today
       * Day 2 = tomorrow
       * Day 3 = day after tomorrow
       *
       * This prevents the AI from returning
       * completely incorrect dates.
       */

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const normalizedTasks =
        parsed.tasks
          .map(
            (
              task,
              index
            ) => {
              const day = Math.max(
                1,
                Number(
                  task.day
                ) ||
                  index + 1
              );

              const taskDate =
                new Date(
                  today
                );

              taskDate.setDate(
                today.getDate() +
                  day -
                  1
              );

              const date =
                formatDate(
                  taskDate
                );

              const duration =
                Math.min(
                  600,
                  Math.max(
                    5,
                    Number(
                      task.durationMinutes
                    ) ||
                      30
                  )
                );

              const allowedTypes =
                [
                  "study",
                  "revision",
                  "mcq",
                  "flashcards",
                ];

              return {
                day,
                date,

                title: String(
                  task.title ||
                    "Study session"
                ).slice(
                  0,
                  180
                ),

                description:
                  String(
                    task.description ||
                      ""
                  ).slice(
                    0,
                    500
                  ),

                durationMinutes:
                  duration,

                type:
                  allowedTypes.includes(
                    task.type
                  )
                    ? task.type
                    : "study",

                completed:
                  false,
              };
            }
          )
          .filter(
            (task) =>
              new Date(
                `${task.date}T23:59:59`
              ) <= exam
          );

      if (
        normalizedTasks.length ===
        0
      ) {
        return res.status(502).json({
          success: false,
          message:
            "The AI could not create usable study days for this exam date.",
        });
      }

      /*
       * Make sure daily time does not
       * exceed the selected limit.
       */

      const tasksByDay =
        new Map();

      for (const task of normalizedTasks) {
        if (
          !tasksByDay.has(
            task.day
          )
        ) {
          tasksByDay.set(
            task.day,
            []
          );
        }

        tasksByDay
          .get(task.day)
          .push(task);
      }

      const finalTasks = [];

      for (const [
        day,
        tasks,
      ] of tasksByDay) {
        let usedMinutes = 0;

        for (const task of tasks) {
          const remaining =
            minutes -
            usedMinutes;

          if (
            remaining <
            5
          ) {
            continue;
          }

          const adjustedDuration =
            Math.min(
              task.durationMinutes,
              remaining
            );

          if (
            adjustedDuration <
            5
          ) {
            continue;
          }

          finalTasks.push({
            ...task,
            durationMinutes:
              adjustedDuration,
          });

          usedMinutes +=
            adjustedDuration;
        }
      }

      if (
        finalTasks.length ===
        0
      ) {
        return res.status(502).json({
          success: false,
          message:
            "The generated plan contains no usable study sessions.",
        });
      }

      const plan =
        await StudyPlan.create({
          userId,

          materialIds:
            materials.map(
              (item) =>
                item._id
            ),

          title: String(
            title ||
              parsed.title ||
              "My Study Plan"
          ).slice(
            0,
            120
          ),

          examDate,

          dailyMinutes:
            minutes,

          tasks:
            finalTasks,

          status:
            "active",
        });

      const populated =
        await StudyPlan.findById(
          plan._id
        ).populate(
          "materialIds",
          "originalName status"
        );

      return res.status(201).json({
        success: true,
        plan: populated,
        sources:
          result.sources ||
          [],
      });
    } catch (error) {
      console.error(
        "Generate study plan error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to generate study plan.",
      });
    }
  }
);

router.patch(
  "/:id/tasks/:taskId",
  async (req, res) => {
    try {
      const userId =
        getSessionUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const {
        id,
        taskId,
      } = req.params;

      const completed =
        Boolean(
          req.body.completed
        );

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        ) ||
        !mongoose.Types.ObjectId.isValid(
          taskId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid plan or task id.",
        });
      }

      const plan =
        await StudyPlan.findOne({
          _id: id,
          userId,
        });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message:
            "Study plan not found.",
        });
      }

      const task =
        plan.tasks.id(
          taskId
        );

      if (!task) {
        return res.status(404).json({
          success: false,
          message:
            "Study task not found.",
        });
      }

      task.completed =
        completed;

      const allComplete =
        plan.tasks.length >
          0 &&
        plan.tasks.every(
          (item) =>
            item.completed
        );

      plan.status =
        allComplete
          ? "completed"
          : "active";

      await plan.save();

      return res.json({
        success: true,
        plan,
      });
    } catch (error) {
      console.error(
        "Update study task error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update study task.",
      });
    }
  }
);

router.patch(
  "/:id",
  async (req, res) => {
    try {
      const userId =
        getSessionUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const plan =
        await StudyPlan.findOneAndUpdate(
          {
            _id: req.params.id,
            userId,
          },
          {
            $set: {
              status:
                req.body.status ===
                "archived"
                  ? "archived"
                  : "active",
            },
          },
          {
            new: true,
          }
        ).populate(
          "materialIds",
          "originalName status"
        );

      if (!plan) {
        return res.status(404).json({
          success: false,
          message:
            "Study plan not found.",
        });
      }

      return res.json({
        success: true,
        plan,
      });
    } catch (error) {
      console.error(
        "Update study plan error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update study plan.",
      });
    }
  }
);

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const userId =
        getSessionUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const plan =
        await StudyPlan.findOneAndDelete(
          {
            _id: req.params.id,
            userId,
          }
        );

      if (!plan) {
        return res.status(404).json({
          success: false,
          message:
            "Study plan not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Study plan deleted.",
      });
    } catch (error) {
      console.error(
        "Delete study plan error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete study plan.",
      });
    }
  }
);

export default router;