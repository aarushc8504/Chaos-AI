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

const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing.");
}

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is missing.");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "chaos.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.get("/", (req, res) => {
  res.json({
    name: "Chaos AI Backend",
    status: "running",
  });
});

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
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

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

    process.exit(1);
  });