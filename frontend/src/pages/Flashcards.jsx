import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Loader2,
  Rotate3D,
  X,
} from "lucide-react";

import API_URL from "../config";

function Flashcards({
  materials = [],
  theme = "obsidian",
}) {
  const [selectedMaterial, setSelectedMaterial] =
    useState("");

  const [numberOfCards, setNumberOfCards] =
    useState(10);

  const [topic, setTopic] =
    useState("");

  const [cards, setCards] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [flipped, setFlipped] =
    useState(false);

  const [knownCards, setKnownCards] =
    useState([]);

  const [reviewCards, setReviewCards] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [savingResult, setSavingResult] =
    useState(false);

  const [resultSaved, setResultSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [started, setStarted] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [lastSourceCount, setLastSourceCount] =
    useState(0);

  const readyMaterials =
    useMemo(
      () =>
        materials.filter(
          (material) =>
            material.status ===
            "ready"
        ),
      [materials]
    );

  useEffect(() => {
    if (
      selectedMaterial &&
      readyMaterials.some(
        (material) =>
          material._id ===
          selectedMaterial
      )
    ) {
      return;
    }

    if (
      readyMaterials.length > 0
    ) {
      setSelectedMaterial(
        readyMaterials[0]._id
      );
    }
  }, [
    readyMaterials,
    selectedMaterial,
  ]);

  const currentCard =
    cards[currentIndex];

  const progress =
    cards.length > 0
      ? ((currentIndex + 1) /
          cards.length) *
        100
      : 0;

  const knownCount =
    knownCards.length;

  const reviewCount =
    reviewCards.length;

  const resetDeck = () => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setStarted(false);
    setCompleted(false);
    setSavingResult(false);
    setResultSaved(false);
    setError("");
    setLastSourceCount(0);
  };

  const generateFlashcards =
    async () => {
      if (!selectedMaterial) {
        setError(
          "Select a study material first."
        );
        return;
      }

      setLoading(true);
      setError("");
      setCards([]);
      setCurrentIndex(0);
      setFlipped(false);
      setKnownCards([]);
      setReviewCards([]);
      setStarted(false);
      setCompleted(false);
      setSavingResult(false);
      setResultSaved(false);

      try {
        const response =
          await fetch(
            `${API_URL}/api/chat/flashcards`,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                materialId:
                  selectedMaterial,

                numberOfCards:
                  Number(
                    numberOfCards
                  ),

                topic:
                  topic.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to generate flashcards."
          );
        }

        const generated =
          Array.isArray(
            data.flashcards
          )
            ? data.flashcards
            : [];

        if (
          generated.length === 0
        ) {
          throw new Error(
            "No flashcards were generated from this material."
          );
        }

        setCards(
          generated
        );

        setLastSourceCount(
          Array.isArray(
            data.sources
          )
            ? data.sources.length
            : 0
        );

        setStarted(true);
        setCurrentIndex(0);
        setFlipped(false);

      } catch (err) {
        console.error(
          "Flashcard generation failed:",
          err
        );

        setError(
          err.message ||
            "Failed to generate flashcards."
        );
      } finally {
        setLoading(false);
      }
    };

  const saveFlashcardResult =
    async (
      finalKnownCards,
      finalReviewCards
    ) => {
      if (
        resultSaved ||
        savingResult ||
        cards.length === 0
      ) {
        return true;
      }

      setSavingResult(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/flashcard-results`,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                materialId:
                  selectedMaterial,

                topic:
                  topic.trim(),

                totalCards:
                  cards.length,

                knownCards:
                  finalKnownCards.length,

                reviewCards:
                  finalReviewCards.length,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save flashcard result."
          );
        }

        setResultSaved(true);

        return true;

      } catch (err) {
        console.error(
          "Saving flashcard result failed:",
          err
        );

        setError(
          err.message ||
            "Failed to save your flashcard result."
        );

        return false;

      } finally {
        setSavingResult(false);
      }
    };

  const finishDeck =
    async (
      finalKnownCards,
      finalReviewCards
    ) => {
      const saved =
        await saveFlashcardResult(
          finalKnownCards,
          finalReviewCards
        );

      if (saved) {
        setCompleted(true);
        setFlipped(false);
      }
    };

  const goNext =
    () => {
      if (
        currentIndex <
        cards.length - 1
      ) {
        setCurrentIndex(
          (index) =>
            index + 1
        );

        setFlipped(false);

        return;
      }

      finishDeck(
        knownCards,
        reviewCards
      );
    };

  const goPrevious =
    () => {
      if (
        currentIndex > 0
      ) {
        setCurrentIndex(
          (index) =>
            index - 1
        );

        setFlipped(false);
      }
    };

  const markKnown =
    () => {
      const id =
        currentIndex;

      const nextKnown =
        knownCards.includes(id)
          ? knownCards
          : [
              ...knownCards,
              id,
            ];

      const nextReview =
        reviewCards.filter(
          (item) =>
            item !== id
        );

      setKnownCards(
        nextKnown
      );

      setReviewCards(
        nextReview
      );

      if (
        currentIndex ===
        cards.length - 1
      ) {
        finishDeck(
          nextKnown,
          nextReview
        );

        return;
      }

      setCurrentIndex(
        (index) =>
          index + 1
      );

      setFlipped(false);
    };

  const markReview =
    () => {
      const id =
        currentIndex;

      const nextReview =
        reviewCards.includes(id)
          ? reviewCards
          : [
              ...reviewCards,
              id,
            ];

      const nextKnown =
        knownCards.filter(
          (item) =>
            item !== id
        );

      setReviewCards(
        nextReview
      );

      setKnownCards(
        nextKnown
      );

      if (
        currentIndex ===
        cards.length - 1
      ) {
        finishDeck(
          nextKnown,
          nextReview
        );

        return;
      }

      setCurrentIndex(
        (index) =>
          index + 1
      );

      setFlipped(false);
    };

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          !started ||
          completed ||
          loading ||
          savingResult ||
          cards.length === 0
        ) {
          return;
        }

        if (
          event.code ===
          "Space"
        ) {
          event.preventDefault();

          setFlipped(
            (value) =>
              !value
          );
        }

        if (
          event.key ===
          "ArrowRight"
        ) {
          goNext();
        }

        if (
          event.key ===
          "ArrowLeft"
        ) {
          goPrevious();
        }

        if (
          event.key ===
          "1"
        ) {
          markReview();
        }

        if (
          event.key ===
          "2"
        ) {
          markKnown();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    started,
    completed,
    loading,
    savingResult,
    cards.length,
    currentIndex,
    flipped,
    knownCards,
    reviewCards,
  ]);

  const selectedMaterialObject =
    readyMaterials.find(
      (material) =>
        material._id ===
        selectedMaterial
    );

  if (
    !started &&
    !loading
  ) {
    return (
      <div className="h-full overflow-y-auto">

        <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-9">

          <div className="flex items-start justify-between gap-6">

            <div>

              <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
                PRACTICE
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Flashcards
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Turn your study material into
                active-recall cards.
              </p>

            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 sm:flex">

              <Layers
                size={19}
                className="text-zinc-400"
              />

            </div>

          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_280px]">

            <div className="rounded-2xl border border-zinc-800 bg-[#101214] p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900">

                  <BookOpen
                    size={16}
                    className="text-zinc-400"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-zinc-300">
                    Study material
                  </p>

                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    Choose what Chaos AI should
                    use for your cards
                  </p>

                </div>

              </div>

              <div className="mt-5">

                <select
                  value={
                    selectedMaterial
                  }
                  onChange={(event) =>
                    setSelectedMaterial(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-sm text-zinc-300 outline-none transition focus:border-zinc-600"
                >

                  <option value="">
                    Select material
                  </option>

                  {readyMaterials.map(
                    (material) => (
                      <option
                        key={
                          material._id
                        }
                        value={
                          material._id
                        }
                      >
                        {
                          material.originalName
                        }
                      </option>
                    )
                  )}

                </select>

                {readyMaterials.length ===
                  0 && (

                  <p className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-5 text-zinc-600">
                    Upload and process a
                    study material before
                    generating flashcards.
                  </p>

                )}

              </div>

              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-xs font-medium text-zinc-300">
                    Number of cards
                  </p>

                  <span className="text-xs text-zinc-600">
                    {numberOfCards}
                  </span>

                </div>

                <div className="grid grid-cols-4 gap-2">

                  {[5, 10, 15, 20].map(
                    (count) => {

                      const active =
                        numberOfCards ===
                        count;

                      return (
                        <button
                          key={
                            count
                          }
                          onClick={() =>
                            setNumberOfCards(
                              count
                            )
                          }
                          className={`rounded-xl border py-2.5 text-xs transition ${
                            active
                              ? "border-zinc-500 bg-zinc-800 text-white"
                              : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                          }`}
                        >
                          {count}
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              <div className="mt-6">

                <label className="text-xs font-medium text-zinc-300">
                  Topic
                  <span className="ml-2 text-zinc-700">
                    optional
                  </span>
                </label>

                <input
                  value={topic}
                  onChange={(event) =>
                    setTopic(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Vedas, operating systems, inheritance..."
                  className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-sm text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
                />

              </div>

              {error && (

                <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs leading-5 text-red-400">
                  {error}
                </div>

              )}

              <button
                onClick={
                  generateFlashcards
                }
                disabled={
                  loading ||
                  !selectedMaterial
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Building your deck...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={16}
                    />
                    Generate flashcards
                  </>
                )}

              </button>

            </div>

            <div className="space-y-3">

              <div className="rounded-2xl border border-zinc-800 bg-[#101214] p-5">

                <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
                  HOW IT WORKS
                </p>

                <div className="mt-5 space-y-5">

                  <div className="flex gap-3">
                    <span className="text-xs text-zinc-700">
                      01
                    </span>
                    <p className="text-xs leading-5 text-zinc-500">
                      Choose a processed
                      study material.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xs text-zinc-700">
                      02
                    </span>
                    <p className="text-xs leading-5 text-zinc-500">
                      Chaos AI retrieves
                      relevant material.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xs text-zinc-700">
                      03
                    </span>
                    <p className="text-xs leading-5 text-zinc-500">
                      AI converts it into
                      active-recall cards.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-xs text-zinc-700">
                      04
                    </span>
                    <p className="text-xs leading-5 text-zinc-500">
                      Flip, recall, and mark
                      what needs review.
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">

                <div className="flex items-center gap-2">

                  <Rotate3D
                    size={15}
                    className="text-zinc-500"
                  />

                  <p className="text-xs text-zinc-400">
                    Keyboard controls
                  </p>

                </div>

                <div className="mt-4 space-y-2 text-[10px] text-zinc-600">

                  <p>
                    <span className="text-zinc-400">
                      Space
                    </span>{" "}
                    flip card
                  </p>

                  <p>
                    <span className="text-zinc-400">
                      ← →
                    </span>{" "}
                    navigate
                  </p>

                  <p>
                    <span className="text-zinc-400">
                      1
                    </span>{" "}
                    review
                  </p>

                  <p>
                    <span className="text-zinc-400">
                      2
                    </span>{" "}
                    know
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
      <div className="flex h-full items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">

            <Loader2
              size={20}
              className="animate-spin text-zinc-400"
            />

          </div>

          <p className="mt-5 text-sm text-zinc-300">
            Building your flashcards
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Reading your study material...
          </p>

        </div>

      </div>
    );
  }

  if (
    savingResult
  ) {
    return (
      <div className="flex h-full items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">

            <Loader2
              size={20}
              className="animate-spin text-zinc-400"
            />

          </div>

          <p className="mt-5 text-sm text-zinc-300">
            Saving your study session
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Your progress is being recorded...
          </p>

        </div>

      </div>
    );
  }

  if (
    completed
  ) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto p-5">

        <div className="w-full max-w-lg">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">

              <Check
                size={23}
              />

            </div>

            <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
              DECK COMPLETE
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Nice work.
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              You went through all{" "}
              {cards.length} cards.
            </p>

          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-zinc-800 bg-[#101214] p-5">

              <p className="text-[10px] tracking-[0.15em] text-zinc-600">
                KNEW
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {knownCount}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                cards
              </p>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#101214] p-5">

              <p className="text-[10px] tracking-[0.15em] text-zinc-600">
                REVIEW
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {reviewCount}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                cards
              </p>

            </div>

          </div>

          <div className="mt-3 rounded-2xl border border-zinc-800 bg-[#101214] p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-zinc-300">
                  {selectedMaterialObject?.originalName ||
                    "Study material"}
                </p>

                <p className="mt-1 text-[10px] text-zinc-600">
                  {lastSourceCount} source
                  {lastSourceCount === 1
                    ? ""
                    : "s"} retrieved
                </p>

              </div>

              <Layers
                size={18}
                className="text-zinc-600"
              />

            </div>

          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-center">

            <p className="text-[10px] text-zinc-600">
              Session saved to your study history
            </p>

          </div>

          <div className="mt-5 flex gap-2">

            <button
              onClick={() => {
                setCurrentIndex(0);
                setFlipped(false);
                setCompleted(false);
                setKnownCards([]);
                setReviewCards([]);
                setResultSaved(false);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >

              <RotateCcw
                size={15}
              />

              Review again

            </button>

            <button
              onClick={
                resetDeck
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >

              <Sparkles
                size={15}
              />

              New deck

            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">

      <div className="shrink-0 border-b border-zinc-800 px-5 py-4 sm:px-8">

        <div className="mx-auto max-w-5xl">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0">

              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
                FLASHCARDS
              </p>

              <p className="mt-1 truncate text-sm font-medium text-zinc-300">
                {selectedMaterialObject?.originalName ||
                  "Study material"}
              </p>

            </div>

            <button
              onClick={
                resetDeck
              }
              className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
            >

              <X
                size={14}
              />

              Exit

            </button>

          </div>

          <div className="mt-4">

            <div className="flex items-center justify-between text-[10px] text-zinc-600">

              <span>
                Card{" "}
                {currentIndex +
                  1}{" "}
                of{" "}
                {cards.length}
              </span>

              <span>
                {Math.round(
                  progress
                )}
                %
              </span>

            </div>

            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-900">

              <div
                className="h-full rounded-full bg-zinc-500 transition-all duration-300"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">

        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-5 py-8 sm:px-8">

          <div
            className="group mx-auto w-full max-w-2xl cursor-pointer [perspective:1200px]"
            onClick={() =>
              setFlipped(
                (value) =>
                  !value
              )
            }
          >

            <div
              className={`relative min-h-[340px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                flipped
                  ? "[transform:rotateY(180deg)]"
                  : ""
              }`}
            >

              <div className="absolute inset-0 flex min-h-[340px] flex-col rounded-3xl border border-zinc-800 bg-[#111315] p-7 shadow-2xl [backface-visibility:hidden] sm:p-10">

                <div className="flex items-center justify-between">

                  <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-zinc-600">
                    {currentCard?.type ||
                      "concept"}
                  </span>

                  <span className="text-[10px] text-zinc-700">
                    FRONT
                  </span>

                </div>

                <div className="flex flex-1 items-center justify-center py-10">

                  <h2 className="max-w-xl text-center text-2xl font-medium leading-[1.35] tracking-tight text-white sm:text-3xl">
                    {currentCard?.front}
                  </h2>

                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-700">

                  <Rotate3D
                    size={13}
                  />

                  Click to reveal

                </div>

              </div>

              <div className="absolute inset-0 flex min-h-[340px] flex-col rounded-3xl border border-zinc-700 bg-zinc-100 p-7 text-zinc-900 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10">

                <div className="flex items-center justify-between">

                  <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-zinc-500">
                    ANSWER
                  </span>

                  <span className="text-[10px] text-zinc-400">
                    BACK
                  </span>

                </div>

                <div className="flex flex-1 items-center justify-center py-8">

                  <p className="max-w-xl text-center text-base leading-7 text-zinc-700 sm:text-lg">
                    {currentCard?.back}
                  </p>

                </div>

                <div className="text-center text-[10px] text-zinc-400">
                  Based on your study material
                </div>

              </div>

            </div>

          </div>

          <div className="mx-auto mt-6 flex w-full max-w-2xl items-center justify-between">

            <button
              onClick={
                goPrevious
              }
              disabled={
                currentIndex ===
                0
              }
              className="flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
            >

              <ArrowLeft
                size={15}
              />

              Previous

            </button>

            <span className="text-[10px] text-zinc-700">
              Space to flip
            </span>

            <button
              onClick={
                goNext
              }
              disabled={
                savingResult
              }
              className="flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-30"
            >

              Next

              <ArrowRight
                size={15}
              />

            </button>

          </div>

          <div className="mx-auto mt-4 grid w-full max-w-2xl grid-cols-2 gap-2">

            <button
              onClick={
                markReview
              }
              disabled={
                savingResult
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-30"
            >

              <RotateCcw
                size={14}
              />

              Review

              <span className="hidden text-[9px] text-zinc-700 sm:inline">
                1
              </span>

            </button>

            <button
              onClick={
                markKnown
              }
              disabled={
                savingResult
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >

              <Check
                size={14}
              />

              I know this

              <span className="hidden text-[9px] text-zinc-500 sm:inline">
                2
              </span>

            </button>

          </div>

          <div className="mx-auto mt-4 flex max-w-2xl justify-center gap-5 text-[10px] text-zinc-700">

            <span>
              {knownCount} known
            </span>

            <span>
              {reviewCount} to review
            </span>

          </div>

          {error && (

            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-center text-xs text-red-400">
              {error}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Flashcards;