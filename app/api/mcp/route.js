import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler((server) => {
  server.registerTool(
    "jev_noul",
    {
      title: "Jev NOUL",
      description: "Ask TypeSafe Jev a binary semantic question and return its probability.",
      inputSchema: z.object({
        state: z.string().describe("The text or situation Jev should evaluate."),
        instructions: z.string().describe("The binary semantic question Jev should answer."),
      }),
    },
    async ({ state, instructions }) => {
      const key = process.env.TYPESAFE_API_KEY;
      if (!key) {
        throw new Error("TYPESAFE_API_KEY is not configured");
      }

      const response = await fetch("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "jev-latest",
          state,
          questions: {
            answer: {
              type: "noul",
              instructions,
            },
          },
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        throw new Error(
          `TypeSafe API error ${response.status}: ${JSON.stringify(data)}`,
        );
      }

      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    },
  );
});

export { handler as GET, handler as POST };
