import "dotenv/config";

import {
  SearchClient,
  AzureKeyCredential,
} from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const indexName = "chaos-ai-index";

if (!endpoint) {
  throw new Error(
    "AZURE_SEARCH_ENDPOINT is missing from .env"
  );
}

if (!apiKey) {
  throw new Error(
    "AZURE_SEARCH_API_KEY is missing from .env"
  );
}

const client = new SearchClient(
  endpoint.replace(/\/+$/, ""),
  indexName,
  new AzureKeyCredential(apiKey.trim())
);

export async function indexChunks({
  materialId,
  userId,
  fileName,
  chunks,
  embeddings,
}) {
  if (chunks.length !== embeddings.length) {
    throw new Error(
      `Chunk/embedding mismatch: ${chunks.length} chunks, ${embeddings.length} embeddings`
    );
  }

  const documents = chunks.map((chunk, index) => ({
    id: `${materialId}-${chunk.pageNumber}-${chunk.chunkIndex}`,
    materialId: materialId.toString(),
    userId: userId.toString(),
    fileName,
    pageNumber: chunk.pageNumber,
    content: chunk.content,
    contentVector: embeddings[index],
  }));

  if (documents.length === 0) {
    return {
      count: 0,
    };
  }

  const result =
    await client.mergeOrUploadDocuments(
      documents
    );

  const failed = result.results.filter(
    (item) => !item.succeeded
  );

  if (failed.length > 0) {
    throw new Error(
      `Azure AI Search indexing failed: ${JSON.stringify(
        failed
      )}`
    );
  }

  return {
    count: documents.length,
  };
}

export async function searchChunks({
  queryEmbedding,
  userId,
  materialId = null,
  topK = 6,
}) {
  if (
    !Array.isArray(queryEmbedding) ||
    queryEmbedding.length === 0
  ) {
    throw new Error(
      "A valid query embedding is required."
    );
  }

  if (!userId) {
    throw new Error(
      "userId is required for RAG search."
    );
  }

  const filters = [
    `userId eq '${userId.toString()}'`,
  ];

  if (materialId) {
    filters.push(
      `materialId eq '${materialId.toString()}'`
    );
  }

  const searchResults =
    await client.search("*", {
      filter: filters.join(" and "),
      select: [
        "id",
        "materialId",
        "userId",
        "fileName",
        "pageNumber",
        "content",
      ],
      top: topK,
      vectorSearchOptions: {
        queries: [
          {
            kind: "vector",
            vector: queryEmbedding,
            fields: ["contentVector"],
            kNearestNeighborsCount: topK,
          },
        ],
      },
    });

  const results = [];

  for await (const result of searchResults.results) {
    results.push({
      score: result.score,
      id: result.document.id,
      materialId:
        result.document.materialId,
      userId:
        result.document.userId,
      fileName:
        result.document.fileName,
      pageNumber:
        result.document.pageNumber,
      content:
        result.document.content,
    });
  }

  return results;
}

export async function deleteMaterialFromSearch(
  materialId
) {
  const searchResults = await client.search(
    "*",
    {
      filter: `materialId eq '${materialId}'`,
      select: ["id"],
      top: 1000,
    }
  );

  const ids = [];

  for await (
    const result of searchResults.results
  ) {
    ids.push(result.document.id);
  }

  if (ids.length === 0) {
    return {
      count: 0,
    };
  }

  const result =
    await client.deleteDocuments(
      "id",
      ids
    );

  const failed = result.results.filter(
    (item) => !item.succeeded
  );

  if (failed.length > 0) {
    throw new Error(
      `Azure AI Search deletion failed: ${JSON.stringify(
        failed
      )}`
    );
  }

  return {
    count: ids.length,
  };
}