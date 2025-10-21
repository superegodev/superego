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
      const Lib = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "default import from scoped package",
    source: `
      import Lib from "@scope/lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["@scope/lib"];
    `,
  },
  {
    name: "namespace import",
    source: `
      import * as Lib from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "named import",
    source: `
      import { useState } from "lib";
    `,
    expectedTranspiled: `
      const { useState } = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "default + named import",
    source: `
      import Lib, { useState } from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["lib"];
      const { useState } = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "default + namespace import",
    source: `
      import Lib, * as NS from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["lib"];
      const NS = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "multiple named imports",
    source: `
      import { useState, useEffect } from "lib";
    `,
    expectedTranspiled: `
      const { useState, useEffect } = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "named import with alias",
    source: `
      import { useEffect as effect } from "lib";
    `,
    expectedTranspiled: `
      const { useEffect: effect } = ${dependenciesGlobalVar}["lib"];
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
      const Lib = ${dependenciesGlobalVar}["lib"];
      const { useState, useEffect } = ${dependenciesGlobalVar}["lib"];
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
      const { useState, useEffect: effect } = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "default via named syntax (default as)",
    source: `
      import { default as Lib } from "lib";
    `,
    expectedTranspiled: `
      const Lib = ${dependenciesGlobalVar}["lib"];
    `,
  },
  {
    name: "multiple default imports",
    source: `
      import Lib1 from "lib1";
      import Lib2 from "lib2";
    `,
    expectedTranspiled: `
      const Lib1 = ${dependenciesGlobalVar}["lib1"];
      const Lib2 = ${dependenciesGlobalVar}["lib2"];
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
