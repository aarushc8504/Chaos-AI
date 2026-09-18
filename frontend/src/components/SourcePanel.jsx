import React from "react";
import {
  BookOpen,
  FileText,
  Search,
} from "lucide-react";

function SourcePanel({ sources = [] }) {
  const uniqueSources = sources.filter(
    (source, index, array) =>
      index ===
      array.findIndex(
        (item) =>
          item.fileName ===
            source.fileName &&
          item.pageNumber ===
            source.pageNumber
      )
  );

  return (
    <div className="flex h-full min-h-0 flex-col">

      <div className="shrink-0">

        <p className="text-xs font-semibold tracking-[0.15em] text-zinc-600">
          SOURCES
        </p>

        <h2 className="mt-2 text-lg font-medium text-white">
          Retrieved material
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          Relevant sections used for the current answer.
        </p>

      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto">

        {uniqueSources.length === 0 ? (

          <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
              <Search
                size={17}
                className="text-zinc-600"
              />
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              No sources yet
            </p>

            <p className="mt-1 max-w-[190px] text-[10px] leading-5 text-zinc-700">
              Ask a question and the relevant pages from your material will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {uniqueSources.map(
              (source, index) => (

                <div
                  key={`${source.fileName}-${source.pageNumber}-${index}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-zinc-700 hover:bg-zinc-900"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                      <FileText
                        size={15}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs text-zinc-300">
                        {source.fileName}
                      </p>

                      <div className="mt-2 flex items-center gap-2">

                        <BookOpen
                          size={11}
                          className="text-zinc-600"
                        />

                        <span className="text-[10px] text-zinc-600">
                          Page{" "}
                          {
                            source.pageNumber
                          }
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default SourcePanel;