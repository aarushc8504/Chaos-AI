import "dotenv/config";

import dns from "dns";

dns.setDefaultResultOrder(
  "ipv4first"
);

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

import {
  McpServer,
} from "@modelcontextprotocol/server";

import {
  StdioServerTransport,
} from "@modelcontextprotocol/server/stdio";

import {
  z,
} from "zod";

import mongoose from "mongoose";

import OpenAI from "openai";

import {
  createEmbedding,
} from "../src/services/embedding.js";

import {
  searchChunks,
} from "../src/services/search.js";

import Material from "../models/Material.js";


const server =
  new McpServer({
    name:
      "chaos-ai",

    version:
      "1.0.0",
  });


const endpoint =
  process.env.AZURE_OPENAI_ENDPOINT;

const apiKey =
  process.env.AZURE_OPENAI_API_KEY;

const chatDeployment =
  process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
  process.env.AZURE_OPENAI_DEPLOYMENT;


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


if (!chatDeployment) {
  throw new Error(
    "AZURE_OPENAI_CHAT_DEPLOYMENT is missing from .env"
  );
}


const openai =
  new OpenAI({
    baseURL:
      `${endpoint.replace(/\/+$/, "")}/openai/v1`,

    apiKey:
      apiKey.trim(),
  });


async function ensureMongoDB() {
  if (
    mongoose.connection.readyState ===
    1
  ) {
    return;
  }

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  console.error(
    "[MCP] MongoDB connected."
  );
}


/* =========================================================
   RANDOMIZE MCQ OPTIONS
   ========================================================= */

function shuffleArray(array) {
  const shuffled =
    [...array];

  for (
    let i =
      shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      shuffled[i],
      shuffled[j],
    ] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}


function randomizeQuestionOptions(
  question
) {
  if (
    !Array.isArray(
      question.options
    ) ||
    question.options.length !==
      4
  ) {
    return question;
  }

  const correctIndex =
    Number(
      question.correctAnswer
    );

  if (
    correctIndex < 0 ||
    correctIndex > 3
  ) {
    return question;
  }

  const optionObjects =
    question.options.map(
      (
        option,
        index
      ) => ({
        text:
          option,

        isCorrect:
          index ===
          correctIndex,
      })
    );


  const shuffled =
    shuffleArray(
      optionObjects
    );


  return {
    question:
      question.question,

    options:
      shuffled.map(
        (option) =>
          option.text
      ),

    correctAnswer:
      shuffled.findIndex(
        (option) =>
          option.isCorrect
      ),

    explanation:
      question.explanation ||
      "",
  };
}


/* =========================================================
   SEARCH MATERIAL TOOL
   ========================================================= */

server.registerTool(
  "search_material",

  {
    title:
      "Search Study Material",

    description:
      "Search the student's uploaded study material using semantic vector search.",

    inputSchema: {
      question:
        z.string()
          .min(1)
          .describe(
            "The question or topic to search for in the study material."
          ),

      userId:
        z.string()
          .min(1)
          .describe(
            "The authenticated user's ID."
          ),

      materialId:
        z.string()
          .optional()
          .describe(
            "Optional specific material ID to search."
          ),

      topK:
        z.number()
          .int()
          .min(1)
          .max(20)
          .default(6)
          .describe(
            "Number of relevant chunks to retrieve."
          ),
    },
  },

  async ({
    question,
    userId,
    materialId,
    topK,
  }) => {

    console.error(
      `[MCP] Searching material for: "${question}"`
    );


    const queryEmbedding =
      await createEmbedding(
        question
      );


    const results =
      await searchChunks({
        queryEmbedding,
        userId,
        materialId:
          materialId ||
          null,
        topK,
      });


    return {
      content: [
        {
          type:
            "text",

          text:
            JSON.stringify({
              success:
                true,

              query:
                question,

              resultCount:
                results.length,

              results:
                results.map(
                  (
                    result,
                    index
                  ) => ({
                    rank:
                      index + 1,

                    score:
                      result.score,

                    id:
                      result.id,

                    materialId:
                      result.materialId,

                    fileName:
                      result.fileName,

                    pageNumber:
                      result.pageNumber,

                    content:
                      result.content,
                  })
                ),
            }),
        },
      ],
    };
  }
);


/* =========================================================
   GET MATERIAL TOOL
   ========================================================= */

