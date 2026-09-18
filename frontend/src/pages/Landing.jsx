import React from "react";
import {
  ArrowRight,
  Brain,
  FileText,
  Image,
  MessageSquare,
  Sparkles,
  Upload,
} from "lucide-react";
import AnimatedTextCycle from "../components/ui/animated-text-cycle";

function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-[#0b0d0f] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
            <Brain size={18} />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-[0.12em]">
              CHAOS AI
            </div>
            <div className="text-[10px] text-zinc-600">
              Study without the chaos
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2 text-xs text-zinc-300 transition hover:border-zinc-600 hover:text-white"
        >
          Open workspace
          <ArrowRight size={14} />
        </button>
      </nav>

      <main>
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center lg:pt-32">
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-[11px] text-zinc-500">
            <Sparkles size={12} />
            Your study material. One intelligent workspace.
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-medium leading-[1.05] tracking-[-0.04em] text-zinc-100 sm:text-6xl lg:text-7xl">
            Turn study material
            <br />
            into understanding.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Upload your notes, PDFs and diagrams. Ask questions in plain
            language and get explanations grounded in the material you're
            actually studying.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onStart}
              className="group flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Start studying
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <span className="text-xs text-zinc-700">
              Built around your material
            </span>
          </div>

          <div className="mt-16 text-left">
            <p className="mb-3 text-center text-xs text-zinc-700">
              Your{" "}
              <AnimatedTextCycle
                words={[
                  "notes",
                  "PDFs",
                  "diagrams",
                  "screenshots",
                  "knowledge",
                ]}
                interval={2200}
                className="text-zinc-400"
              />{" "}
              deserve better tools.
            </p>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e1012] shadow-2xl shadow-black/30">
              <div className="flex h-10 items-center border-b border-zinc-800 px-4">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                </div>

                <span className="ml-auto text-[10px] text-zinc-700">
                  study-workspace
                </span>
              </div>

              <div className="grid min-h-[380px] md:grid-cols-[180px_1fr_190px]">
                <div className="border-b border-zinc-800 p-5 md:border-b-0 md:border-r">
                  <p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-700">
                    MATERIALS
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-zinc-500" />
                        <span className="truncate text-[10px] text-zinc-400">
                          Neural_Networks.pdf
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                      <div className="flex items-center gap-2">
                        <Image size={13} className="text-zinc-600" />
                        <span className="truncate text-[10px] text-zinc-600">
                          network-diagram.png
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-[10px] text-zinc-700">
                    <Upload size={12} />
                    Add material
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={13} className="text-zinc-600" />
                      <span className="text-xs text-zinc-400">
                        Neural Networks
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 p-6">
                    <div className="ml-auto max-w-xs rounded-xl rounded-tr-sm bg-zinc-800 px-4 py-3">
                      <p className="text-[11px] leading-5 text-zinc-300">
                        Explain this neural network diagram using my notes.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-black">
                        <Brain size={13} />
                      </div>

                      <div className="max-w-md">
                        <p className="text-[11px] leading-6 text-zinc-500">
                          The diagram represents a feed-forward neural
                          network. Information moves from the input layer
                          through the hidden layers before reaching the output
                          layer.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-[9px] text-zinc-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                          Based on your material
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 p-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-[10px] text-zinc-700">
                      Ask about your material...
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 p-5 md:border-l md:border-t-0">
                  <p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-700">
                    SOURCES
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                      <p className="text-[10px] text-zinc-400">
                        Neural_Networks.pdf
                      </p>
                      <p className="mt-1 text-[9px] text-zinc-700">
                        Page 4
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                      <p className="text-[10px] text-zinc-400">
                        Neural_Networks.pdf
                      </p>
                      <p className="mt-1 text-[9px] text-zinc-700">
                        Page 7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
            <div className="grid gap-12 md:grid-cols-3">
              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800">
                  <Upload size={15} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-medium">Bring your material</h3>
                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  Upload the PDFs, images and notes you already use to study.
                </p>
              </div>

              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800">
                  <MessageSquare size={15} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-medium">Ask naturally</h3>
                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  Ask questions the same way you would ask a teacher or
                  classmate.
                </p>
              </div>

              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800">
                  <Brain size={15} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-medium">Understand faster</h3>
                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  Get answers connected to your own study material instead of
                  generic explanations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900">
          <div className="mx-auto max-w-4xl px-6 py-28 text-center">
            <p className="text-xs tracking-[0.2em] text-zinc-700">
              READY WHEN YOU ARE
            </p>

            <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em] text-zinc-200 sm:text-4xl">
              Stop searching through notes.
              <br />
              Start understanding them.
            </h2>

            <button
              onClick={onStart}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Open Chaos AI
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[10px] text-zinc-700">
          <span>CHAOS AI</span>
          <span>Study smarter. Stay grounded.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;