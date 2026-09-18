import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Flame,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

function StudyPlan({ materials = [], theme = "obsidian" }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [planTitle, setPlanTitle] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const readyMaterials = useMemo(
    () => materials.filter((item) => item.status === "ready"),
    [materials]
  );

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/study-plans",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load study plans."
        );
      }

      setPlans(data.plans || []);

      if (data.plans?.length > 0 && !expandedPlan) {
        setExpandedPlan(data.plans[0]._id);
      }
    } catch (err) {
      console.error("Study plans load error:", err);
      setError(
        err.message || "Failed to load study plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const toggleMaterial = (id) => {
    setSelectedMaterials((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const generatePlan = async (event) => {
    event.preventDefault();

    if (selectedMaterials.length === 0) {
      setError("Select at least one study material.");
      return;
    }

    if (!examDate) {
      setError("Choose your exam date.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/study-plans/generate",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialIds: selectedMaterials,
            examDate,
            dailyMinutes: Number(dailyMinutes),
            title: planTitle.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate study plan."
        );
      }

      setPlans((current) => [
        data.plan,
        ...current.filter(
          (plan) => plan._id !== data.plan._id
        ),
      ]);

      setExpandedPlan(data.plan._id);
      setShowCreator(false);
      setSelectedMaterials([]);
      setPlanTitle("");
      setExamDate("");
      setDailyMinutes(60);
    } catch (err) {
      console.error(
        "Study plan generation error:",
        err
      );

      setError(
        err.message ||
          "Failed to generate study plan."
      );
    } finally {
      setCreating(false);
    }
  };

  const updateTask = async (
    planId,
    taskId,
    completed
  ) => {
    setPlans((current) =>
      current.map((plan) => {
        if (plan._id !== planId) {
          return plan;
        }

        const tasks = plan.tasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                completed,
              }
            : task
        );

        const allComplete =
          tasks.length > 0 &&
          tasks.every(
            (task) => task.completed
          );

        return {
          ...plan,
          tasks,
          status: allComplete
            ? "completed"
            : "active",
        };
      })
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/study-plans/${planId}/tasks/${taskId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message ||
            "Failed to update task."
        );
      }
    } catch (err) {
      console.error(
        "Study task update error:",
        err
      );

      loadPlans();
    }
  };

  const deletePlan = async (planId) => {
    const confirmed = window.confirm(
      "Delete this study plan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/study-plans/${planId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete study plan."
        );
      }

      setPlans((current) =>
        current.filter(
          (plan) => plan._id !== planId
        )
      );

      if (expandedPlan === planId) {
        setExpandedPlan(null);
      }
    } catch (err) {
      console.error(
        "Delete study plan error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete study plan."
      );
    }
  };

  const planStats = (plan) => {
    const total =
      plan.tasks?.length || 0;

    const completed =
      plan.tasks?.filter(
        (task) => task.completed
      ).length || 0;

    const minutes =
      plan.tasks?.reduce(
        (sum, task) =>
          sum +
          Number(
            task.durationMinutes || 0
          ),
        0
      ) || 0;

    return {
      total,
      completed,
      minutes,
      progress: total
        ? Math.round(
            (completed / total) * 100
          )
        : 0,
    };
  };

  const groupedTasks = (plan) => {
    const groups = {};

    (plan.tasks || []).forEach(
      (task) => {
        if (!groups[task.date]) {
          groups[task.date] = [];
        }

        groups[task.date].push(task);
      }
    );

    return Object.entries(groups).sort(
      ([a], [b]) =>
        new Date(a) - new Date(b)
    );
  };

  const typeLabel = {
    study: "Study",
    revision: "Revision",
    mcq: "MCQ Practice",
    flashcards: "Flashcards",
  };

  const typeClass = {
    study:
      "border-zinc-800 bg-zinc-900 text-zinc-300",

    revision:
      "border-zinc-700 bg-zinc-800 text-zinc-200",

    mcq:
      "border-zinc-800 bg-zinc-950 text-zinc-400",

    flashcards:
      "border-zinc-800 bg-zinc-900 text-zinc-400",
  };

  const dateLabel = (value) => {
    const date = new Date(
      `${value}T12:00:00`
    );

    return date.toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="h-[calc(100vh-0px)] min-h-0 overflow-y-auto overscroll-contain">
      <div className="mx-auto min-h-full w-full max-w-6xl px-5 py-7 pb-16 sm:px-8 lg:px-10">

        <div className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-7 md:flex-row md:items-end">

          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
              <CalendarDays size={13} />
              STUDY PLAN
            </div>

            <h1 className="mt-2 text-2xl font-medium tracking-tight text-white">
              Study with a plan.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Give Chaos AI your exam date and
              study material. It will turn your
              material into a practical
              day-by-day schedule.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={loadPlans}
              className="flex h-10 items-center gap-2 rounded-xl border border-zinc-800 px-3 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={() => {
                setError("");
                setShowCreator(true);
              }}
              className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition hover:bg-zinc-200"
            >
              <Plus size={14} />
              New plan
            </button>

          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-xs text-red-300">

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              <X size={14} />
            </button>

          </div>
        )}

        {loading ? (

          <div className="flex min-h-[420px] items-center justify-center">

            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Loader2
                size={15}
                className="animate-spin"
              />
              Loading study plans
            </div>

          </div>

        ) : plans.length === 0 ? (

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-7">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                <Target
                  size={19}
                  className="text-zinc-400"
                />
              </div>

              <h2 className="mt-5 text-lg font-medium text-white">
                Build your first study plan
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                Select your notes, tell Chaos AI
                when the exam is, and set the
                amount of time you can
                realistically study each day.
              </p>

              <button
                onClick={() =>
                  setShowCreator(true)
                }
                className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black"
              >
                <Sparkles size={14} />
                Generate with AI
              </button>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-7">

              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
                WHAT IT CREATES
              </p>

              <div className="mt-5 space-y-4">

                {[
                  [
                    "Topics",
                    "Breaks your material into study sessions",
                  ],
                  [
                    "Revision",
                    "Leaves space for revisiting important topics",
                  ],
                  [
                    "Practice",
                    "Adds MCQ and flashcard sessions",
                  ],
                  [
                    "Progress",
                    "Tracks every completed task",
                  ],
                ].map(
                  ([label, text]) => (
                    <div
                      key={label}
                      className="flex gap-3"
                    >

                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />

                      <div>
                        <p className="text-xs text-zinc-300">
                          {label}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-zinc-600">
                          {text}
                        </p>
                      </div>

                    </div>
                  )
                )}

              </div>
            </div>

          </div>

        ) : (

          <div className="mt-7 space-y-5">

            {plans.map((plan) => {

              const stats =
                planStats(plan);

              const expanded =
                expandedPlan ===
                plan._id;

              return (
                <section
                  key={plan._id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20"
                >

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <button
                        onClick={() =>
                          setExpandedPlan(
                            expanded
                              ? null
                              : plan._id
                          )
                        }
                        className="min-w-0 text-left"
                      >

                        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] text-zinc-600">
                          <Flame size={13} />

                          {plan.status ===
                          "completed"
                            ? "COMPLETED"
                            : "ACTIVE PLAN"}
                        </div>

                        <h2 className="mt-2 truncate text-lg font-medium text-white">
                          {plan.title}
                        </h2>

                        <p className="mt-1 text-xs text-zinc-600">
                          Exam:{" "}
                          {new Date(
                            `${plan.examDate}T12:00:00`
                          ).toLocaleDateString(
                            undefined,
                            {
                              month:
                                "short",
                              day:
                                "numeric",
                              year:
                                "numeric",
                            }
                          )}
                        </p>

                      </button>

                      <div className="flex flex-wrap items-center gap-2">

                        <div className="rounded-xl border border-zinc-800 px-3 py-2">
                          <p className="text-[9px] tracking-[0.15em] text-zinc-600">
                            PROGRESS
                          </p>

                          <p className="mt-0.5 text-sm text-zinc-200">
                            {stats.progress}%
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 px-3 py-2">
                          <p className="text-[9px] tracking-[0.15em] text-zinc-600">
                            SESSIONS
                          </p>

                          <p className="mt-0.5 text-sm text-zinc-200">
                            {stats.completed}/
                            {stats.total}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 px-3 py-2">
                          <p className="text-[9px] tracking-[0.15em] text-zinc-600">
                            STUDY TIME
                          </p>

                          <p className="mt-0.5 text-sm text-zinc-200">
                            {Math.round(
                              stats.minutes /
                                60
                            )}
                            h
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            deletePlan(
                              plan._id
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-600 transition hover:border-red-900/60 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>

                        <button
                          onClick={() =>
                            setExpandedPlan(
                              expanded
                                ? null
                                : plan._id
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-200"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition ${
                              expanded
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                      </div>

                    </div>

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-white transition-all"
                        style={{
                          width: `${stats.progress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">

                      {(plan.materialIds ||
                        []).map(
                        (material) => (
                          <span
                            key={
                              material._id
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[10px] text-zinc-500"
                          >
                            <FileText
                              size={11}
                            />

                            {
                              material.originalName
                            }
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  {expanded && (
                    <div className="border-t border-zinc-800">

                      {groupedTasks(
                        plan
                      ).map(
                        ([date, tasks]) => (
                          <div
                            key={date}
                            className="border-b border-zinc-800 last:border-b-0"
                          >

                            <div className="flex items-center justify-between bg-zinc-950/40 px-5 py-3 sm:px-6">

                              <div>

                                <p className="text-xs font-medium text-zinc-300">
                                  {dateLabel(
                                    date
                                  )}
                                </p>

                                <p className="mt-0.5 text-[10px] text-zinc-600">
                                  Day{" "}
                                  {tasks[0]
                                    ?.day ||
                                    "—"}
                                </p>

                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                <Clock3
                                  size={12}
                                />

                                {tasks.reduce(
                                  (
                                    sum,
                                    task
                                  ) =>
                                    sum +
                                    Number(
                                      task.durationMinutes ||
                                        0
                                    ),
                                  0
                                )}{" "}
                                min
                              </div>

                            </div>

                            <div className="space-y-2 p-4 sm:p-5">

                              {tasks.map(
                                (task) => (
                                  <button
                                    key={
                                      task._id
                                    }
                                    onClick={() =>
                                      updateTask(
                                        plan._id,
                                        task._id,
                                        !task.completed
                                      )
                                    }
                                    className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                                      task.completed
                                        ? "border-zinc-800 bg-zinc-950/40"
                                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                                    }`}
                                  >

                                    <div
                                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                        task.completed
                                          ? "border-white bg-white text-black"
                                          : "border-zinc-700 bg-zinc-950 text-transparent"
                                      }`}
                                    >
                                      <Check
                                        size={12}
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                      <div className="flex flex-wrap items-center gap-2">

                                        <p
                                          className={`text-sm ${
                                            task.completed
                                              ? "text-zinc-600 line-through"
                                              : "text-zinc-200"
                                          }`}
                                        >
                                          {
                                            task.title
                                          }
                                        </p>

                                        <span
                                          className={`rounded-md border px-1.5 py-0.5 text-[9px] ${
                                            typeClass[
                                              task
                                                .type
                                            ] ||
                                            typeClass.study
                                          }`}
                                        >
                                          {
                                            typeLabel[
                                              task
                                                .type
                                            ]
                                          }
                                        </span>

                                      </div>

                                      {task.description && (
                                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                                          {
                                            task.description
                                          }
                                        </p>
                                      )}

                                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-600">
                                        <Clock3
                                          size={11}
                                        />

                                        {
                                          task.durationMinutes
                                        }{" "}
                                        minutes
                                      </div>

                                    </div>

                                  </button>
                                )
                              )}

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>
              );
            })}

          </div>
        )}

      </div>

      {showCreator && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCreator(false);
            }
          }}
        >

          <form
            onSubmit={generatePlan}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-[#101214] shadow-2xl sm:max-w-xl sm:rounded-2xl"
          >

            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
                  CHAOS AI
                </p>

                <h2 className="mt-1 text-base font-medium text-white">
                  Create study plan
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreator(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X size={16} />
              </button>

            </div>

            <div className="space-y-6 p-5 sm:p-6">

              <div>

                <label className="text-xs text-zinc-400">
                  Plan name
                </label>

                <input
                  value={planTitle}
                  onChange={(event) =>
                    setPlanTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. DBMS Midterm Plan"
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
                />

              </div>

              <div>

                <div className="flex items-center justify-between">

                  <label className="text-xs text-zinc-400">
                    Study material
                  </label>

                  <span className="text-[10px] text-zinc-600">
                    {
                      selectedMaterials.length
                    }{" "}
                    selected
                  </span>

                </div>

                {readyMaterials.length ===
                0 ? (

                  <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-600">
                    Upload and process a study
                    material first.
                  </div>

                ) : (

                  <div className="mt-2 max-h-44 space-y-2 overflow-y-auto">

                    {readyMaterials.map(
                      (material) => {

                        const active =
                          selectedMaterials.includes(
                            material._id
                          );

                        return (
                          <button
                            type="button"
                            key={
                              material._id
                            }
                            onClick={() =>
                              toggleMaterial(
                                material._id
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                              active
                                ? "border-zinc-600 bg-zinc-800/70"
                                : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                            }`}
                          >

                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                active
                                  ? "bg-white text-black"
                                  : "bg-zinc-900 text-zinc-600"
                              }`}
                            >
                              {active ? (
                                <Check
                                  size={14}
                                />
                              ) : (
                                <FileText
                                  size={14}
                                />
                              )}
                            </div>

                            <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">
                              {
                                material.originalName
                              }
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="text-xs text-zinc-400">
                    Exam date
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={examDate}
                    onChange={(event) =>
                      setExamDate(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                  />

                </div>

                <div>

                  <label className="text-xs text-zinc-400">
                    Daily study time
                  </label>

                  <select
                    value={dailyMinutes}
                    onChange={(event) =>
                      setDailyMinutes(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                  >

                    {[
                      30,
                      45,
                      60,
                      90,
                      120,
                      180,
                      240,
                    ].map(
                      (minutes) => (
                        <option
                          key={minutes}
                          value={minutes}
                        >
                          {minutes < 60
                            ? `${minutes} min`
                            : `${minutes / 60} ${
                                minutes / 60 ===
                                1
                                  ? "hour"
                                  : "hours"
                              }`}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                    <Sparkles
                      size={14}
                      className="text-zinc-400"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-zinc-300">
                      AI planning
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                      Chaos AI will retrieve
                      relevant content from the
                      selected material and
                      organize it into study,
                      revision, MCQ, and
                      flashcard sessions.
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="submit"
                disabled={
                  creating ||
                  readyMaterials.length ===
                    0
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {creating ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Building your plan
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate study plan
                  </>
                )}

              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}

export default StudyPlan;