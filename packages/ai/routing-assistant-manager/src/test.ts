import { Groq } from "groq-sdk";

const groq = new Groq();

const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "developer",
    content:
      "You are the Document Creation Agent. If all required inputs are present, call the create_document tool with validated args.",
  },
  {
    role: "user",
    content:
      'Create a document titled "Q3 Launch Plan" in collection ops-42 with a short outline.',
  },
  {
    role: "assistant",
    tool_calls: [
      {
        id: "call_create_document_1",
        type: "function",
        function: {
          name: "create_document",
          arguments: JSON.stringify({
            collectionId: "ops-42",
            title: "Q3 Launch Plan",
            content: "Outline: Objectives; Timeline; Owners; Risks.",
          }),
        },
      },
    ],
  },
  {
    role: "tool",
    tool_call_id: "call_create_document_1",
    content: JSON.stringify({ success: true }),
  },
  // {
  //   role: "assistant",
  //   content: "",
  // },
  // {
  //   role: "user",
  //   content: "Thanks!",
  // },
];

console.time("Generate");
const response = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: messages,
  stream: false,
});
console.timeEnd("Generate");
console.log(JSON.stringify(response, null, 2));
