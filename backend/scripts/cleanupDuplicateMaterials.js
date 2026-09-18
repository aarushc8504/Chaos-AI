import "dotenv/config";

import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

import mongoose from "mongoose";

import {
  BlobServiceClient,
} from "@azure/storage-blob";

import Material from "../models/Material.js";

import {
  deleteMaterialFromSearch,
} from "../src/services/search.js";

const storageConnectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!storageConnectionString) {
  throw new Error(
    "AZURE_STORAGE_CONNECTION_STRING is missing from .env"
  );
}

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing from .env"
  );
}

const blobServiceClient =
  BlobServiceClient.fromConnectionString(
    storageConnectionString
  );

async function deleteMaterial(material) {
  console.log(
    "\n----------------------------------------"
  );

  console.log(
    `Deleting: ${material.originalName}`
  );

  console.log(
    `Material ID: ${material._id}`
  );

  console.log(
    `Status: ${material.status}`
  );

  try {
    const searchResult =
      await deleteMaterialFromSearch(
        material._id
      );

    console.log(
      `Azure AI Search chunks deleted: ${searchResult.count}`
    );
  } catch (error) {
    console.error(
      "Azure AI Search deletion failed:",
      error.message
    );
  }

  try {
    const containerClient =
      blobServiceClient.getContainerClient(
        material.containerName
      );

    const blobClient =
      containerClient.getBlobClient(
        material.blobName
      );

    const deleted =
      await blobClient.deleteIfExists();

    console.log(
      `Azure Blob deleted: ${deleted}`
    );
  } catch (error) {
    console.error(
      "Azure Blob deletion failed:",
      error.message
    );
  }

  try {
    await Material.findByIdAndDelete(
      material._id
    );

    console.log(
      "MongoDB record deleted."
    );
  } catch (error) {
    console.error(
      "MongoDB deletion failed:",
      error.message
    );
  }
}

async function main() {
  console.log(
    "========================================"
  );

  console.log(
    "CHAOS AI - DELETE ALL MATERIALS"
  );

  console.log(
    "========================================"
  );

  console.log(
    "Connecting to MongoDB..."
  );

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  console.log(
    "MongoDB connected."
  );

  const materials =
    await Material.find({});

  console.log(
    `\nMaterials found: ${materials.length}`
  );

  if (materials.length === 0) {
    console.log(
      "\nDatabase is already clean."
    );

    return;
  }

  console.log(
    "\nDeleting all materials..."
  );

  for (
    const material of materials
  ) {
    await deleteMaterial(
      material
    );
  }

  const remaining =
    await Material.countDocuments();

  console.log(
    "\n========================================"
  );

  console.log(
    "CLEANUP COMPLETE"
  );

  console.log(
    `Deleted: ${materials.length}`
  );

  console.log(
    `Remaining: ${remaining}`
  );

  console.log(
    "========================================"
  );
}

main()
  .catch((error) => {
    console.error(
      "\nCLEANUP FAILED:"
    );

    console.error(error);
  })
  .finally(async () => {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );
  });