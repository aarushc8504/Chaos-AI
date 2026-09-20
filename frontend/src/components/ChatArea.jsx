import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  Loader2,
  BookOpen,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Image as ImageIcon,
} from "lucide-react";

import API_URL from "../config";

function ChatArea({
  selectedMaterialId,
  materials,
  setSources,
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [historyReady, setHistoryReady] = useState(false);

  const fileInputRef = useRef(null);

  const selectedMaterial = materials?.find(
    (material) =>
      material._id === selectedMaterialId
  );

  const getChatStorageKey = () => {
    if (!selectedMaterialId) {
      return "chaos-chat-history-no-material";
    }

    return `chaos-chat-history-${selectedMaterialId}`;
  };

  useEffect(() => {
    setHistoryReady(false);

    if (!selectedMaterialId) {
      setMessages([]);
      setSources?.([]);
      setHistoryReady(true);
      return;
    }

    try {
      const storageKey = getChatStorageKey();
      const savedHistory =
        localStorage.getItem(storageKey);

      if (savedHistory) {
        const parsedHistory =
          JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          setMessages(parsedHistory);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(
        "Failed to load chat history:",
        error
      );

      setMessages([]);
    }

    setSources?.([]);
    setHistoryReady(true);
  }, [selectedMaterialId]);

  useEffect(() => {
    if (!historyReady) {
      return;
    }

    try {
      const storageKey = getChatStorageKey();

      localStorage.setItem(
        storageKey,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error(
        "Failed to save chat history:",
        error
      );

      try {
        const storageKey =
          getChatStorageKey();

        const messagesWithoutImages =
          messages.map((message) => ({
            ...message,
            image: null,
          }));

        localStorage.setItem(
          storageKey,
          JSON.stringify(
            messagesWithoutImages
          )
        );
      } catch (fallbackError) {
        console.error(
          "Failed to save text-only chat history:",
          fallbackError
        );
      }
    }
  }, [messages, historyReady, selectedMaterialId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Failed to save image preview."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please select a PNG, JPEG, JPG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Image must be smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);

    event.target.value = "";
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");
  };

  const askQuestion = async () => {
    const trimmedQuestion =
      question.trim();

    if (
      !trimmedQuestion ||
      loading
    ) {
      return;
    }

    const currentImage =
      selectedImage;

    const currentImagePreview =
      imagePreview;

    let persistentImage = null;

    if (currentImage) {
      try {
        if (
          currentImage.size <=
          1024 * 1024
        ) {
          persistentImage =
            await fileToDataUrl(
              currentImage
            );
        }
      } catch (error) {
        console.error(
          "Could not preserve image:",
          error
        );
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content:
          trimmedQuestion,
        image:
          persistentImage ||
          currentImagePreview ||
          null,
      },
    ]);

    setQuestion("");
    setSelectedImage(null);
    setImagePreview("");

    setLoading(true);

    if (currentImage) {
      setStatus(
        "Reading your image and material..."
      );
    } else {
      setStatus(
        "Searching your material..."
      );
    }

    try {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            400
          )
      );

      if (currentImage) {
        setStatus(
          "Understanding the image..."
        );
      } else {
        setStatus(
          "Reading relevant sections..."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "question",
        trimmedQuestion
      );

      if (selectedMaterialId) {
        formData.append(
          "materialId",
          selectedMaterialId
        );
      }

      if (currentImage) {
        formData.append(
          "image",
          currentImage
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/chat`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get answer."
        );
      }

      setStatus(
        "Writing your answer..."
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            300
          )
      );

      const answerSources =
        data.sources || [];

      setSources(
        answerSources
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer,
          sources:
            answerSources,
        },
      ]);

      setStatus("");
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setSources([]);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message ||
            "I couldn't generate an answer right now. Please try again.",
          sources: [],
          error: true,
        },
      ]);

      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askQuestion();
    }
  };

  const usePrompt = (
    prompt
  ) => {
    if (loading) {
      return;
    }

    setQuestion(prompt);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0d0f]">

      <div className="shrink-0 border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600">
              STUDY WORKSPACE
            </p>

            <h1 className="mt-1 text-lg font-medium text-white">
              Ask your material
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5">

            <Sparkles
              size={12}
              className="text-zinc-400"
            />

            <span className="text-[10px] text-zinc-500">
              {selectedImage
                ? "Image + material"
                : "Grounded in your material"}
            </span>

          </div>

        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">

        {messages.length === 0 ? (

          <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-24 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">

              <BookOpen
                size={22}
                className="text-zinc-400"
              />

            </div>

            <h2 className="mt-5 text-xl font-medium text-zinc-200">
              Ask anything from your notes
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Ask questions from your uploaded
              material or attach an image,
              diagram, chart, or screenshot.
            </p>

            <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">

              {[
                "What are the Puranas?",
                "Explain the Mahabharata.",
                "What are the main themes?",
                "Summarize this unit.",
              ].map(
                (prompt) => (

                  <button
                    key={prompt}
                    onClick={() =>
                      usePrompt(
                        prompt
                      )
                    }
                    disabled={
                      loading
                    }
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-left text-xs text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>

                )
              )}

            </div>

          </div>

        ) : (

          <div className="mx-auto max-w-3xl space-y-8">

            {messages.map(
              (
                message,
                index
              ) => {

                const isUser =
                  message.role ===
                  "user";

                return (

                  <div
                    key={index}
                    className={`flex gap-4 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {!isUser && (

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">

                        {message.error ? (

                          <AlertCircle
                            size={14}
                            className="text-red-400"
                          />

                        ) : (

                          <Sparkles
                            size={14}
                            className="text-zinc-400"
                          />

                        )}

                      </div>

                    )}

                    <div
                      className={`max-w-[85%] ${
                        isUser
                          ? "rounded-2xl rounded-tr-md bg-zinc-800 px-4 py-3"
                          : "pt-1"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        {isUser && (

                          <User
                            size={12}
                            className="text-zinc-500"
                          />

                        )}

                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">
                          {isUser
                            ? "You"
                            : "Chaos AI"}
                        </span>

                      </div>

                      {message.image && (

                        <div className="mt-3 overflow-hidden rounded-xl border border-zinc-700">

                          <img
                            src={
                              message.image
                            }
                            alt="Uploaded study material"
                            className="max-h-72 w-full object-contain"
                          />

                        </div>

                      )}

                      <div
                        className={`mt-2 whitespace-pre-wrap text-sm leading-7 ${
                          isUser
                            ? "text-zinc-200"
                            : message.error
                            ? "text-red-400"
                            : "text-zinc-300"
                        }`}
                      >
                        {
                          message.content
                        }
                      </div>

                    </div>

                  </div>

                );
              }
            )}

            {loading && (

              <div className="flex gap-4">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">

                  <Sparkles
                    size={14}
                    className="text-zinc-400"
                  />

                </div>

                <div className="pt-2">

                  <div className="flex items-center gap-2">

                    <Loader2
                      size={13}
                      className="animate-spin text-zinc-500"
                    />

                    <span className="text-xs text-zinc-500">
                      {status}
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-[#0b0d0f] p-5">

        <div className="mx-auto max-w-3xl">

          {selectedImage && (

            <div className="mb-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800">

                <img
                  src={imagePreview}
                  alt="Selected"
                  className="h-full w-full object-cover"
                />

              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <ImageIcon
                    size={13}
                    className="text-zinc-500"
                  />

                  <span className="truncate text-xs text-zinc-300">
                    {
                      selectedImage.name
                    }
                  </span>

                </div>

                <p className="mt-0.5 text-[10px] text-zinc-600">
                  Image ready for analysis
                </p>

              </div>

              <button
                type="button"
                onClick={
                  removeImage
                }
                disabled={loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
                title="Remove image"
              >

                <X size={14} />

              </button>

            </div>

          )}

          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 transition focus-within:border-zinc-700">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder={
                selectedImage
                  ? "Ask about this image using your notes..."
                  : "Ask something from your study material..."
              }
              rows={3}
              disabled={loading}
              className="w-full resize-none bg-transparent px-4 pb-12 pt-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={
                handleImageSelect
              }
              className="hidden"
            />

            <div className="absolute bottom-3 left-4 flex items-center gap-1.5">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={loading}
                className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                title="Attach image"
              >

                <Paperclip
                  size={13}
                />

                <span className="text-[10px]">
                  Image
                </span>

              </button>

              <span className="text-zinc-800">
                |
              </span>

              <span className="text-[10px] text-zinc-700">
                Press
              </span>

              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-500">
                Enter
              </kbd>

              <span className="text-[10px] text-zinc-700">
                to send
              </span>

            </div>

            <button
              onClick={
                askQuestion
              }
              disabled={
                !question.trim() ||
                loading
              }
              title={
                loading
                  ? "Generating answer..."
                  : "Send question"
              }
              className="absolute bottom-3 right-3 flex h-8 min-w-8 items-center justify-center gap-2 rounded-lg bg-white px-2.5 text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
            >

              {loading ? (

                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  <span className="hidden text-[10px] font-medium sm:block">
                    Generating
                  </span>
                </>

              ) : (

                <Send
                  size={15}
                />

              )}

            </button>

          </div>

          <div className="mt-2 flex items-center justify-between px-1">

            <span className="text-[10px] text-zinc-700">
              {selectedImage
                ? "Image analysis will be combined with your study material."
                : "Answers are based on your uploaded material."}
            </span>

            {loading && (

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">

                <Loader2
                  size={10}
                  className="animate-spin"
                />

                <span>
                  {status}
                </span>

              </div>

            )}

            {!loading &&
              messages.length > 0 && (

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">

                  <CheckCircle2
                    size={10}
                  />

                  Ready

                </div>

              )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default ChatArea;