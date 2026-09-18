import "dotenv/config";

import { PDFDocument } from "pdf-lib";

const endpoint =
  process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;

const key =
  process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

if (!endpoint) {
  throw new Error(
    "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT is missing from .env"
  );
}

if (!key) {
  throw new Error(
    "AZURE_DOCUMENT_INTELLIGENCE_KEY is missing from .env"
  );
}

const cleanEndpoint = endpoint.replace(/\/+$/, "");

const API_VERSION = "2024-11-30";

const MAX_RETRIES = 5;

const DEFAULT_RETRY_SECONDS = 16;

const BATCH_DELAY_MS = 3000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetrySeconds(response, errorText) {
  const retryAfterHeader = response.headers.get("Retry-After");

  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);

    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds);
    }
  }

  const match = errorText.match(
    /retry after\s+(\d+)\s+seconds/i
  );

  if (match) {
    return Number(match[1]);
  }

  return DEFAULT_RETRY_SECONDS;
}

async function submitDocumentWithRetry(
  buffer,
  contentType
) {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    attempt++;

    console.log(
      `Submitting document to Document Intelligence (attempt ${attempt}/${MAX_RETRIES + 1})...`
    );

    const response = await fetch(
      `${cleanEndpoint}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=${API_VERSION}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key.trim(),
          "Content-Type": contentType,
        },
        body: buffer,
      }
    );

    if (response.ok) {
      const operationLocation =
        response.headers.get("Operation-Location");

      if (!operationLocation) {
        throw new Error(
          "Document Intelligence did not return Operation-Location."
        );
      }

      return operationLocation;
    }

    const errorText = await response.text();

    if (response.status === 429 && attempt <= MAX_RETRIES) {
      const retrySeconds = getRetrySeconds(
        response,
        errorText
      );

      console.log(
        `Document Intelligence rate limit reached (429).`
      );

      console.log(
        `Waiting ${retrySeconds} seconds before retrying...`
      );

      await sleep(retrySeconds * 1000);

      continue;
    }

    throw new Error(
      `Document Intelligence submission failed: ${errorText}`
    );
  }

  throw new Error(
    "Document Intelligence submission failed after maximum retries."
  );
}

async function analyzeSingleDocument(
  buffer,
  contentType
) {
  const operationLocation =
    await submitDocumentWithRetry(
      buffer,
      contentType
    );

  let result;

  while (true) {
    await sleep(2000);

    const resultResponse = await fetch(
      operationLocation,
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key":
            key.trim(),
        },
      }
    );

    if (!resultResponse.ok) {
      const errorText =
        await resultResponse.text();

      if (resultResponse.status === 429) {
        const retrySeconds = getRetrySeconds(
          resultResponse,
          errorText
        );

        console.log(
          `Document Intelligence result request rate-limited.`
        );

        console.log(
          `Waiting ${retrySeconds} seconds before checking again...`
        );

        await sleep(retrySeconds * 1000);

        continue;
      }

      throw new Error(
        `Document Intelligence result request failed: ${errorText}`
      );
    }

    result =
      await resultResponse.json();

    console.log(
      "Document Intelligence status:",
      result.status
    );

    if (result.status === "succeeded") {
      break;
    }

    if (result.status === "failed") {
      throw new Error(
        `Document Intelligence analysis failed: ${JSON.stringify(
          result
        )}`
      );
    }
  }

  return result.analyzeResult;
}

async function createPageBatch(
  originalPdf,
  startPage,
  endPage
) {
  const batchPdf =
    await PDFDocument.create();

  const pageIndexes = [];

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pageIndexes.push(page);
  }

  const copiedPages =
    await batchPdf.copyPages(
      originalPdf,
      pageIndexes
    );

  for (const page of copiedPages) {
    batchPdf.addPage(page);
  }

  const batchBytes =
    await batchPdf.save();

  return Buffer.from(batchBytes);
}

function adjustPageNumbers(
  pages,
  pageOffset
) {
  if (!Array.isArray(pages)) {
    return [];
  }

  return pages.map((page) => ({
    ...page,
    pageNumber:
      (page.pageNumber || 1) +
      pageOffset,
  }));
}

function adjustParagraphs(
  paragraphs,
  pageOffset
) {
  if (!Array.isArray(paragraphs)) {
    return [];
  }

  return paragraphs.map((paragraph) => {
    if (
      !Array.isArray(
        paragraph.boundingRegions
      )
    ) {
      return paragraph;
    }

    return {
      ...paragraph,
      boundingRegions:
        paragraph.boundingRegions.map(
          (region) => ({
            ...region,
            pageNumber:
              (region.pageNumber || 1) +
              pageOffset,
          })
        ),
    };
  });
}

function adjustTables(
  tables,
  pageOffset
) {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables.map((table) => {
    if (
      !Array.isArray(
        table.boundingRegions
      )
    ) {
      return table;
    }

    return {
      ...table,
      boundingRegions:
        table.boundingRegions.map(
          (region) => ({
            ...region,
            pageNumber:
              (region.pageNumber || 1) +
              pageOffset,
          })
        ),
    };
  });
}

function adjustFigures(
  figures,
  pageOffset
) {
  if (!Array.isArray(figures)) {
    return [];
  }

  return figures.map((figure) => {
    if (
      !Array.isArray(
        figure.boundingRegions
      )
    ) {
      return figure;
    }

    return {
      ...figure,
      boundingRegions:
        figure.boundingRegions.map(
          (region) => ({
            ...region,
            pageNumber:
              (region.pageNumber || 1) +
              pageOffset,
          })
        ),
    };
  });
}

async function analyzePdfInBatches(
  buffer
) {
  const originalPdf =
    await PDFDocument.load(buffer);

  const totalPages =
    originalPdf.getPageCount();

  console.log(
    "========================================"
  );

  console.log(
    "PDF BATCH PROCESSING"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Original PDF pages:",
    totalPages
  );

  const combinedPages = [];
  const combinedParagraphs = [];
  const combinedTables = [];
  const combinedFigures = [];
  const combinedContent = [];

  const pagesPerBatch = 2;

  for (
    let startPage = 0;
    startPage < totalPages;
    startPage += pagesPerBatch
  ) {
    const endPage = Math.min(
      startPage + pagesPerBatch - 1,
      totalPages - 1
    );

    const displayStart =
      startPage + 1;

    const displayEnd =
      endPage + 1;

    console.log(
      `\nProcessing pages ${displayStart}-${displayEnd} of ${totalPages}`
    );

    const batchBuffer =
      await createPageBatch(
        originalPdf,
        startPage,
        endPage
      );

    console.log(
      "Batch PDF size:",
      (
        batchBuffer.length / 1024
      ).toFixed(2),
      "KB"
    );

    const batchResult =
      await analyzeSingleDocument(
        batchBuffer,
        "application/pdf"
      );

    const batchPages =
      adjustPageNumbers(
        batchResult?.pages,
        startPage
      );

    const batchParagraphs =
      adjustParagraphs(
        batchResult?.paragraphs,
        startPage
      );

    const batchTables =
      adjustTables(
        batchResult?.tables,
        startPage
      );

    const batchFigures =
      adjustFigures(
        batchResult?.figures,
        startPage
      );

    if (batchResult?.content) {
      combinedContent.push(
        batchResult.content
      );
    }

    combinedPages.push(
      ...batchPages
    );

    combinedParagraphs.push(
      ...batchParagraphs
    );

    combinedTables.push(
      ...batchTables
    );

    combinedFigures.push(
      ...batchFigures
    );

    console.log(
      `Azure returned ${batchPages.length} pages for this batch`
    );

    if (
      startPage + pagesPerBatch <
      totalPages
    ) {
      console.log(
        `Waiting ${BATCH_DELAY_MS / 1000} seconds before next batch...`
      );

      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(
    "\n========================================"
  );

  console.log(
    "ALL PDF BATCHES COMPLETE"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Original pages:",
    totalPages
  );

  console.log(
    "Pages extracted:",
    combinedPages.length
  );

  console.log(
    "Total characters:",
    combinedContent.join("\n").length
  );

  console.log(
    "========================================"
  );

  return {
    modelId: "prebuilt-layout",

    content:
      combinedContent.join("\n"),

    pages: combinedPages,

    paragraphs:
      combinedParagraphs,

    tables:
      combinedTables,

    figures:
      combinedFigures,
  };
}

export async function analyzeDocument(
  buffer,
  contentType = "application/pdf"
) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error(
      "Document Intelligence input must be a Buffer."
    );
  }

  if (
    contentType === "application/pdf"
  ) {
    return analyzePdfInBatches(
      buffer
    );
  }

  return analyzeSingleDocument(
    buffer,
    contentType
  );
}