import React, {
  useEffect,
  useState,
} from "react";

import API_URL from "../config";

import Sidebar from "../components/Sidebar";
import UploadPanel from "../components/UploadPanel";
import ChatArea from "../components/ChatArea";
import SourcePanel from "../components/SourcePanel";

import Dashboard from "./Dashboard";
import MCQs from "./MCQs";
import Analytics from "./Analytics";
import Library from "./Library";
import Flashcards from "./Flashcards";
import StudyPlan from "./StudyPlan";

import {
  X,
  User,
  Palette,
  Bell,
  BookOpen,
  Check,
  Construction,
} from "lucide-react";

function Workspace({ user }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [sources, setSources] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("chaos-theme") || "obsidian";
  });

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("chaos-notifications") !== "false";
  });

  const [studyMode, setStudyMode] = useState(() => {
    return localStorage.getItem("chaos-study-mode") || "Focused";
  });

  const themes = [
    {
      id: "obsidian",
      name: "Obsidian",
      description: "The original Chaos AI dark theme",
      preview: "#0b0d0f",
      border: "#27292d",
    },
    {
      id: "midnight",
      name: "Midnight",
      description: "Deep blue-black with cooler tones",
      preview: "#080b12",
      border: "#263040",
    },
    {
      id: "forest",
      name: "Forest",
      description: "Dark charcoal with subtle green",
      preview: "#09100d",
      border: "#293b31",
    },
    {
      id: "paper",
      name: "Paper",
      description: "Clean light interface",
      preview: "#f5f5f2",
      border: "#d8d8d2",
    },
  ];

  const loadMaterials = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/materials`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load materials."
        );
      }

      const loadedMaterials = data.materials || [];

      setMaterials(loadedMaterials);

      if (
        loadedMaterials.length > 0 &&
        !selectedMaterialId
      ) {
        const readyMaterial = loadedMaterials.find(
          (material) => material.status === "ready"
        );

        if (readyMaterial) {
          setSelectedMaterialId(readyMaterial._id);
        }
      }

      if (
        selectedMaterialId &&
        !loadedMaterials.some(
          (material) => material._id === selectedMaterialId
        )
      ) {
        setSelectedMaterialId(null);
        setSources([]);

        if (activePage === "Study Workspace") {
          setActivePage("My Library");
        }
      }
    } catch (error) {
      console.error(
        "Loading materials failed:",
        error
      );
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const hasProcessingMaterials = materials.some(
      (material) => material.status === "processing"
    );

    if (!hasProcessingMaterials) {
      return;
    }

    const interval = setInterval(() => {
      loadMaterials();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [materials]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [settingsOpen]);

  useEffect(() => {
    localStorage.setItem(
      "chaos-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "chaos-notifications",
      notifications
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "chaos-study-mode",
      studyMode
    );
  }, [studyMode]);

  const handleMaterialUploaded = (material) => {
    setMaterials((prev) => [
      material,
      ...prev.filter(
        (item) => item._id !== material._id
      ),
    ]);

    loadMaterials();
  };

  const handleSelectMaterial = (materialId) => {
    setSelectedMaterialId(materialId);
    setSources([]);
  };

  const openWorkspace = (materialId = null) => {
    if (materialId) {
      setSelectedMaterialId(materialId);
    }

    setActivePage("Study Workspace");
  };

  const handlePageChange = (page) => {
    if (page === "Settings") {
      setSettingsOpen(true);
      return;
    }

    setActivePage(page);
  };

  const handleMaterialDeleted = (materialId) => {
    setMaterials((prev) =>
      prev.filter(
        (material) => material._id !== materialId
      )
    );

    if (selectedMaterialId === materialId) {
      setSelectedMaterialId(null);
      setSources([]);
    }

    loadMaterials();
  };

  const handleLibraryRefresh = () => {
    loadMaterials();
  };

  const renderStudyWorkspace = () => {
    return (
      <div className="grid h-full min-h-0 lg:grid-cols-[260px_minmax(0,1fr)_270px]">
        <section className="min-h-0 overflow-y-auto border-b border-zinc-800 p-5 lg:border-b-0 lg:border-r">
          <UploadPanel
            materials={materials}
            selectedMaterialId={selectedMaterialId}
            onSelectMaterial={handleSelectMaterial}
            onMaterialUploaded={handleMaterialUploaded}
            onRefreshMaterials={loadMaterials}
          />
        </section>

        <section className="min-h-0 overflow-hidden">
          <ChatArea
            selectedMaterialId={selectedMaterialId}
            materials={materials}
            setSources={setSources}
          />
        </section>

        <section className="min-h-0 overflow-y-auto border-t border-zinc-800 p-5 lg:border-l lg:border-t-0">
          <SourcePanel sources={sources} />
        </section>
      </div>
    );
  };

  const renderPlaceholder = (title, description) => {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
            <Construction
              size={22}
              className="text-zinc-500"
            />
          </div>

          <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
            CHAOS AI
          </p>

          <h1 className="mt-2 text-xl font-medium text-white">
            {title}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (activePage === "Dashboard") {
      return (
        <Dashboard
          user={user}
          materials={materials}
          onOpenWorkspace={openWorkspace}
          onOpenMCQs={() => setActivePage("MCQs")}
          onOpenLibrary={() => setActivePage("My Library")}
          onOpenFlashcards={() => setActivePage("Flashcards")}
        />
      );
    }

    if (activePage === "Study Workspace") {
      return renderStudyWorkspace();
    }

    if (activePage === "MCQs") {
      return (
        <MCQs
          materials={materials}
          theme={theme}
        />
      );
    }

    if (activePage === "Analytics") {
      return <Analytics theme={theme} />;
    }

    if (activePage === "My Library") {
      return (
        <Library
          materials={materials}
          onOpenMaterial={openWorkspace}
          onRefresh={handleLibraryRefresh}
          onMaterialDeleted={handleMaterialDeleted}
        />
      );
    }

    if (activePage === "Flashcards") {
      return (
        <Flashcards
          materials={materials}
          theme={theme}
        />
      );
    }

    if (activePage === "Study Plan") {
      return (
        <StudyPlan
          materials={materials}
          theme={theme}
        />
      );
    }

    return renderStudyWorkspace();
  };

  return (
    <div
      className="chaos-theme h-screen overflow-hidden bg-[#0b0d0f] text-white"
      data-theme={theme}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        user={user}
      />

      <main className="h-screen min-h-0 overflow-hidden md:ml-64">
        {renderPage()}
      </main>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsOpen(false);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-[#101214] shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
                  CHAOS AI
                </p>

                <h2 className="mt-1 text-base font-medium text-white">
                  Settings
                </h2>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto">
              <div className="border-b border-zinc-800 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <User
                    size={15}
                    className="text-zinc-500"
                  />

                  <span className="text-xs font-medium text-zinc-300">
                    Account
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm">
                      {user?.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {user?.name}
                    </p>

                    <p className="truncate text-xs text-zinc-600">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-zinc-800 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Palette
                    size={15}
                    className="text-zinc-500"
                  />

                  <span className="text-xs font-medium text-zinc-300">
                    Appearance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {themes.map((item) => {
                    const active = theme === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setTheme(item.id)}
                        className={`group rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-zinc-500"
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className="mb-3 h-12 rounded-lg border"
                          style={{
                            backgroundColor: item.preview,
                            borderColor: item.border,
                          }}
                        >
                          <div className="flex h-full items-end gap-1 p-2">
                            <span
                              className="h-1.5 w-5 rounded-full"
                              style={{
                                backgroundColor: item.border,
                              }}
                            />

                            <span
                              className="h-1.5 w-8 rounded-full"
                              style={{
                                backgroundColor: item.border,
                              }}
                            />

                            <span
                              className="h-1.5 w-3 rounded-full"
                              style={{
                                backgroundColor: item.border,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-zinc-300">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-[9px] leading-4 text-zinc-600">
                              {item.description}
                            </p>
                          </div>

                          {active && (
                            <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                              <Check size={11} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-b border-zinc-800 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Bell
                    size={15}
                    className="text-zinc-500"
                  />

                  <span className="text-xs font-medium text-zinc-300">
                    Notifications
                  </span>
                </div>

                <button
                  onClick={() =>
                    setNotifications((value) => !value)
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-left transition hover:border-zinc-700"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                    <Bell
                      size={15}
                      className="text-zinc-400"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-zinc-300">
                      Study reminders
                    </p>

                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      Allow Chaos AI to show study notifications
                    </p>
                  </div>

                  <div
                    className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
                      notifications
                        ? "justify-end bg-white"
                        : "justify-start bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full ${
                        notifications
                          ? "bg-black"
                          : "bg-zinc-400"
                      }`}
                    />
                  </div>
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen
                    size={15}
                    className="text-zinc-500"
                  />

                  <span className="text-xs font-medium text-zinc-300">
                    Study Preferences
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    "Focused",
                    "Balanced",
                    "Detailed",
                  ].map((mode) => {
                    const active = studyMode === mode;

                    return (
                      <button
                        key={mode}
                        onClick={() => setStudyMode(mode)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-zinc-600 bg-zinc-800/80"
                            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-xs text-zinc-300">
                            {mode}
                          </p>

                          <p className="mt-0.5 text-[10px] text-zinc-600">
                            {mode === "Focused" &&
                              "Short, direct explanations"}

                            {mode === "Balanced" &&
                              "Clear explanations with useful detail"}

                            {mode === "Detailed" &&
                              "More thorough explanations and examples"}
                          </p>
                        </div>

                        {active && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                            <Check size={13} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-zinc-800 px-5 py-3 sm:px-6">
              <p className="text-center text-[10px] text-zinc-700">
                Chaos AI · Study with your material
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspace;
