import { readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, parse, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const currentFilePath = fileURLToPath(import.meta.url);
const packageDirectory = join(currentFilePath, "../../");
const scenariosDirectory = join(packageDirectory, "src/scenarios");
const resultFilePath = join(packageDirectory, "review-results.json");

type Step = {
  key: string;
  label: string;
  snapshotPath: string;
  requirement: string;
};

type Scenario = {
  key: string;
  label: string;
  steps: Step[];
};

const html = String.raw`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Browser app snapshots review</title>
    <style>
      body { margin: 0; font-family: sans-serif; }
      .layout { display: grid; grid-template-rows: 60px calc(100vh - 60px); }
      .content { display: grid; grid-template-columns: 320px 320px 1fr; min-height: 0; }
      .panel { border-right: 1px solid #ddd; overflow: auto; }
      .main { overflow: auto; padding: 16px; }
      img { max-width: 100%; border: 1px solid #ddd; }
    </style>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18",
          "react-dom/client": "https://esm.sh/react-dom@18/client",
          "@mantine/core": "https://esm.sh/@mantine/core@7.17.8?external=react,react-dom",
          "@mantine/hooks": "https://esm.sh/@mantine/hooks@7.17.8?external=react",
          "@emotion/react": "https://esm.sh/@emotion/react@11.14.0?external=react"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React from "react";
      import { createRoot } from "react-dom/client";
      import {
        AppShell,
        Button,
        Card,
        Group,
        MantineProvider,
        NavLink,
        ScrollArea,
        Stack,
        Text,
        Title,
      } from "@mantine/core";

      const response = await fetch("/api/data");
      const scenarios = await response.json();

      const findFirst = () => ({ scenarioIndex: 0, stepIndex: 0 });

      function App() {
        const [cursor, setCursor] = React.useState(findFirst());
        const [reviews, setReviews] = React.useState({});
        const allSteps = React.useMemo(() => scenarios.flatMap((scenario) => scenario.steps.map((step) => ({ scenarioKey: scenario.key, stepKey: step.key }))), []);
        const reviewedCount = Object.keys(reviews).length;
        const passedCount = Object.values(reviews).filter((value) => value === "pass").length;
        const failedCount = Object.values(reviews).filter((value) => value === "fail").length;
        const isComplete = reviewedCount === allSteps.length;

        const selectedScenario = scenarios[cursor.scenarioIndex];
        const selectedStep = selectedScenario?.steps[cursor.stepIndex];

        const moveToNextStep = () => {
          let scenarioIndex = cursor.scenarioIndex;
          let stepIndex = cursor.stepIndex + 1;
          if (stepIndex >= scenarios[scenarioIndex].steps.length) {
            scenarioIndex += 1;
            stepIndex = 0;
          }
          if (scenarioIndex < scenarios.length) {
            setCursor({ scenarioIndex, stepIndex });
          }
        };

        const reviewKey = selectedStep ? selectedScenario.key + "::" + selectedStep.key : "";

        const setResult = (value) => {
          setReviews((current) => ({ ...current, [reviewKey]: value }));
          moveToNextStep();
        };

        const submit = async () => {
          await fetch("/api/submit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ reviews }),
          });
        };

        return (
          React.createElement(MantineProvider, null,
            React.createElement(AppShell, {
              header: { height: 60 },
              padding: 0,
              styles: {
                main: { height: "100vh" },
              },
            },
              React.createElement(AppShell.Header, null,
                React.createElement(Group, { justify: "space-between", h: "100%", px: "md" },
                  React.createElement(Button, { disabled: !isComplete, onClick: submit }, "Submit"),
                  React.createElement(Group, { gap: "md" },
                    React.createElement(Text, null, "Tests: " + scenarios.length),
                    React.createElement(Text, null, "Reviewed: " + reviewedCount + "/" + allSteps.length),
                    React.createElement(Text, null, "Passed: " + passedCount),
                    React.createElement(Text, null, "Failed: " + failedCount),
                  ),
                ),
              ),
              React.createElement(AppShell.Main, { className: "content" },
                React.createElement(ScrollArea, { className: "panel" },
                  React.createElement(Stack, { p: "xs", gap: 4 },
                    scenarios.map((scenario, scenarioIndex) =>
                      React.createElement(NavLink, {
                        key: scenario.key,
                        label: scenario.label,
                        active: scenarioIndex === cursor.scenarioIndex,
                        onClick: () => setCursor({ scenarioIndex, stepIndex: 0 }),
                      }),
                    ),
                  ),
                ),
                React.createElement(ScrollArea, { className: "panel" },
                  React.createElement(Stack, { p: "xs", gap: 4 },
                    selectedScenario?.steps.map((step, stepIndex) => {
                      const key = selectedScenario.key + "::" + step.key;
                      const state = reviews[key];
                      const label = state ? step.label + " (" + state.toUpperCase() + ")" : step.label;
                      return React.createElement(NavLink, {
                        key: step.key,
                        label,
                        active: stepIndex === cursor.stepIndex,
                        onClick: () => setCursor({ scenarioIndex: cursor.scenarioIndex, stepIndex }),
                      });
                    }),
                  ),
                ),
                React.createElement("div", { className: "main" },
                  selectedStep
                    ? React.createElement(Stack, { gap: "md" },
                        React.createElement(Title, { order: 4 }, selectedScenario.label + " / " + selectedStep.label),
                        React.createElement(Card, { withBorder: true },
                          React.createElement(Text, { fw: 700 }, "Requirement"),
                          React.createElement(Text, null, selectedStep.requirement || "No requirement file found"),
                        ),
                        React.createElement("img", { src: selectedStep.snapshotPath }),
                        React.createElement(Group, null,
                          React.createElement(Button, { color: "green", onClick: () => setResult("pass") }, "Pass"),
                          React.createElement(Button, { color: "red", onClick: () => setResult("fail") }, "Fail"),
                        ),
                      )
                    : React.createElement(Text, null, "No snapshots found."),
                ),
              ),
            ),
          )
        );
      }

      createRoot(document.getElementById("root")).render(React.createElement(App));
    </script>
  </body>
</html>`;

const sorted = (items: string[]) => [...items].sort((a, b) => a.localeCompare(b));

async function loadScenarios(): Promise<Scenario[]> {
  const scenarioEntries = await readdir(scenariosDirectory, { withFileTypes: true });
  const snapshotDirectories = sorted(
    scenarioEntries
      .filter((entry) => entry.isDirectory() && entry.name.endsWith(".test.ts-snapshots"))
      .map((entry) => entry.name),
  );

  const scenarios = await Promise.all(
    snapshotDirectories.map(async (snapshotDirectoryName) => {
      const scenarioKey = snapshotDirectoryName.replace(/\.test\.ts-snapshots$/, "");
      const snapshotDirectoryPath = join(scenariosDirectory, snapshotDirectoryName);
      const files = sorted(await readdir(snapshotDirectoryPath));
      const steps = await Promise.all(
        files
          .filter((file) => extname(file) === ".png")
          .map(async (snapshotFileName) => {
            const stepKey = parse(snapshotFileName).name;
            const requirementPath = join(snapshotDirectoryPath, `${stepKey}.txt`);
            let requirement = "";
            try {
              requirement = (await readFile(requirementPath, "utf8")).trim();
            } catch {
              requirement = "";
            }

            return {
              key: stepKey,
              label: stepKey,
              snapshotPath: `/${relative(packageDirectory, join(snapshotDirectoryPath, snapshotFileName)).replaceAll("\\", "/")}`,
              requirement,
            };
          }),
      );

      return {
        key: scenarioKey,
        label: scenarioKey,
        steps,
      };
    }),
  );

  return scenarios;
}

const scenarios = await loadScenarios();

const server = createServer(async (request, response) => {
  const url = request.url ?? "/";

  if (request.method === "GET" && url === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && url === "/api/data") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(scenarios));
    return;
  }

  if (request.method === "POST" && url === "/api/submit") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", async () => {
      const payload = JSON.parse(body || "{}");
      const entries = Object.entries(payload.reviews ?? {});
      const failedEntries = entries.filter(([, result]) => result !== "pass");
      await writeFile(
        resultFilePath,
        `${JSON.stringify({ scenarios, reviews: payload.reviews ?? {} }, null, 2)}\n`,
      );
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      setTimeout(() => process.exit(failedEntries.length === 0 ? 0 : 1), 20);
    });
    return;
  }

  if (request.method === "GET") {
    const filePath = join(packageDirectory, decodeURIComponent(url.slice(1)));
    try {
      const content = await readFile(filePath);
      const type = extname(filePath) === ".png" ? "image/png" : "text/plain";
      response.writeHead(200, { "content-type": type });
      response.end(content);
      return;
    } catch {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
  }

  response.writeHead(404);
  response.end("Not found");
});

const port = Number(process.env.PORT ?? 0);

server.listen(port, "0.0.0.0", () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Cannot determine server address");
  }

  const url = `http://127.0.0.1:${address.port}`;
  console.log(`Snapshot review UI: ${url}`);

  const opener = process.platform === "darwin"
    ? `open ${url}`
    : process.platform === "win32"
      ? `start ${url}`
      : `xdg-open ${url}`;

  exec(opener);
});
