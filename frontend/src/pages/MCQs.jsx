import React, {
  useEffect,
  useState,
} from "react";

import API_URL from "../config";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleAlert,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

function MCQs({
  materials = [],
  theme = "obsidian",
}) {
  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState("");

  const [
    numberOfQuestions,
    setNumberOfQuestions,
  ] = useState(10);

  const [
    difficulty,
    setDifficulty,
  ] = useState("medium");

  const [
    topic,
    setTopic,
  ] = useState("");

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    finished,
    setFinished,
  ] = useState(false);

  const [
    savingResult,
    setSavingResult,
  ] = useState(false);

  const [
    resultSaved,
    setResultSaved,
  ] = useState(false);

  const darkTheme =
    theme !== "paper";

  const themeStyles = {
    obsidian: {
      page: "bg-[#0b0d0f] text-white",
      card: "border-zinc-800 bg-[#101214]",
      input:
        "border-zinc-700 bg-[#0d0f11] text-zinc-200 placeholder:text-zinc-600",
      label: "text-zinc-500",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      button:
        "bg-white text-black hover:bg-zinc-200",
      option:
        "border-zinc-800 bg-[#111315] text-zinc-300 hover:border-zinc-600",
      progress: "bg-white",
    },

    midnight: {
      page: "bg-[#080b12] text-white",
      card:
        "border-[#263040] bg-[#0d111a]",
      input:
        "border-[#263040] bg-[#0a0e16] text-zinc-200 placeholder:text-zinc-600",
      label: "text-zinc-500",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      button:
        "bg-white text-black hover:bg-zinc-200",
      option:
        "border-[#263040] bg-[#0d111a] text-zinc-300 hover:border-zinc-500",
      progress: "bg-white",
    },

    forest: {
      page: "bg-[#09100d] text-white",
      card:
        "border-[#293b31] bg-[#0d1511]",
      input:
        "border-[#293b31] bg-[#0a110d] text-zinc-200 placeholder:text-zinc-600",
      label: "text-zinc-500",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      button:
        "bg-white text-black hover:bg-zinc-200",
      option:
        "border-[#293b31] bg-[#0d1511] text-zinc-300 hover:border-zinc-500",
      progress: "bg-white",
    },

    paper: {
      page:
        "bg-[#f5f5f2] text-zinc-950",
      card:
        "border-[#d8d8d2] bg-white",
      input:
        "border-zinc-300 bg-white text-zinc-800 placeholder:text-zinc-400",
      label: "text-zinc-500",
      heading: "text-zinc-950",
      muted: "text-zinc-500",
      subtle: "text-zinc-400",
      button:
        "bg-zinc-950 text-white hover:bg-zinc-800",
      option:
        "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400",
      progress: "bg-zinc-950",
    },
  };

  const currentTheme =
    themeStyles[theme] ||
    themeStyles.obsidian;

  useEffect(() => {
    if (
      materials.length > 0 &&
      !selectedMaterial
    ) {
      const readyMaterial =
        materials.find(
          (material) =>
            material.status ===
            "ready"
        );

      if (readyMaterial) {
        setSelectedMaterial(
          readyMaterial._id
        );
      }
    }
  }, [
    materials,
    selectedMaterial,
  ]);

  const getMaterialName =
    (material) => {
      return (
        material.originalName ||
        "Untitled material"
      );
    };

  const generateMCQs =
    async () => {
      if (
        !selectedMaterial
      ) {
        setError(
          "Select a study material first."
        );

        return;
      }

      setLoading(true);
      setError("");
      setQuestions([]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setScore(0);
      setFinished(false);
      setSavingResult(false);
      setResultSaved(false);

      try {
        const response =
          await fetch(
            `${API_URL}/api/chat/mcqs`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                materialId:
                  selectedMaterial,

                numberOfQuestions:
                  Number(
                    numberOfQuestions
                  ),

                difficulty,

                topic:
                  topic.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to generate MCQs."
          );
        }

        if (
          !Array.isArray(
            data.mcqs
          ) ||
          data.mcqs.length ===
            0
        ) {
          throw new Error(
            "No MCQs were generated."
          );
        }

        setQuestions(
          data.mcqs
        );
      } catch (
        err
      ) {
        console.error(
          err
        );

        setError(
          err.message ||
            "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

  const chooseAnswer =
    (index) => {
      if (
        submitted
      ) {
        return;
      }

      setSelectedAnswer(
        index
      );
    };

  const submitAnswer =
    () => {
      if (
        selectedAnswer ===
        null
      ) {
        return;
      }

      const question =
        questions[
          currentQuestion
        ];

      if (
        selectedAnswer ===
        question.correctAnswer
      ) {
        setScore(
          (value) =>
            value + 1
        );
      }

      setSubmitted(true);
    };

  const nextQuestion =
    async () => {
      if (
        currentQuestion <
        questions.length - 1
      ) {
        setCurrentQuestion(
          (value) =>
            value + 1
        );

        setSelectedAnswer(
          null
        );

        setSubmitted(false);

        return;
      }

      const finalCorrectAnswers =
        score +
        (selectedAnswer ===
        questions[currentQuestion]
          .correctAnswer
          ? 1
          : 0);

      setScore(
        finalCorrectAnswers
      );

      await saveQuizResult(
        finalCorrectAnswers
      );
    };

  const saveQuizResult =
    async (
      finalCorrectAnswers
    ) => {
      if (
        !selectedMaterial ||
        questions.length ===
          0 ||
        resultSaved ||
        savingResult
      ) {
        return;
      }

      setSavingResult(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/quiz-results`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                materialId:
                  selectedMaterial,

                topic:
                  topic.trim(),

                difficulty,

                totalQuestions:
                  questions.length,

                correctAnswers:
                  finalCorrectAnswers,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to save quiz result."
          );
        }

        console.log(
          "[MCQs] Quiz result saved:",
          data.result
        );

        setResultSaved(true);
        setFinished(true);
      } catch (
        err
      ) {
        console.error(
          "[MCQs] Result save error:",
          err
        );

        setError(
          err.message ||
            "Failed to save quiz result."
        );

        setFinished(true);
      } finally {
        setSavingResult(false);
      }
    };

  const restartQuiz =
    () => {
      setQuestions([]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setScore(0);
      setFinished(false);
      setSavingResult(false);
      setResultSaved(false);
      setError("");
    };

  const getOptionClass =
    (index) => {
      if (
        !submitted
      ) {
        if (
          selectedAnswer ===
          index
        ) {
          return darkTheme
            ? "border-white bg-white text-black"
            : "border-zinc-950 bg-zinc-950 text-white";
        }

        return currentTheme.option;
      }

      const correct =
        questions[
          currentQuestion
        ].correctAnswer;

      if (
        index === correct
      ) {
        return "border-emerald-500 bg-emerald-950/30 text-emerald-400";
      }

      if (
        index ===
        selectedAnswer
      ) {
        return "border-red-500 bg-red-950/30 text-red-400";
      }

      return darkTheme
        ? "border-zinc-800 bg-zinc-900/40 text-zinc-700"
        : "border-zinc-200 bg-zinc-50 text-zinc-400";
    };

  if (
    questions.length ===
      0 &&
    !loading
  ) {
    return (
      <div
        className={`h-full min-h-0 overflow-y-auto overscroll-contain px-8 py-8 ${currentTheme.page}`}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <div
              className={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] ${currentTheme.muted}`}
            >
              <Sparkles size={14} />
              Practice
            </div>

            <h1
              className={`text-3xl font-semibold tracking-tight ${currentTheme.heading}`}
            >
              MCQs
            </h1>

            <p
              className={`mt-2 max-w-xl text-sm leading-6 ${currentTheme.muted}`}
            >
              Turn your study material into
              focused practice questions.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div
              className={`rounded-3xl border p-7 shadow-sm ${currentTheme.card}`}
            >
              <div className="mb-7">
                <h2
                  className={`text-lg font-semibold ${currentTheme.heading}`}
                >
                  Create a quiz
                </h2>

                <p
                  className={`mt-1 text-sm ${currentTheme.muted}`}
                >
                  Questions will be generated
                  directly from your selected
                  material.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className={`mb-2 block text-xs font-medium uppercase tracking-wider ${currentTheme.label}`}
                  >
                    Study material
                  </label>

                  <select
                    value={
                      selectedMaterial
                    }
                    onChange={(event) =>
                      setSelectedMaterial(
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-zinc-400 ${currentTheme.input}`}
                  >
                    <option value="">
                      Select material
                    </option>

                    {materials.map(
                      (material) => (
                        <option
                          key={
                            material._id
                          }
                          value={
                            material._id
                          }
                          disabled={
                            material.status !==
                            "ready"
                          }
                        >
                          {getMaterialName(
                            material
                          )}

                          {material.status !==
                            "ready" &&
                            " — processing"}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    className={`mb-2 block text-xs font-medium uppercase tracking-wider ${currentTheme.label}`}
                  >
                    Topic
                  </label>

                  <input
                    value={topic}
                    onChange={(event) =>
                      setTopic(
                        event.target.value
                      )
                    }
                    placeholder="Optional — e.g. Vedangas"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-zinc-400 ${currentTheme.input}`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className={`mb-2 block text-xs font-medium uppercase tracking-wider ${currentTheme.label}`}
                    >
                      Questions
                    </label>

                    <select
                      value={
                        numberOfQuestions
                      }
                      onChange={(event) =>
                        setNumberOfQuestions(
                          event.target.value
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-zinc-400 ${currentTheme.input}`}
                    >
                      <option value="5">
                        5 questions
                      </option>

                      <option value="10">
                        10 questions
                      </option>

                      <option value="15">
                        15 questions
                      </option>

                      <option value="20">
                        20 questions
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`mb-2 block text-xs font-medium uppercase tracking-wider ${currentTheme.label}`}
                    >
                      Difficulty
                    </label>

                    <select
                      value={difficulty}
                      onChange={(event) =>
                        setDifficulty(
                          event.target.value
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm capitalize outline-none focus:border-zinc-400 ${currentTheme.input}`}
                    >
                      <option value="easy">
                        Easy
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="hard">
                        Hard
                      </option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-400">
                    <CircleAlert
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                <button
                  onClick={
                    generateMCQs
                  }
                  disabled={
                    loading ||
                    !selectedMaterial
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${currentTheme.button}`}
                >
                  <Sparkles
                    size={16}
                  />

                  Generate MCQs
                </button>
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 ${
                darkTheme
                  ? "border-zinc-800 bg-[#101214]"
                  : "border-zinc-200 bg-zinc-950 text-white"
              }`}
            >
              <div className="mb-8 text-xs uppercase tracking-[0.18em] text-zinc-500">
                How it works
              </div>

              <div className="space-y-7">
                <div>
                  <div className="mb-2 text-sm font-medium">
                    01 — Retrieve
                  </div>

                  <p className="text-xs leading-5 text-zinc-500">
                    Chaos finds the most
                    relevant sections of
                    your material.
                  </p>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">
                    02 — Generate
                  </div>

                  <p className="text-xs leading-5 text-zinc-500">
                    The agent creates questions
                    grounded in those sections.
                  </p>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">
                    03 — Practice
                  </div>

                  <p className="text-xs leading-5 text-zinc-500">
                    Answer, review explanations,
                    and track your score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    loading
  ) {
    return (
      <div
        className={`flex h-full min-h-0 items-center justify-center overflow-y-auto px-6 ${currentTheme.page}`}
      >
        <div className="text-center">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
              darkTheme
                ? "bg-white text-black"
                : "bg-zinc-950 text-white"
            }`}
          >
            <Sparkles
              size={22}
            />
          </div>

          <h2
            className={`text-lg font-semibold ${currentTheme.heading}`}
          >
            Building your quiz
          </h2>

          <p
            className={`mt-2 text-sm ${currentTheme.muted}`}
          >
            Reading your material and
            generating questions...
          </p>

          <div
            className={`mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full ${
              darkTheme
                ? "bg-zinc-800"
                : "bg-zinc-200"
            }`}
          >
            <div
              className={`h-full w-1/2 animate-pulse rounded-full ${currentTheme.progress}`}
            />
          </div>
        </div>
      </div>
    );
  }

  if (
    finished
  ) {
    const percentage =
      Math.round(
        (score /
          questions.length) *
          100
      );

    return (
      <div
        className={`flex h-full min-h-0 items-center justify-center overflow-y-auto px-6 py-10 ${currentTheme.page}`}
      >
        <div
          className={`w-full max-w-xl rounded-3xl border p-10 text-center shadow-sm ${currentTheme.card}`}
        >
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
              darkTheme
                ? "bg-white text-black"
                : "bg-zinc-950 text-white"
            }`}
          >
            <Check
              size={28}
            />
          </div>

          <div
            className={`text-xs font-medium uppercase tracking-[0.2em] ${currentTheme.muted}`}
          >
            Quiz complete
          </div>

          <h1
            className={`mt-3 text-4xl font-semibold tracking-tight ${currentTheme.heading}`}
          >
            {score} /{" "}
            {questions.length}
          </h1>

          <p
            className={`mt-2 text-sm ${currentTheme.muted}`}
          >
            {percentage}% accuracy
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-950/30 p-5">
              <div className="text-2xl font-semibold text-emerald-400">
                {score}
              </div>

              <div className="mt-1 text-xs text-emerald-500">
                Correct
              </div>
            </div>

            <div className="rounded-2xl bg-red-950/30 p-5">
              <div className="text-2xl font-semibold text-red-400">
                {questions.length -
                  score}
              </div>

              <div className="mt-1 text-xs text-red-500">
                Incorrect
              </div>
            </div>
          </div>

          {savingResult && (
            <p
              className={`mt-6 text-sm ${currentTheme.muted}`}
            >
              Saving your result...
            </p>
          )}

          {resultSaved && (
            <p className="mt-6 text-sm text-emerald-400">
              Result saved to your study history.
            </p>
          )}

          {!resultSaved && error && (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-left text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={
              restartQuiz
            }
            disabled={
              savingResult
            }
            className={`mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme.button}`}
          >
            <RotateCcw
              size={15}
            />

            New quiz
          </button>
        </div>
      </div>
    );
  }

  const question =
    questions[
      currentQuestion
    ];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  return (
    <div
      className={`h-full min-h-0 overflow-y-auto overscroll-contain px-8 py-8 ${currentTheme.page}`}
    >
      <div className="mx-auto max-w-4xl">
        <button
          onClick={
            restartQuiz
          }
          className={`mb-8 inline-flex items-center gap-2 text-xs font-medium ${currentTheme.muted}`}
        >
          <ArrowLeft
            size={14}
          />

          Exit quiz
        </button>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <div
              className={`mb-2 text-xs uppercase tracking-[0.18em] ${currentTheme.muted}`}
            >
              {difficulty} practice
            </div>

            <h1
              className={`text-2xl font-semibold tracking-tight ${currentTheme.heading}`}
            >
              Question{" "}
              {currentQuestion + 1}{" "}
              <span
                className={`font-normal ${currentTheme.subtle}`}
              >
                / {questions.length}
              </span>
            </h1>
          </div>

          <div
            className={`text-sm font-medium ${currentTheme.muted}`}
          >
            {score} correct
          </div>
        </div>

        <div
          className={`mb-8 h-1 overflow-hidden rounded-full ${
            darkTheme
              ? "bg-zinc-800"
              : "bg-zinc-200"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${currentTheme.progress}`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div
          className={`rounded-3xl border p-8 shadow-sm ${currentTheme.card}`}
        >
          <h2
            className={`max-w-3xl text-xl font-semibold leading-8 ${currentTheme.heading}`}
          >
            {question.question}
          </h2>

          <div className="mt-8 space-y-3">
            {question.options.map(
              (
                option,
                index
              ) => (
                <button
                  key={
                    index
                  }
                  onClick={() =>
                    chooseAnswer(
                      index
                    )
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left text-sm transition ${getOptionClass(
                    index
                  )}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-current text-xs font-semibold">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span className="flex-1">
                    {option}
                  </span>

                  {submitted &&
                    index ===
                      question.correctAnswer && (
                      <Check
                        size={18}
                      />
                    )}

                  {submitted &&
                    index ===
                      selectedAnswer &&
                    index !==
                      question.correctAnswer && (
                      <X
                        size={18}
                      />
                    )}
                </button>
              )
            )}
          </div>

          {submitted && (
            <div
              className={`mt-6 rounded-2xl border p-5 ${
                selectedAnswer ===
                question.correctAnswer
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-red-800 bg-red-950/30"
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  selectedAnswer ===
                  question.correctAnswer
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {selectedAnswer ===
                question.correctAnswer
                  ? "Correct"
                  : "Not quite"}
              </div>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {
                  question.explanation
                }
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!submitted ? (
              <button
                onClick={
                  submitAnswer
                }
                disabled={
                  selectedAnswer ===
                  null
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${currentTheme.button}`}
              >
                Check answer

                <Check
                  size={15}
                />
              </button>
            ) : (
              <button
                onClick={
                  nextQuestion
                }
                disabled={
                  savingResult
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme.button}`}
              >
                {currentQuestion <
                questions.length -
                  1
                  ? "Next question"
                  : savingResult
                  ? "Saving result..."
                  : "See results"}

                <ChevronRight
                  size={16}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MCQs;