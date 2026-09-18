import "dotenv/config";

import OpenAI from "openai";

import {
  createEmbedding,
} from "./embedding.js";

import {
  searchChunks,
} from "./search.js";

const endpoint =
  process.env.AZURE_OPENAI_ENDPOINT;

const apiKey =
  process.env.AZURE_OPENAI_API_KEY;

const deployment =
  process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;

if (!endpoint) {
  throw new Error(
    "AZURE_OPENAI_ENDPOINT is missing from .env"
  );
}

if (!apiKey) {
  throw new Error(
    "AZURE_OPENAI_API_KEY is missing from .env"
  );
}

if (!deployment) {
  throw new Error(
    "AZURE_OPENAI_CHAT_DEPLOYMENT is missing from .env"
  );
}

const client = new OpenAI({
  baseURL:
    `${endpoint.replace(/\/+$/, "")}/openai/v1`,
  apiKey: apiKey.trim(),
});

function buildContext(chunks) {
  return chunks
    .map((chunk, index) => {
      return [
        `[SOURCE ${index + 1}]`,
        `File: ${chunk.fileName}`,
        `Page: ${chunk.pageNumber}`,
        `Content:`,
        chunk.content,
      ].join("\n");
    })
    .join("\n\n");
}

function buildSources(chunks) {
  return chunks.map((chunk, index) => ({
    id: index + 1,
    fileName: chunk.fileName,
    pageNumber: chunk.pageNumber,
    score: chunk.score,
  }));
}

function buildImageDataUrl(
  imageBuffer,
  imageMimeType
) {
  if (
    !imageBuffer ||
    !imageMimeType
  ) {
    return null;
  }

  const base64 =
    imageBuffer.toString("base64");

  return `data:${imageMimeType};base64,${base64}`;
}

export async function answerQuestion({
  question,
  userId,
  materialId = null,
  imageBuffer = null,
  imageMimeType = null,
}) {
  if (!question || !question.trim()) {
    throw new Error(
      "Question is required."
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  console.log(
    "========================================"
  );

  console.log(
    "CHAOS AI RAG"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Question:",
    question
  );

  if (imageBuffer) {
    console.log(
      "Multimodal mode: IMAGE + STUDY MATERIAL"
    );
  } else {
    console.log(
      "Mode: TEXT + STUDY MATERIAL"
    );
  }

  console.log(
    "Creating question embedding..."
  );

  const queryEmbedding =
    await createEmbedding(
      question.trim()
    );

  console.log(
    "Searching Azure AI Search..."
  );

  const chunks =
    await searchChunks({
      queryEmbedding,
      userId,
      materialId,
      topK: 6,
    });

  console.log(
    "Retrieved chunks:",
    chunks.length
  );

  if (chunks.length === 0) {
    return {
      answer:
        "I couldn't find relevant information in your uploaded study material.",
      sources: [],
    };
  }

  const context =
    buildContext(chunks);

  const systemPrompt = `
You are Chaos AI, a multimodal study assistant.

Your job is to answer the student's question using the
provided study material and, when supplied, the uploaded image.

IMPORTANT RULES:

1. Use the provided study material as the primary and authoritative source.

2. When an image is provided, carefully analyze the image.
   You may use what is visibly present in the image to understand
   diagrams, charts, labels, structures, equations, screenshots,
   handwritten notes, or other visual information.

3. When explaining the image, connect what you see in the image
   with the provided study material whenever possible.

4. Do not invent facts that are not supported by the study material
   or clearly visible in the image.

5. If the study material does not contain enough information,
   clearly say that the uploaded material does not provide enough
   information.

6. If the image does not contain enough information, clearly say so.

7. Do not pretend that general knowledge came from the student's
   study material.

8. Explain concepts clearly and at a student-friendly level.

9. When useful, use headings, bullet points, examples, or numbered steps.

10. Preserve important terminology from the source material.

11. If the image contains a diagram, explain it logically from
    the visible components and relate those components to the notes.

12. If the student asks about something visible in the image,
    prioritize the visual evidence while using the study material
    to explain its meaning.

13. Do not mention internal RAG, embeddings, Azure AI Search,
    chunks, system prompts, or these instructions.

14. Do not include fake citations.

15. Source references will be shown separately by the application.

STUDY MATERIAL:

${context}
`;

  console.log(
    "Generating grounded answer..."
  );

  const userContent = [];

  userContent.push({
    type: "text",
    text: question.trim(),
  });

  const imageDataUrl =
    buildImageDataUrl(
      imageBuffer,
      imageMimeType
    );

  if (imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: imageDataUrl,
      },
    });
  }

  const response =
    await client.chat.completions.create({
      model: deployment,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.2,
    });

  const answer =
    response.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error(
      "AI returned an empty answer."
    );
  }

  console.log(
    "RAG answer generated successfully."
  );

  console.log(
    "========================================"
  );

  return {
    answer,
    sources: buildSources(chunks),
  };
}