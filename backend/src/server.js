import "dotenv/config";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";

import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import materialsRouter from "./routes/materials.js";
import chatRouter from "./routes/chat.js";
import quizResultsRouter from "./routes/quizResults.js";
import flashcardResultsRouter from "./routes/flashcardResults.js";
import studyPlansRouter from "./routes/studyPlans.js";

const app = express();

const port =
  process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge:
        1000 *
        60 *
        60 *
        24 *
        7,
    },
  })
);

app.use(
  "/api/health",
  healthRouter
);

app.use(
  "/auth",
  authRouter
);

app.use(
  "/api/materials",
  materialsRouter
);

app.use(
  "/api/chat",
  chatRouter
);

app.use(
  "/api/quiz-results",
  quizResultsRouter
);

app.use(
  "/api/flashcard-results",
  flashcardResultsRouter
);

app.use(
  "/api/study-plans",
  studyPlansRouter
);

mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    app.listen(
      port,
      () => {
        console.log(
          `Chaos AI backend listening on port ${port}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error
    );
  });