import React, {
  useRef,
  useState,
} from "react";

import {
  FileText,
  Image,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Circle,
  Check,
  Copy,
} from "lucide-react";

import API_URL from "../config";

function UploadPanel({
  materials = [],
  selectedMaterialId,
  onSelectMaterial,
  onMaterialUploaded,
  onRefreshMaterials,
}) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (selectedFiles) => {
    const selected = Array.from(selectedFiles);

    if (!selected.length) {
      return;
    }

    setUploading(true);

    for (const file of selected) {
      const temporaryId =
        `${file.name}-${Date.now()}-${Math.random()}`;

      setFiles((prev) => [
        ...prev,
        {
          file,
          id: temporaryId,
          status: "uploading",
        },
      ]);

      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
          `${API_URL}/api/materials/upload`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Upload failed."
          );
        }

        if (data.duplicate) {
          setFiles((prev) =>
            prev.map((item) =>
              item.id === temporaryId
                ? {
                    ...item,
                    status: "duplicate",
                    material: data.material,
                    message:
                      data.message ||
                      "This exact file has already been uploaded.",
                  }
                : item
            )
          );

          if (data.material) {
            onMaterialUploaded?.({
              _id: data.material.id,
              id: data.material.id,
              originalName: data.material.name,
              name: data.material.name,
              size: data.material.size,
              contentType:
                data.material.contentType,
              status: data.material.status,
            });
          }

          setTimeout(() => {
            setFiles((prev) =>
              prev.filter(
                (item) =>
                  item.id !== temporaryId
              )
            );
          }, 5000);

          continue;
        }

        setFiles((prev) =>
          prev.map((item) =>
            item.id === temporaryId
              ? {
                  ...item,
                  status: "uploaded",
                  material: data.material,
                }
              : item
          )
        );

        if (data.material) {
          onMaterialUploaded?.({
            _id: data.material.id,
            id: data.material.id,
            originalName: data.material.name,
            name: data.material.name,
            size: data.material.size,
            contentType:
              data.material.contentType,
            status: data.material.status,
          });
        }

        setTimeout(() => {
          onRefreshMaterials?.();
        }, 1500);
      } catch (error) {
        console.error(
          "Upload error:",
          error
        );

        setFiles((prev) =>
          prev.map((item) =>
            item.id === temporaryId
              ? {
                  ...item,
                  status: "failed",
                  message:
                    error.message ||
                    "Upload failed.",
                }
              : item
          )
        );
      }
    }

    setUploading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (id) => {
    setFiles((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  };

  const getMaterialId = (material) => {
    return String(
      material._id ||
        material.id ||
        ""
    );
  };

  const getMaterialName = (material) => {
    return (
      material.originalName ||
      material.name ||
      "Untitled material"
    );
  };

  const formatSize = (size) => {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getFileIcon = (material) => {
    const type =
      material.contentType || "";

    if (type.startsWith("image/")) {
      return Image;
    }

    return FileText;
  };

  const readyMaterials =
    materials.filter(
      (material) =>
        material.status === "ready"
    );

  const processingMaterials =
    materials.filter(
      (material) =>
        material.status ===
        "processing"
    );

  const failedMaterials =
    materials.filter(
      (material) =>
        material.status === "failed"
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
          MATERIALS
        </p>

        <h2 className="mt-3 text-lg font-semibold text-white">
          Study material
        </h2>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Add the material you want Chaos AI to understand.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(event) =>
          handleFiles(
            event.target.files
          )
        }
      />

      <button
        type="button"
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={uploading}
        className="mt-5 flex w-full flex-col items-start rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-5 text-left transition hover:border-zinc-500 hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
          <Upload size={18} />
        </div>

        <p className="mt-4 text-sm font-medium text-zinc-200">
          Add material
        </p>

        <p className="mt-1 text-[11px] text-zinc-600">
          PDF, PNG or JPG · Max 50 MB
        </p>
      </button>

      {materials.length > 0 && (
        <div className="mt-7 min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
              YOUR MATERIALS
            </p>

            <span className="text-[10px] text-zinc-600">
              {readyMaterials.length} ready
            </span>
          </div>

          <div className="space-y-2">
            {materials.map(
              (material) => {
                const materialId =
                  getMaterialId(
                    material
                  );

                const materialName =
                  getMaterialName(
                    material
                  );

                const Icon =
                  getFileIcon(
                    material
                  );

                const selected =
                  materialId ===
                  String(
                    selectedMaterialId ||
                      ""
                  );

                const isReady =
                  material.status ===
                  "ready";

                const isProcessing =
                  material.status ===
                  "processing";

                const isFailed =
                  material.status ===
                  "failed";

                return (
                  <button
                    key={materialId}
                    type="button"
                    disabled={!isReady}
                    onClick={() => {
                      if (isReady) {
                        onSelectMaterial?.(
                          materialId
                        );
                      }
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-zinc-500 bg-zinc-800"
                        : "border-zinc-800 bg-zinc-900/30"
                    } ${
                      isReady
                        ? "cursor-pointer hover:border-zinc-600 hover:bg-zinc-900"
                        : "cursor-default opacity-70"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-white text-black"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          selected
                            ? "text-white"
                            : "text-zinc-300"
                        }`}
                        title={
                          materialName
                        }
                      >
                        {materialName}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {isReady && (
                          <>
                            <CheckCircle2
                              size={11}
                              className="text-zinc-400"
                            />

                            <span className="text-[10px] text-zinc-600">
                              Ready
                            </span>
                          </>
                        )}

                        {isProcessing && (
                          <>
                            <Loader2
                              size={11}
                              className="animate-spin text-zinc-500"
                            />

                            <span className="text-[10px] text-zinc-600">
                              Processing
                            </span>
                          </>
                        )}

                        {isFailed && (
                          <>
                            <AlertCircle
                              size={11}
                              className="text-zinc-500"
                            />

                            <span className="text-[10px] text-zinc-600">
                              Failed
                            </span>
                          </>
                        )}

                        {material.size && (
                          <span className="text-[10px] text-zinc-700">
                            {formatSize(
                              material.size
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {selected &&
                      isReady && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                          <Check
                            size={12}
                          />
                        </div>
                      )}

                    {!selected &&
                      isReady && (
                        <Circle
                          size={16}
                          className="shrink-0 text-zinc-700 transition group-hover:text-zinc-500"
                        />
                      )}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-zinc-600">
            RECENT UPLOADS
          </p>

          <div className="space-y-2">
            {files.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 ${
                  item.status ===
                  "duplicate"
                    ? "border-zinc-600 bg-zinc-800/60"
                    : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.status ===
                      "duplicate"
                        ? "bg-zinc-700 text-zinc-200"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {item.status ===
                    "duplicate" ? (
                      <Copy size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs text-zinc-300"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      {item.status ===
                        "uploading" && (
                        <>
                          <Loader2
                            size={11}
                            className="animate-spin text-zinc-500"
                          />

                          <span className="text-[10px] text-zinc-600">
                            Uploading
                          </span>
                        </>
                      )}

                      {item.status ===
                        "uploaded" && (
                        <>
                          <CheckCircle2
                            size={11}
                            className="text-zinc-400"
                          />

                          <span className="text-[10px] text-zinc-600">
                            Uploaded
                          </span>
                        </>
                      )}

                      {item.status ===
                        "duplicate" && (
                        <>
                          <Copy
                            size={11}
                            className="text-zinc-300"
                          />

                          <span className="text-[10px] font-medium text-zinc-300">
                            Duplicate file
                          </span>
                        </>
                      )}

                      {item.status ===
                        "failed" && (
                        <>
                          <AlertCircle
                            size={11}
                            className="text-zinc-500"
                          />

                          <span className="text-[10px] text-zinc-600">
                            Failed
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeFile(
                        item.id
                      )
                    }
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <X size={14} />
                  </button>
                </div>

                {item.status ===
                  "duplicate" && (
                  <div className="mt-3 border-t border-zinc-700 pt-2">
                    <p className="text-[10px] leading-4 text-zinc-500">
                      This exact file is
                      already in your
                      library. No new
                      processing was
                      started.
                    </p>
                  </div>
                )}

                {item.status ===
                  "failed" &&
                  item.message && (
                    <div className="mt-2">
                      <p className="text-[10px] leading-4 text-zinc-600">
                        {item.message}
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {processingMaterials.length >
        0 && (
        <p className="mt-4 text-[10px] leading-4 text-zinc-700">
          Processing materials become selectable automatically when they are ready.
        </p>
      )}

      {failedMaterials.length >
        0 && (
        <p className="mt-2 text-[10px] leading-4 text-zinc-700">
          Some materials could not be processed. Try uploading them again.
        </p>
      )}
    </div>
  );
}

export default UploadPanel;