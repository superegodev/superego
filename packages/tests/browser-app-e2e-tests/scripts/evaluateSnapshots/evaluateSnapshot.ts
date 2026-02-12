import { readFileSync } from "node:fs";
import type { EvaluationResult, SnapshotEntry } from "./types.ts";

interface EvaluateConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const toolName = "evaluate";

export async function evaluateSnapshot(
  entry: SnapshotEntry,
  config: EvaluateConfig,
): Promise<EvaluationResult> {
  const imageBase64 = readFileSync(entry.snapshotPath).toString("base64");
  const requirement = readFileSync(entry.requirementPath, "utf-8");

  const requestBody = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              "You are evaluating a screenshot from an e2e browser test.",
              `The screenshot should match the following requirement:\n\n"${requirement}"`,
              `\nEvaluate whether the screenshot satisfies the requirement. Use the ${toolName} tool to report your finding.`,
            ].join("\n"),
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: toolName,
          description: "Report the evaluation result",
          parameters: {
            type: "object",
            properties: {
              pass: {
                type: "boolean",
                description:
                  "Whether the screenshot matches the requirement",
              },
              reason: {
                type: "string",
                description:
                  "A concise reason for the evaluation result",
              },
            },
            required: ["pass", "reason"],
            additionalProperties: false,
          },
        },
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        ...(config.apiKey
          ? { Authorization: `Bearer ${config.apiKey}` }
          : undefined),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    return {
      testFileName: entry.testFileName,
      stepIndex: entry.stepIndex,
      pass: false,
      reason: `LLM API request failed: ${error}`,
    };
  }

  if (!response.ok) {
    const text = await response.text();
    return {
      testFileName: entry.testFileName,
      stepIndex: entry.stepIndex,
      pass: false,
      reason: `LLM API error: ${response.status} ${text}`,
    };
  }

  const data = (await response.json()) as {
    choices?: {
      message?: {
        tool_calls?: {
          function?: { name?: string; arguments?: string };
        }[];
      };
    }[];
  };

  const toolCall = data.choices?.[0]?.message?.tool_calls?.find(
    (tc) => tc.function?.name === toolName,
  );

  if (!toolCall?.function?.arguments) {
    return {
      testFileName: entry.testFileName,
      stepIndex: entry.stepIndex,
      pass: false,
      reason: "Evaluator failed to produce a result.",
    };
  }

  try {
    const result = JSON.parse(toolCall.function.arguments) as Record<
      string,
      unknown
    >;
    const isValid =
      typeof result["pass"] === "boolean" &&
      typeof result["reason"] === "string";

    if (!isValid) {
      return {
        testFileName: entry.testFileName,
        stepIndex: entry.stepIndex,
        pass: false,
        reason: "Evaluator produced an invalid result.",
      };
    }

    return {
      testFileName: entry.testFileName,
      stepIndex: entry.stepIndex,
      pass: result["pass"] as boolean,
      reason: result["reason"] as string,
    };
  } catch {
    return {
      testFileName: entry.testFileName,
      stepIndex: entry.stepIndex,
      pass: false,
      reason: "Failed to parse evaluator response.",
    };
  }
}