server.registerTool(
  "get_material",

  {
    title:
      "Get Study Materials",

    description:
      "Get information about the student's uploaded study materials.",

    inputSchema: {
      userId:
        z.string()
          .min(1)
          .describe(
            "The authenticated user's ID."
          ),

      materialId:
        z.string()
          .optional()
          .describe(
            "Optional specific material ID."
          ),
    },
  },

  async ({
    userId,
    materialId,
  }) => {

    console.error(
      `[MCP] Getting material for user: ${userId}`
    );


    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  false,

                message:
                  "Invalid userId.",
              }),
          },
        ],
      };
    }


    if (
      materialId &&
      !mongoose.Types.ObjectId.isValid(
        materialId
      )
    ) {
      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  false,

                message:
                  "Invalid materialId.",
              }),
          },
        ],
      };
    }


    await ensureMongoDB();


    const query = {
      userId:
        new mongoose.Types.ObjectId(
          userId
        ),
    };


    if (
      materialId
    ) {
      query._id =
        new mongoose.Types.ObjectId(
          materialId
        );
    }


    const materials =
      await Material.find(
        query
      )
        .sort({
          createdAt:
            -1,
        })
        .lean();


    return {
      content: [
        {
          type:
            "text",

          text:
            JSON.stringify({
              success:
                true,

              count:
                materials.length,

              materials:
                materials.map(
                  (
                    material
                  ) => ({
                    id:
                      material._id.toString(),

                    name:
                      material.originalName,

                    fileHash:
                      material.fileHash,

                    contentType:
                      material.contentType,

                    size:
                      material.size,

                    status:
                      material.status,

                    createdAt:
                      material.createdAt,

                    updatedAt:
                      material.updatedAt,
                  })
                ),
            }),
        },
      ],
    };
  }
);


/* =========================================================
   GENERATE MCQS TOOL
   ========================================================= */

