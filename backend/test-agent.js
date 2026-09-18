import "dotenv/config";

import {
  runChaosAgent,
} from "./src/services/agent.js";

const result =
  await runChaosAgent({
    question:
      "Generate 5 medium difficulty MCQs from this study material.",

    userId:
      "6aab6c898123f1388d9f44a0",

    materialId:
      "6aabf95b59592b3af4c75dcb",
  });

console.log(
  "\n========== FINAL RESULT ==========\n"
);

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

console.log(
  "\n==================================\n"
);