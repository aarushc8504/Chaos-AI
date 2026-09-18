import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Layers,
  RefreshCw,
  Target,
  Trophy,
  Upload,
} from "lucide-react";

function Dashboard({
  user,
  materials = [],
  onOpenWorkspace,
  onOpenMCQs,
  onOpenLibrary,
  onOpenFlashcards,
}) {
  const [quizResults, setQuizResults] = useState([]);
  const [flashcardResults, setFlashcardResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const [quizResponse, flashcardResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/quiz-results", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/api/flashcard-results", {
            credentials: "include",
          }),
        ]);

      const quizData = await quizResponse.json();
      const flashcardData = await flashcardResponse.json();

      if (!quizResponse.ok) {
        throw new Error(
          quizData.message || "Failed to load quiz results."
        );
      }

      if (!flashcardResponse.ok) {
        throw new Error(
          flashcardData.message || "Failed to load flashcard results."
        );
      }

      setQuizResults(
        Array.isArray(quizData.results) ? quizData.results : []
      );

      setFlashcardResults(
        Array.isArray(flashcardData.results)
          ? flashcardData.results
          : []
      );
    } catch (err) {
      console.error("Dashboard results error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const readyMaterials = materials.filter(
    (material) => material.status === "ready"
  );

  const processingMaterials = materials.filter(
    (material) => material.status === "processing"
  );

  const totalQuestions = quizResults.reduce(
    (sum, result) => sum + Number(result.totalQuestions || 0),
    0
  );

  const totalCorrect = quizResults.reduce(
    (sum, result) => sum + Number(result.correctAnswers || 0),
    0
  );

  const totalFlashcards = flashcardResults.reduce(
    (sum, result) => sum + Number(result.totalCards || 0),
    0
  );

  const totalKnownCards = flashcardResults.reduce(
    (sum, result) => sum + Number(result.knownCards || 0),
    0
  );

  const overallAccuracy =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

  const flashcardRecall =
    totalFlashcards > 0
      ? Math.round((totalKnownCards / totalFlashcards) * 100)
      : 0;

  const recentActivity = useMemo(() => {
    const quizzes = quizResults.map((result) => ({
      type: "quiz",
      id: `quiz-${result._id || result.id}`,
      date: result.createdAt,
      materialName:
        result.materialId?.originalName ||
        result.materialName ||
        "Study material",
      topic: result.topic || "",
      score: `${result.correctAnswers || 0}/${result.totalQuestions || 0}`,
      percentage: Number(result.percentage || 0),
    }));

    const flashcards = flashcardResults.map((result) => ({
      type: "flashcards",
      id: `flashcard-${result._id || result.id}`,
      date: result.createdAt,
      materialName:
        result.materialId?.originalName ||
        result.materialName ||
        "Study material",
      topic: result.topic || "",
      score: `${result.knownCards || 0}/${result.totalCards || 0} known`,
      percentage: Number(result.completionPercentage || 0),
    }));

    return [...quizzes, ...flashcards]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [quizResults, flashcardResults]);

  const continueMaterial = useMemo(() => {
    if (readyMaterials.length === 0) return null;

    const latest =
      [...recentActivity].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0];

    const latestId =
      latest?.type === "quiz"
        ? quizResults.find(
            (item) =>
              `quiz-${item._id || item.id}` === latest.id
          )?.materialId?._id
        : flashcardResults.find(
            (item) =>
              `flashcard-${item._id || item.id}` === latest.id
          )?.materialId?._id;

    return (
      readyMaterials.find((material) => material._id === latestId) ||
      readyMaterials[0]
    );
  }, [
    readyMaterials,
    recentActivity,
    quizResults,
    flashcardResults,
  ]);

  const formatDate = (date) => {
    if (!date) return "";

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";

    const diff = Date.now() - value.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return value.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0d0f]">
        <div className="text-xs tracking-[0.2em] text-zinc-600">
          LOADING DASHBOARD
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
              CHAOS AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Good to see you
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Pick up where you left off.
            </p>
          </div>

          <button
            onClick={loadResults}
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Library"
            value={materials.length}
            detail={
              processingMaterials.length > 0
                ? `${processingMaterials.length} processing`
                : `${readyMaterials.length} ready to study`
            }
          />

          <StatCard
            icon={Target}
            label="Quiz accuracy"
            value={`${overallAccuracy}%`}
            detail={`${quizResults.length} completed ${
              quizResults.length === 1 ? "quiz" : "quizzes"
            }`}
          />

          <StatCard
            icon={Layers}
            label="Flashcards studied"
            value={totalFlashcards}
            detail={`${totalKnownCards} marked as known`}
          />

          <StatCard
            icon={Trophy}
            label="Recall"
            value={`${flashcardRecall}%`}
            detail="Across completed flashcard sessions"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div className="mb-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
                CONTINUE STUDYING
              </p>
              <h2 className="mt-1 text-sm font-medium text-zinc-200">
                Your study space
              </h2>
            </div>

            {continueMaterial ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                        <BookOpen size={19} className="text-zinc-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {continueMaterial.originalName || "Study material"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {continueMaterial.pageCount
                            ? `${continueMaterial.pageCount} pages`
                            : "Study material"}{" "}
                          · Ready
                        </p>
                      </div>
                    </div>

                    <div className="hidden shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 text-[9px] uppercase tracking-wider text-zinc-500 sm:block">
                      Ready
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        onOpenWorkspace?.(continueMaterial._id)
                      }
                      className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200"
                    >
                      Continue studying
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={onOpenMCQs}
                      className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                    >
                      Practice MCQs
                    </button>

                    <button
                      onClick={onOpenFlashcards}
                      className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                    >
                      Study flashcards
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900">
                  <Upload size={18} className="text-zinc-500" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-zinc-300">
                  Your study space is empty
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-600">
                  Upload your first PDF or study material and start learning.
                </p>
                <button
                  onClick={onOpenWorkspace}
                  className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200"
                >
                  Upload material
                </button>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-3">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
                  RECENT ACTIVITY
                </p>
                <h2 className="mt-1 text-sm font-medium text-zinc-200">
                  What you've been doing
                </h2>
              </div>

              {recentActivity.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-zinc-800">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        index !== recentActivity.length - 1
                          ? "border-b border-zinc-800"
                          : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                        {activity.type === "quiz" ? (
                          <Brain size={15} className="text-zinc-500" />
                        ) : (
                          <Layers size={15} className="text-zinc-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-zinc-300">
                          {activity.type === "quiz"
                            ? "MCQ Quiz"
                            : "Flashcard Session"}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                          {activity.materialName}
                          {activity.topic ? ` · ${activity.topic}` : ""}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-zinc-300">
                          {activity.score}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-600">
                          {formatDate(activity.date)}
                        </p>
                      </div>

                      <div className="hidden w-12 shrink-0 text-right sm:block">
                        <span className="text-xs font-medium text-zinc-300">
                          {activity.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-7 text-center">
                  <Clock3 size={18} className="mx-auto text-zinc-600" />
                  <p className="mt-3 text-xs text-zinc-500">
                    No study activity yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
              QUICK ACTIONS
            </p>

            <div className="mt-3 space-y-2">
              <ActionButton
                icon={Brain}
                title="Ask from my notes"
                detail="Chat with your study material"
                onClick={onOpenWorkspace}
              />

              <ActionButton
                icon={Target}
                title="Generate MCQs"
                detail="Practice from your material"
                onClick={onOpenMCQs}
              />

              <ActionButton
                icon={Layers}
                title="Study flashcards"
                detail="Use active recall"
                onClick={onOpenFlashcards}
              />

              <ActionButton
                icon={FileText}
                title="Open my library"
                detail="Browse uploaded materials"
                onClick={onOpenLibrary}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900">
                  <Trophy size={16} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-300">
                    Study snapshot
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    Your current progress
                  </p>
                </div>
              </div>

              <ProgressRow label="Quiz accuracy" value={overallAccuracy} />
              <ProgressRow label="Flashcard recall" value={flashcardRecall} />
              <ProgressRow
                label="Materials ready"
                value={
                  materials.length > 0
                    ? Math.round(
                        (readyMaterials.length / materials.length) * 100
                      )
                    : 0
                }
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 p-3">
                <p className="text-[10px] leading-4 text-red-400">{error}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800">
          <Icon size={17} className="text-zinc-400" />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, title, detail, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900/60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
        <Icon size={17} className="text-zinc-400" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-zinc-300">{title}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{detail}</p>
      </div>
      <ArrowRight
        size={14}
        className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
      />
    </button>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">{label}</span>
        <span className="text-[10px] text-zinc-400">{value}%</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

export default Dashboard;