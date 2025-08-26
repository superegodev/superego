import { Groq } from "groq-sdk";

const groq = new Groq();

const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "developer",
    content:
      "This is a test for parallel tool call. To pass the test you MUST call ALL the tools supplied, in parallel.",
  },
];

console.time("Generate");
const response = await groq.chat.completions.create({
  model: "qwen/qwen3-32b",
  messages: messages,
  tools: [
    {
      type: "function",
      function: {
        name: "tool_1",
        parameters: {
          type: "object",
          properties: {
            tool_name: {
              type: "string",
              description:
                "The name of the tool being called. tool_1 in this case.",
            },
          },
          required: ["tool_name"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "tool_2",
        parameters: {
          type: "object",
          properties: {
            tool_name: {
              type: "string",
              description:
                "The name of the tool being called. tool_2 in this case.",
            },
          },
          required: ["tool_name"],
        },
      },
    },
  ],
  stream: false,
});
console.timeEnd("Generate");
console.log(JSON.stringify(response, null, 2));
