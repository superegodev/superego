import type Message from "../Message.js";
import MessageContentPartType from "../MessageContentPartType.js";
import MessageRole from "../MessageRole.js";

export const exampleHistory1: Message[] = [
  // Developer message.
  // User context message with collections, current local date time, etc.
  {
    role: MessageRole.User,
    content: [
      {
        type: MessageContentPartType.Text,
        text: "Filled up the car. 43.04 liters. 58.10 euros.",
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.Assistant,
    toolCalls: [
      {
        id: "call_1",
        toolName: "GetCollectionSchema",
        input: { collectionId: "fuel_log" },
      },
      {
        id: "call_2",
        toolName: "GetCollectionSchema",
        input: { collectionId: "expenses" },
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.Tool,
    toolResponses: [
      {
        toolCallId: "call_1",
        toolName: "GetCollectionSchema",
        output: "fuel_log schema",
      },
      {
        toolCallId: "call_2",
        toolName: "GetCollectionSchema",
        output: "expenses schema",
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.Assistant,
    content: [
      {
        type: MessageContentPartType.Text,
        text: "What is the odometer reading?",
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.User,
    content: [
      {
        type: MessageContentPartType.Text,
        text: "123123",
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.Assistant,
    toolCalls: [
      {
        id: "call_3",
        toolName: "CreateDocument_Collection_fuel_logs",
        input: { liters: 43.04, cost: 58.1, odometer: 123123, fullTank: true },
      },
      {
        id: "call_4",
        toolName: "CreateDocument_Collection_expenses",
        input: { description: "Refuelling", cost: 58.1 },
      },
    ],
    createdAt: new Date(),
  },
  {
    role: MessageRole.Tool,
    toolResponses: [
      {
        toolCallId: "call_3",
        toolName: "CreateDocument_Collection_fuel_logs",
        output: { success: true },
      },
      {
        toolCallId: "call_4",
        toolName: "CreateDocument_Collection_expenses",
        output: { success: true },
      },
    ],
    createdAt: new Date(),
  },
];
