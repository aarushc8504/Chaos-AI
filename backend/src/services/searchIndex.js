import "dotenv/config";

import {
  SearchIndexClient,
  AzureKeyCredential,
} from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
const adminKey = process.env.AZURE_SEARCH_API_KEY;

const indexName = "chaos-ai-index";

if (!endpoint) {
  console.error("AZURE_SEARCH_ENDPOINT is missing from .env");
  process.exit(1);
}

if (!adminKey) {
  console.error("AZURE_SEARCH_API_KEY is missing from .env");
  process.exit(1);
}

const client = new SearchIndexClient(
  endpoint.replace(/\/$/, ""),
  new AzureKeyCredential(adminKey.trim())
);

const index = {
  name: indexName,

  fields: [
    {
      name: "id",
      type: "Edm.String",
      key: true,
      searchable: false,
      filterable: true,
      retrievable: true,
    },

    {
      name: "materialId",
      type: "Edm.String",
      searchable: false,
      filterable: true,
      retrievable: true,
    },

    {
      name: "userId",
      type: "Edm.String",
      searchable: false,
      filterable: true,
      retrievable: true,
    },

    {
      name: "fileName",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      retrievable: true,
    },

    {
      name: "pageNumber",
      type: "Edm.Int32",
      searchable: false,
      filterable: true,
      sortable: true,
      retrievable: true,
    },

    {
      name: "content",
      type: "Edm.String",
      searchable: true,
      retrievable: true,
    },

    {
      name: "contentVector",
      type: "Collection(Edm.Single)",
      searchable: true,
      retrievable: true,
      vectorSearchDimensions: 1536,
      vectorSearchProfileName: "chaos-vector-profile",
    },
  ],

  vectorSearch: {
    algorithms: [
      {
        name: "chaos-hnsw",
        kind: "hnsw",
        parameters: {
          m: 4,
          efConstruction: 400,
          efSearch: 500,
          metric: "cosine",
        },
      },
    ],

    profiles: [
      {
        name: "chaos-vector-profile",
        algorithmConfigurationName: "chaos-hnsw",
      },
    ],
  },

  semanticSearch: {
    configurations: [
      {
        name: "chaos-semantic-config",

        prioritizedFields: {
          titleField: {
            name: "fileName",
          },

          contentFields: [
            {
              name: "content",
            },
          ],
        },
      },
    ],
  },
};

console.log("Creating Chaos AI search index...");
console.log(`Endpoint: ${endpoint}`);
console.log(`Index: ${indexName}`);

try {
  const result = await client.createOrUpdateIndex(index);

  console.log("\n========================================");
  console.log("SEARCH INDEX CREATED");
  console.log("========================================");

  console.log("Name:", result.name);

  console.log("\nFields:");

  result.fields.forEach((field) => {
    console.log(`- ${field.name}`);
  });

  console.log("\nVector profile: chaos-vector-profile");
  console.log("Semantic configuration: chaos-semantic-config");

  console.log("========================================");
} catch (error) {
  console.error("\nFailed to create search index.");
  console.error(error);
  process.exit(1);
}