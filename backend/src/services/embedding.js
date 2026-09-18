import "dotenv/config";
import OpenAI from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;

if (!endpoint) {
  throw new Error("AZURE_OPENAI_ENDPOINT is missing from .env");
}

if (!apiKey) {
  throw new Error("AZURE_OPENAI_API_KEY is missing from .env");
}

if (!deployment) {
  throw new Error(
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT is missing from .env"
  );
}

const client = new OpenAI({
  baseURL: `${endpoint.replace(/\/+$/, "")}/openai/v1`,
  apiKey: apiKey.trim(),
});

export async function createEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const response = await client.embeddings.create({
    model: deployment,
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function createEmbedding(text) {
  const embeddings = await createEmbeddings([text]);
  return embeddings[0];
}