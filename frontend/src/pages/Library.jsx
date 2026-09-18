import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Trash2,
  ArrowRight,
  FolderOpen,
  X,
} from "lucide-react";

function Library({
  materials = [],
  onOpenMaterial,
  onRefresh,
  onMaterialDeleted,
}) {
  const [search, setSearch] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [error, setError] =
    useState("");

  const filteredMaterials =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return materials;
      }

      return materials.filter(
        (material) =>
          material.originalName
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      materials,
      search,
    ]);

  const formatSize = (
    bytes
  ) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${Math.max(
        1,
        Math.round(bytes / 1024)
      )} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

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
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatus = (
    material
  ) => {
    if (
      material.status ===
      "ready"
    ) {
      return {
        label: "Ready",
        icon: CheckCircle2,
        className:
          "text-zinc-300",
      };
    }

    if (
      material.status ===
      "processing"
    ) {
      return {
        label: "Processing",
        icon: Clock3,
        className:
          "text-zinc-500",
      };
    }

    if (
      material.status ===
      "failed"
    ) {
      return {
        label: "Failed",
        icon: AlertCircle,
        className:
          "text-zinc-500",
      };
    }

    return {
      label:
        material.status ||
        "Unknown",
      icon: AlertCircle,
      className:
        "text-zinc-500",
    };
  };

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      const materialId =
        deleteTarget._id;

      try {
        setDeletingId(
          materialId
        );

        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/materials/${materialId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete material."
          );
        }

        setDeleteTarget(null);

        onMaterialDeleted?.(
          materialId
        );

        onRefresh?.();
      } catch (error) {
        console.error(
          "Delete material failed:",
          error
        );

        setError(
          error.message ||
            "Failed to delete material."
        );
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <div className="h-full min-h-0 overflow-y-auto">

      <div className="mx-auto w-full max-w-6xl p-6 lg:p-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
              CHAOS AI
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              My Library
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              All your study material in one place.
            </p>

          </div>

          <button
            onClick={onRefresh}
            className="flex w-fit items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
          >

            <RefreshCw
              size={14}
            />

            Refresh

          </button>

        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search your materials..."
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 pl-11 pr-4 text-xs text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
            />

            {search && (

              <button
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
              >
                <X size={13} />
              </button>

            )}

          </div>

          <div className="flex h-11 items-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 text-xs text-zinc-500">

            <FolderOpen
              size={14}
              className="mr-2"
            />

            {materials.length}{" "}
            {materials.length === 1
              ? "material"
              : "materials"}

          </div>

        </div>

        {error && (

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">

            <AlertCircle
              size={14}
              className="shrink-0 text-zinc-500"
            />

            <p className="text-xs text-zinc-500">
              {error}
            </p>

          </div>

        )}

        <div className="mt-7">

          {materials.length ===
          0 ? (

            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">

                <FolderOpen
                  size={22}
                  className="text-zinc-600"
                />

              </div>

              <h2 className="mt-5 text-sm font-medium text-zinc-300">
                Your library is empty
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                Upload a PDF or image from the Study Workspace to start building your library.
              </p>

              <button
                onClick={() =>
                  onOpenMaterial?.(
                    null
                  )
                }
                className="mt-5 flex mx-auto items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200"
              >
                Open Study Workspace
                <ArrowRight
                  size={14}
                />
              </button>

            </div>

          ) : filteredMaterials.length ===
            0 ? (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 px-6 py-14 text-center">

              <Search
                size={20}
                className="mx-auto text-zinc-600"
              />

              <p className="mt-4 text-sm text-zinc-400">
                No materials found
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Try a different search term.
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {filteredMaterials.map(
                (material) => {

                  const status =
                    getStatus(
                      material
                    );

                  const StatusIcon =
                    status.icon;

                  const isDeleting =
                    deletingId ===
                    material._id;

                  return (

                    <div
                      key={
                        material._id
                      }
                      className="group rounded-2xl border border-zinc-800 bg-zinc-900/20 transition hover:border-zinc-700 hover:bg-zinc-900/40"
                    >

                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">

                        <div className="flex min-w-0 flex-1 items-center gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900">

                            <FileText
                              size={19}
                              className="text-zinc-400"
                            />

                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-medium text-zinc-200">
                              {material.originalName ||
                                "Untitled material"}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-600">

                              <span>
                                {formatSize(
                                  material.size
                                )}
                              </span>

                              <span>
                                ·
                              </span>

                              <span>
                                {formatDate(
                                  material.createdAt
                                )}
                              </span>

                              {material.pageCount && (
                                <>
                                  <span>
                                    ·
                                  </span>

                                  <span>
                                    {material.pageCount}{" "}
                                    pages
                                  </span>
                                </>
                              )}

                            </div>

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">

                          <div
                            className={`flex items-center gap-1.5 text-[10px] ${status.className}`}
                          >

                            <StatusIcon
                              size={13}
                            />

                            {status.label}

                          </div>

                          <div className="flex items-center gap-1">

                            {material.status ===
                              "ready" && (

                              <button
                                onClick={() =>
                                  onOpenMaterial?.(
                                    material._id
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                              >
                                Open
                                <ArrowRight
                                  size={12}
                                />
                              </button>

                            )}

                            <button
                              onClick={() =>
                                setDeleteTarget(
                                  material
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-40"
                              title="Delete material"
                            >

                              <Trash2
                                size={14}
                              />

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

      {deleteTarget && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteTarget(
                null
              );
            }
          }}
        >

          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#101214] p-6 shadow-2xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900">

              <Trash2
                size={18}
                className="text-zinc-400"
              />

            </div>

            <h2 className="mt-5 text-base font-medium text-white">
              Delete material?
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              This will remove the material from your library and delete its stored file.
            </p>

            <p className="mt-3 truncate rounded-lg bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
              {deleteTarget.originalName}
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  deletingId !==
                  null
                }
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmDelete
                }
                disabled={
                  deletingId !==
                  null
                }
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {deletingId
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Library;