server.registerTool(
  "generate_mcqs",

  {
    title:
      "Generate MCQs",

    description:
      "Generate multiple-choice questions from retrieved study material. Questions must be based only on the provided study material context.",

    inputSchema: {
      context:
        z.string()
          .min(1)
          .describe(
            "Relevant study material retrieved from search_material."
          ),

      numberOfQuestions:
        z.number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe(
            "Number of MCQs to generate."
          ),

      difficulty:
        z.enum([
          "easy",
          "medium",
          "hard",
        ])
          .default("medium")
          .describe(
            "Difficulty level of the MCQs."
          ),
    },
  },

  async ({
    context,
    numberOfQuestions,
    difficulty,
  }) => {

    console.error(
      `[MCP] Generating ${numberOfQuestions} ${difficulty} MCQs.`
    );


    const systemPrompt = `
You are the MCQ generation engine for Chaos AI.

Generate multiple-choice questions using ONLY the provided study material.

Do not use outside knowledge.

Every question must be answerable from the supplied study material.

Difficulty:
- easy: direct recall and basic understanding
- medium: understanding, relationships, and application of concepts
- hard: deeper comparison, reasoning, and interpretation

Each question must have exactly four options.

Only one option must be correct.

IMPORTANT:
The options may be returned in ANY order.
Do not intentionally place the correct answer in a particular position.
The correctAnswer field must accurately identify the correct option.

Return ONLY valid JSON.

Use exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": 0,
      "explanation": "Short explanation based on the study material."
    }
  ]
}

correctAnswer must be:
0 for the first option,
1 for the second option,
2 for the third option,
3 for the fourth option.

Do not include markdown.
Do not include code fences.
`;


    const userPrompt = `
Generate ${numberOfQuestions} ${difficulty}-difficulty MCQs from the following study material.

STUDY MATERIAL:

${context}
`;


    try {

      const response =
        await openai.chat.completions.create({

          model:
            chatDeployment,

          messages: [
            {
              role:
                "system",

              content:
                systemPrompt,
            },

            {
              role:
                "user",

              content:
                userPrompt,
            },
          ],

          temperature:
            0.5,
        });


      const raw =
        response.choices[0]
          ?.message
          ?.content || "";


      let parsed;


      try {

        parsed =
          JSON.parse(
            raw
          );

      } catch {

        const cleaned =
          raw
            .replace(
              /^```json\s*/i,
              ""
            )
            .replace(
              /^```\s*/i,
              ""
            )
            .replace(
              /\s*```$/,
              ""
            )
            .trim();


        parsed =
          JSON.parse(
            cleaned
          );
      }


      if (
        !parsed.questions ||
        !Array.isArray(
          parsed.questions
        )
      ) {
        throw new Error(
          "MCQ response does not contain a valid questions array."
        );
      }


      const questions =
        parsed.questions
          .slice(
            0,
            numberOfQuestions
          )
          .map(
            (item) => ({
              question:
                item.question,

              options:
                Array.isArray(
                  item.options
                )
                  ? item.options.slice(
                      0,
                      4
                    )
                  : [],

              correctAnswer:
                Number(
                  item.correctAnswer
                ),

              explanation:
                item.explanation ||
                "",
            })
          )
          .filter(
            (item) =>
              item.question &&
              item.options.length ===
                4 &&
              item.correctAnswer >=
                0 &&
              item.correctAnswer <=
                3
          );


      const randomizedQuestions =
        questions.map(
          (question) =>
            randomizeQuestionOptions(
              question
            )
        );


      console.error(
        "[MCP] Correct answer distribution:"
      );


      console.error(
        randomizedQuestions.map(
          (question) =>
            String.fromCharCode(
              65 +
                question.correctAnswer
            )
        )
      );


      console.error(
        `[MCP] Successfully generated ${randomizedQuestions.length} MCQs.`
      );


      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  true,

                difficulty,

                requested:
                  numberOfQuestions,

                generated:
                  randomizedQuestions.length,

                questions:
                  randomizedQuestions,
              }),
          },
        ],
      };

    } catch (
      error
    ) {

      console.error(
        "[MCP] MCQ generation failed:",
        error
      );


      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  false,

                message:
                  "Failed to generate MCQs.",
              }),
          },
        ],

        isError:
          true,
      };
    }
  }
);


/* =========================================================
   GENERATE FLASHCARDS TOOL
   ========================================================= */

server.registerTool(
  "generate_flashcards",

  {
    title:
      "Generate Flashcards",

    description:
      "Generate study flashcards using only the provided study material context.",

    inputSchema: {
      context:
        z.string()
          .min(1)
          .describe(
            "Relevant study material retrieved from search_material."
          ),

      numberOfCards:
        z.number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe(
            "Number of flashcards to generate."
          ),

      topic:
        z.string()
          .optional()
          .describe(
            "Optional topic or focus area for the flashcards."
          ),
    },
  },

  async ({
    context,
    numberOfCards,
    topic,
  }) => {

    console.error(
      `[MCP] Generating ${numberOfCards} flashcards${topic ? ` on ${topic}` : ""}.`
    );


    const systemPrompt = `
You are the flashcard generation engine for Chaos AI.

Generate study flashcards using ONLY the provided study material.

Do not use outside knowledge.

Every flashcard must be answerable from the supplied study material.

Flashcards should help a student actively recall important information.

Create a useful mixture of:
- definitions
- important facts
- concepts
- relationships
- comparisons
- explanations
- important examples

Keep the front concise.

The back should provide a clear, accurate answer based only on the study material.

Do not create duplicate or nearly identical cards.

If the material contains important terminology, use the terminology from the material.

If a topic is provided, focus the cards on that topic.

Return ONLY valid JSON.

Use exactly this structure:

{
  "cards": [
    {
      "front": "Question, term, or concept",
      "back": "Answer or explanation",
      "type": "concept"
    }
  ]
}

The type field must be one of:
- definition
- fact
- concept
- comparison
- explanation
- example

Do not include markdown.

Do not include code fences.

Do not include information that is not present in the study material.
`;


    const userPrompt = `
Generate ${numberOfCards} study flashcards.

${topic ? `FOCUS TOPIC:\n${topic}\n` : ""}

STUDY MATERIAL:

${context}
`;


    try {

      const response =
        await openai.chat.completions.create({

          model:
            chatDeployment,

          messages: [
            {
              role:
                "system",

              content:
                systemPrompt,
            },

            {
              role:
                "user",

              content:
                userPrompt,
            },
          ],

          temperature:
            0.6,
        });


      const raw =
        response.choices[0]
          ?.message
          ?.content || "";


      let parsed;


      try {

        parsed =
          JSON.parse(
            raw
          );

      } catch {

        const cleaned =
          raw
            .replace(
              /^```json\s*/i,
              ""
            )
            .replace(
              /^```\s*/i,
              ""
            )
            .replace(
              /\s*```$/,
              ""
            )
            .trim();


        parsed =
          JSON.parse(
            cleaned
          );
      }


      if (
        !parsed.cards ||
        !Array.isArray(
          parsed.cards
        )
      ) {
        throw new Error(
          "Flashcard response does not contain a valid cards array."
        );
      }


      const allowedTypes = [
        "definition",
        "fact",
        "concept",
        "comparison",
        "explanation",
        "example",
      ];


      const cards =
        parsed.cards
          .slice(
            0,
            numberOfCards
          )
          .map(
            (item) => ({
              front:
                typeof item.front ===
                "string"
                  ? item.front.trim()
                  : "",

              back:
                typeof item.back ===
                "string"
                  ? item.back.trim()
                  : "",

              type:
                allowedTypes.includes(
                  item.type
                )
                  ? item.type
                  : "concept",
            })
          )
          .filter(
            (item) =>
              item.front &&
              item.back
          );


      if (
        cards.length === 0
      ) {
        throw new Error(
          "No valid flashcards were generated."
        );
      }


      console.error(
        `[MCP] Successfully generated ${cards.length} flashcards.`
      );


      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  true,

                topic:
                  topic ||
                  "",

                requested:
                  numberOfCards,

                generated:
                  cards.length,

                cards,
              }),
          },
        ],
      };

    } catch (
      error
    ) {

      console.error(
        "[MCP] Flashcard generation failed:",
        error
      );


      return {
        content: [
          {
            type:
              "text",

            text:
              JSON.stringify({
                success:
                  false,

                message:
                  "Failed to generate flashcards.",
              }),
          },
        ],

        isError:
          true,
      };
    }
  }
);


/* =========================================================
   START MCP SERVER
   ========================================================= */

const transport =
  new StdioServerTransport();


await server.connect(
  transport
);


console.error(
  "Chaos AI MCP server started."
);