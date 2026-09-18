import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  History,
  Layers,
  RefreshCw,
  Target,
  Trophy,
} from "lucide-react";

import API_URL from "../config";

function Analytics({ theme = "obsidian" }) {
  const [quizResults, setQuizResults] = useState([]);
  const [flashcardResults, setFlashcardResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const darkTheme = theme !== "paper";

  const themes = {
    obsidian: {
      page: "bg-[#0b0d0f] text-white",
      card: "border-zinc-800 bg-[#101214]",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      border: "border-zinc-800",
      soft: "bg-zinc-900/50",
    },
    midnight: {
      page: "bg-[#080b12] text-white",
      card: "border-[#263040] bg-[#0d111a]",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      border: "border-[#263040]",
      soft: "bg-[#111722]",
    },
    forest: {
      page: "bg-[#09100d] text-white",
      card: "border-[#293b31] bg-[#0d1511]",
      heading: "text-white",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      border: "border-[#293b31]",
      soft: "bg-[#111a15]",
    },
    paper: {
      page: "bg-[#f5f5f2] text-zinc-950",
      card: "border-[#d8d8d2] bg-white",
      heading: "text-zinc-950",
      muted: "text-zinc-500",
      subtle: "text-zinc-400",
      border: "border-zinc-200",
      soft: "bg-zinc-50",
    },
  };

  const currentTheme =
    themes[theme] || themes.obsidian;

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const [quizResponse, flashcardResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/quiz-results`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/flashcard-results`, {
            credentials: "include",
          }),
        ]);

      const quizData =
        await quizResponse.json();

      const flashcardData =
        await flashcardResponse.json();

      if (!quizResponse.ok) {
        throw new Error(
          quizData.message ||
            "Failed to load quiz analytics."
        );
      }

      if (!flashcardResponse.ok) {
        throw new Error(
          flashcardData.message ||
            "Failed to load flashcard analytics."
        );
      }

      setQuizResults(
        Array.isArray(
          quizData.results
        )
          ? quizData.results
          : []
      );

      setFlashcardResults(
        Array.isArray(
          flashcardData.results
        )
          ? flashcardData.results
          : []
      );
    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        err.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const stats = useMemo(() => {
    const totalQuestions =
      quizResults.reduce(
        (sum, result) =>
          sum +
          Number(
            result.totalQuestions || 0
          ),
        0
      );

    const totalCorrect =
      quizResults.reduce(
        (sum, result) =>
          sum +
          Number(
            result.correctAnswers || 0
          ),
        0
      );

    const totalCards =
      flashcardResults.reduce(
        (sum, result) =>
          sum +
          Number(
            result.totalCards || 0
          ),
        0
      );

    const knownCards =
      flashcardResults.reduce(
        (sum, result) =>
          sum +
          Number(
            result.knownCards || 0
          ),
        0
      );

    const reviewCards =
      flashcardResults.reduce(
        (sum, result) =>
          sum +
          Number(
            result.reviewCards || 0
          ),
        0
      );

    return {
      totalQuizzes:
        quizResults.length,

      totalQuestions,

      totalCorrect,

      quizAccuracy:
        totalQuestions > 0
          ? Math.round(
              (totalCorrect /
                totalQuestions) *
                100
            )
          : 0,

      bestQuiz:
        quizResults.length > 0
          ? Math.max(
              ...quizResults.map(
                (result) =>
                  Number(
                    result.percentage ||
                      0
                  )
              )
            )
          : 0,

      flashcardSessions:
        flashcardResults.length,

      totalCards,

      knownCards,

      reviewCards,

      recall:
        totalCards > 0
          ? Math.round(
              (knownCards /
                totalCards) *
                100
            )
          : 0,
    };
  }, [
    quizResults,
    flashcardResults,
  ]);

  const recentActivity =
    useMemo(() => {
      const quizzes =
        quizResults.map(
          (result) => ({
            type: "quiz",
            id: `quiz-${
              result._id ||
              result.id
            }`,
            date:
              result.createdAt,
            material:
              result.materialId
                ?.originalName ||
              result.materialName ||
              "Study material",
            topic:
              result.topic || "",
            metric: Number(
              result.percentage ||
                0
            ),
            detail: `${
              result.correctAnswers ||
              0
            }/${
              result.totalQuestions ||
              0
            }`,
          })
        );

      const flashcards =
        flashcardResults.map(
          (result) => ({
            type: "flashcards",
            id: `flash-${
              result._id ||
              result.id
            }`,
            date:
              result.createdAt,
            material:
              result.materialId
                ?.originalName ||
              result.materialName ||
              "Study material",
            topic:
              result.topic || "",
            metric: Number(
              result.completionPercentage ||
                0
            ),
            detail: `${
              result.knownCards ||
              0
            }/${
              result.totalCards ||
              0
            } known`,
          })
        );

      return [
        ...quizzes,
        ...flashcards,
      ]
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .slice(0, 8);
    }, [
      quizResults,
      flashcardResults,
    ]);

  const difficultyStats =
    useMemo(() => {
      const stats = {
        easy: {
          quizzes: 0,
          accuracyTotal: 0,
        },
        medium: {
          quizzes: 0,
          accuracyTotal: 0,
        },
        hard: {
          quizzes: 0,
          accuracyTotal: 0,
        },
      };

      quizResults.forEach(
        (result) => {
          if (
            stats[result.difficulty]
          ) {
            stats[
              result.difficulty
            ].quizzes += 1;

            stats[
              result.difficulty
            ].accuracyTotal +=
              Number(
                result.percentage ||
                  0
              );
          }
        }
      );

      return Object.fromEntries(
        Object.entries(stats).map(
          ([key, value]) => [
            key,
            {
              quizzes:
                value.quizzes,

              accuracy:
                value.quizzes > 0
                  ? Math.round(
                      value.accuracyTotal /
                        value.quizzes
                    )
                  : 0,
            },
          ]
        )
      );
    }, [quizResults]);

  const materialStats =
    useMemo(() => {
      const grouped = {};

      quizResults.forEach(
        (result) => {
          const name =
            result.materialId
              ?.originalName ||
            result.materialName ||
            "Untitled material";

          if (!grouped[name]) {
            grouped[name] = {
              name,
              quizzes: 0,
              questions: 0,
              correct: 0,
              flashcardSessions: 0,
              cards: 0,
              known: 0,
            };
          }

          grouped[name].quizzes += 1;

          grouped[name].questions +=
            Number(
              result.totalQuestions ||
                0
            );

          grouped[name].correct +=
            Number(
              result.correctAnswers ||
                0
            );
        }
      );

      flashcardResults.forEach(
        (result) => {
          const name =
            result.materialId
              ?.originalName ||
            result.materialName ||
            "Untitled material";

          if (!grouped[name]) {
            grouped[name] = {
              name,
              quizzes: 0,
              questions: 0,
              correct: 0,
              flashcardSessions: 0,
              cards: 0,
              known: 0,
            };
          }

          grouped[
            name
          ].flashcardSessions += 1;

          grouped[name].cards +=
            Number(
              result.totalCards ||
                0
            );

          grouped[name].known +=
            Number(
              result.knownCards ||
                0
            );
        }
      );

      return Object.values(grouped)
        .map((item) => ({
          ...item,

          quizAccuracy:
            item.questions > 0
              ? Math.round(
                  (item.correct /
                    item.questions) *
                    100
                )
              : 0,

          recall:
            item.cards > 0
              ? Math.round(
                  (item.known /
                    item.cards) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.questions +
            b.cards -
            (a.questions +
              a.cards)
        );
    }, [
      quizResults,
      flashcardResults,
    ]);

  const formatDate = (
    date
  ) => {
    if (!date) return "";

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }

    return value.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const getAccuracyClass =
    (value) => {
      if (value >= 80)
        return "text-emerald-400";

      if (value >= 60)
        return "text-amber-400";

      return "text-red-400";
    };

  const getBarClass =
    (value) => {
      if (value >= 80)
        return "bg-emerald-400";

      if (value >= 60)
        return "bg-amber-400";

      return "bg-red-400";
    };

  if (loading) {
    return (
      <div
        className={`h-full overflow-y-auto px-8 py-8 ${currentTheme.page}`}
      >
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-3 w-24 rounded bg-zinc-800" />
          <div className="mt-4 h-9 w-48 rounded bg-zinc-800" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-zinc-800" />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-zinc-900"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`h-full overflow-y-auto px-8 py-8 ${currentTheme.page}`}
      >
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-32 text-center">
          <CircleAlert
            size={22}
            className="text-red-400"
          />

          <h1
            className={`mt-5 text-xl font-semibold ${currentTheme.heading}`}
          >
            Analytics unavailable
          </h1>

          <p
            className={`mt-2 text-sm ${currentTheme.muted}`}
          >
            {error}
          </p>

          <button
            onClick={loadResults}
            className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              darkTheme
                ? "bg-white text-black"
                : "bg-zinc-950 text-white"
            }`}
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasActivity =
    quizResults.length > 0 ||
    flashcardResults.length > 0;

  return (
    <div
      className={`h-full overflow-y-auto overscroll-contain px-8 py-8 ${currentTheme.page}`}
    >
      <div className="mx-auto max-w-6xl pb-12">

        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div
              className={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] ${currentTheme.muted}`}
            >
              <BarChart3 size={14} />
              Overview
            </div>

            <h1
              className={`text-3xl font-semibold tracking-tight ${currentTheme.heading}`}
            >
              Study analytics
            </h1>

            <p
              className={`mt-2 max-w-xl text-sm leading-6 ${currentTheme.muted}`}
            >
              A combined view of your quiz performance and active-recall practice.
            </p>
          </div>

          <button
            onClick={loadResults}
            className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition ${currentTheme.border} ${
              darkTheme
                ? "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {!hasActivity && (
          <div
            className={`mb-6 rounded-3xl border p-8 text-center ${currentTheme.card}`}
          >
            <Target
              size={23}
              className={`mx-auto ${currentTheme.muted}`}
            />

            <h2
              className={`mt-4 text-lg font-semibold ${currentTheme.heading}`}
            >
              Start building your progress
            </h2>

            <p
              className={`mx-auto mt-2 max-w-md text-sm leading-6 ${currentTheme.muted}`}
            >
              Complete an MCQ quiz or a flashcard session and your study activity will appear here.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            icon={History}
            label="Quiz sessions"
            value={stats.totalQuizzes}
            detail="Completed quizzes"
            theme={currentTheme}
          />

          <MetricCard
            icon={Target}
            label="Quiz accuracy"
            value={`${stats.quizAccuracy}%`}
            detail={`${stats.totalCorrect}/${stats.totalQuestions} correct`}
            theme={currentTheme}
            valueClass={getAccuracyClass(
              stats.quizAccuracy
            )}
          />

          <MetricCard
            icon={Layers}
            label="Cards studied"
            value={stats.totalCards}
            detail={`${stats.flashcardSessions} completed sessions`}
            theme={currentTheme}
          />

          <MetricCard
            icon={CheckCircle2}
            label="Flashcard recall"
            value={`${stats.recall}%`}
            detail={`${stats.knownCards} known · ${stats.reviewCards} review`}
            theme={currentTheme}
            valueClass={getAccuracyClass(
              stats.recall
            )}
          />

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">

          <div
            className={`rounded-3xl border p-6 ${currentTheme.card}`}
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2
                  className={`text-base font-semibold ${currentTheme.heading}`}
                >
                  Recent performance
                </h2>

                <p
                  className={`mt-1 text-xs ${currentTheme.muted}`}
                >
                  Latest quizzes and flashcard sessions.
                </p>
              </div>

              <BarChart3
                size={17}
                className={
                  currentTheme.subtle
                }
              />
            </div>

            {recentActivity.length >
            0 ? (
              <div className="flex h-56 items-end gap-3">
                {recentActivity
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span
                        className={`text-[10px] font-medium ${getAccuracyClass(
                          item.metric
                        )}`}
                      >
                        {item.metric}%
                      </span>

                      <div className="flex h-40 w-full items-end">
                        <div
                          className={`mx-auto w-full max-w-10 rounded-t-lg transition-all ${
                            item.type ===
                            "quiz"
                              ? getBarClass(
                                  item.metric
                                )
                              : "bg-zinc-400"
                          }`}
                          style={{
                            height: `${Math.max(
                              item.metric,
                              5
                            )}%`,
                          }}
                        />
                      </div>

                      <span
                        className={`text-[10px] ${currentTheme.muted}`}
                      >
                        {formatDate(
                          item.date
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div
                className={`flex h-56 items-center justify-center text-xs ${currentTheme.muted}`}
              >
                No activity yet.
              </div>
            )}

            {recentActivity.length >
              0 && (
              <div className="mt-4 flex justify-center gap-5 text-[10px] text-zinc-600">
                <span>Quiz</span>
                <span>Flashcards</span>
              </div>
            )}
          </div>

          <div
            className={`rounded-3xl border p-6 ${currentTheme.card}`}
          >
            <div className="mb-7">
              <h2
                className={`text-base font-semibold ${currentTheme.heading}`}
              >
                Practice mix
              </h2>

              <p
                className={`mt-1 text-xs ${currentTheme.muted}`}
              >
                How you've been using Chaos AI.
              </p>
            </div>

            <MixRow
              label="MCQ quizzes"
              value={stats.totalQuizzes}
              total={
                stats.totalQuizzes +
                stats.flashcardSessions
              }
              theme={currentTheme}
            />

            <MixRow
              label="Flashcard sessions"
              value={
                stats.flashcardSessions
              }
              total={
                stats.totalQuizzes +
                stats.flashcardSessions
              }
              theme={currentTheme}
            />

            <div
              className={`mt-8 rounded-2xl border p-4 ${currentTheme.border} ${currentTheme.soft}`}
            >
              <div className="flex items-center gap-3">
                <Layers
                  size={16}
                  className={
                    currentTheme.subtle
                  }
                />

                <div>
                  <p
                    className={`text-xs font-medium ${currentTheme.heading}`}
                  >
                    Active recall
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${currentTheme.muted}`}
                  >
                    {stats.reviewCards} cards have been marked for review.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">

          <div
            className={`rounded-3xl border p-6 ${currentTheme.card}`}
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2
                  className={`text-base font-semibold ${currentTheme.heading}`}
                >
                  Quiz difficulty
                </h2>

                <p
                  className={`mt-1 text-xs ${currentTheme.muted}`}
                >
                  Average performance by level.
                </p>
              </div>

              <Target
                size={17}
                className={
                  currentTheme.subtle
                }
              />
            </div>

            <div className="space-y-6">
              {[
                "easy",
                "medium",
                "hard",
              ].map((level) => {
                const data =
                  difficultyStats[
                    level
                  ];

                return (
                  <div key={level}>
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`text-xs capitalize ${currentTheme.heading}`}
                      >
                        {level}
                      </span>

                      <span
                        className={`text-xs ${currentTheme.muted}`}
                      >
                        {data.quizzes}{" "}
                        {data.quizzes ===
                        1
                          ? "quiz"
                          : "quizzes"}
                      </span>
                    </div>

                    <div
                      className={`h-2 overflow-hidden rounded-full ${
                        darkTheme
                          ? "bg-zinc-800"
                          : "bg-zinc-200"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${getBarClass(
                          data.accuracy
                        )}`}
                        style={{
                          width: `${data.accuracy}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between">
                      <span
                        className={`text-[10px] ${currentTheme.muted}`}
                      >
                        Accuracy
                      </span>

                      <span
                        className={`text-[10px] font-medium ${
                          data.quizzes
                            ? getAccuracyClass(
                                data.accuracy
                              )
                            : currentTheme.muted
                        }`}
                      >
                        {data.quizzes
                          ? `${data.accuracy}%`
                          : "No data"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded-3xl border p-6 ${currentTheme.card}`}
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2
                  className={`text-base font-semibold ${currentTheme.heading}`}
                >
                  Material performance
                </h2>

                <p
                  className={`mt-1 text-xs ${currentTheme.muted}`}
                >
                  Practice volume and recall by material.
                </p>
              </div>

              <BookOpen
                size={17}
                className={
                  currentTheme.subtle
                }
              />
            </div>

            <div className="space-y-5">
              {materialStats
                .slice(0, 6)
                .map((material) => (
                  <div key={material.name}>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className={`truncate text-xs font-medium ${currentTheme.heading}`}
                        >
                          {material.name}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${currentTheme.muted}`}
                        >
                          {material.questions} questions ·{" "}
                          {material.cards} cards
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-xs font-semibold ${getAccuracyClass(
                          material.questions >
                            0
                            ? material.quizAccuracy
                            : material.recall
                        )}`}
                      >
                        {material.questions >
                        0
                          ? `${material.quizAccuracy}% quiz`
                          : `${material.recall}% recall`}
                      </span>
                    </div>

                    <div
                      className={`h-1.5 overflow-hidden rounded-full ${
                        darkTheme
                          ? "bg-zinc-800"
                          : "bg-zinc-200"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${getBarClass(
                          material.questions >
                            0
                            ? material.quizAccuracy
                            : material.recall
                        )}`}
                        style={{
                          width: `${
                            material.questions >
                            0
                              ? material.quizAccuracy
                              : material.recall
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

              {materialStats.length ===
                0 && (
                <p
                  className={`text-xs ${currentTheme.muted}`}
                >
                  No material activity yet.
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">

          <ActivityList
            title="Recent quizzes"
            icon={History}
            items={quizResults.slice(
              0,
              5
            )}
            type="quiz"
            theme={currentTheme}
            accuracyClass={
              getAccuracyClass
            }
          />

          <ActivityList
            title="Recent flashcards"
            icon={Layers}
            items={flashcardResults.slice(
              0,
              5
            )}
            type="flashcards"
            theme={currentTheme}
            accuracyClass={
              getAccuracyClass
            }
          />

        </div>

      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  theme,
  valueClass,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${theme.card}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${theme.muted}`}
        >
          {label}
        </span>

        <Icon
          size={16}
          className={theme.subtle}
        />
      </div>

      <div
        className={`mt-5 text-3xl font-semibold ${
          valueClass ||
          theme.heading
        }`}
      >
        {value}
      </div>

      <p
        className={`mt-1 text-xs ${theme.muted}`}
      >
        {detail}
      </p>
    </div>
  );
}

function MixRow({
  label,
  value,
  total,
  theme,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-between">
        <span
          className={`text-xs ${theme.heading}`}
        >
          {label}
        </span>

        <span
          className={`text-xs ${theme.muted}`}
        >
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-400"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function ActivityList({
  title,
  icon: Icon,
  items,
  type,
  theme,
  accuracyClass,
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${theme.card}`}
    >
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2
            className={`text-base font-semibold ${theme.heading}`}
          >
            {title}
          </h2>

          <p
            className={`mt-1 text-xs ${theme.muted}`}
          >
            Your latest completed sessions.
          </p>
        </div>

        <Icon
          size={17}
          className={theme.subtle}
        />
      </div>

      <div className="space-y-3">
        {items.map(
          (result, index) => {
            const percentage =
              type === "quiz"
                ? Number(
                    result.percentage ||
                      0
                  )
                : Number(
                    result.completionPercentage ||
                      0
                  );

            const material =
              result.materialId
                ?.originalName ||
              result.materialName ||
              "Study material";

            return (
              <div
                key={
                  result._id ||
                  result.id ||
                  index
                }
                className={`flex items-center justify-between gap-4 rounded-xl p-3 ${theme.soft}`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-medium ${theme.heading}`}
                  >
                    {material}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${theme.muted}`}
                  >
                    {type ===
                    "quiz"
                      ? `${
                          result.difficulty ||
                          "quiz"
                        }${
                          result.topic
                            ? ` · ${result.topic}`
                            : ""
                        }`
                      : `flashcards${
                          result.topic
                            ? ` · ${result.topic}`
                            : ""
                        }`}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${accuracyClass(
                      percentage
                    )}`}
                  >
                    {percentage}%
                  </p>

                  <p
                    className={`mt-0.5 text-[10px] ${theme.muted}`}
                  >
                    {type ===
                    "quiz"
                      ? `${
                          result.correctAnswers ||
                          0
                        }/${
                          result.totalQuestions ||
                          0
                        }`
                      : `${
                          result.knownCards ||
                          0
                        }/${
                          result.totalCards ||
                          0
                        }`}
                  </p>
                </div>
              </div>
            );
          }
        )}

        {items.length === 0 && (
          <p
            className={`text-xs ${theme.muted}`}
          >
            No sessions yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Analytics;