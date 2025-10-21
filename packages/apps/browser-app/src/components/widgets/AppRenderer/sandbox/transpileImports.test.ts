import { expect, it } from "vitest";
import { dependenciesGlobalVar } from "./registerDependencies.js";
import transpileImports from "./transpileImports.js";

const testCases: {
  name: string;
  source: string;
  expectedTranspiled: string;
}[] = [
  {
    name: "default import",
    source: `
      import Lib from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "namespace import",
    source: `
      import * as Lib from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "named import",
    source: `
      import { useState } from "lib";
    `,
    expectedTranspiled: `
      const { useState } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "default + named import",
    source: `
      import Lib, { useState } from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
      const { useState } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "default + namespace import",
    source: `
      import Lib, * as NS from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
      const NS = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "multiple named imports",
    source: `
      import { useState, useEffect } from "lib";
    `,
    expectedTranspiled: `
      const { useState, useEffect } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "named import with alias",
    source: `
      import { useEffect as effect } from "lib";
    `,
    expectedTranspiled: `
      const { useEffect: effect } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "default + named (multiline)",
    source: `
      import Lib, {
        useState,
        useEffect,
      } from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
      const { useState, useEffect } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "named (multiline with alias)",
    source: `
      import {
        useState,
        useEffect as effect,
      } from "lib";
    `,
    expectedTranspiled: `
      const { useState, useEffect: effect } = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "default via named syntax (default as)",
    source: `
      import { default as Lib } from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["Lib"];
    `,
  },
  {
    name: "multiple default imports",
    source: `
      import Lib1 from "lib1";
      import Lib2 from "lib2";
    `,
    expectedTranspiled: `
      const Lib1 = ${dependenciesGlobalVar}["Lib1"];
      const Lib2 = ${dependenciesGlobalVar}["Lib2"];
    `,
  },
];

it.each(testCases)("$name", ({ source, expectedTranspiled }) => {
  // Exercise
  const transpiled = transpileImports(stripIndent(source));

  // Verify
  expect(transpiled).toEqual(stripIndent(expectedTranspiled));
});

function stripIndent(code: string): string {
  return code
    .trim()
    .split("\n")
    .map((line) => line.replace(/^ {6}/, ""))
    .join("\n");
}
