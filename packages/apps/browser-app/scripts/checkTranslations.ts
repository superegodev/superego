#!/usr/bin/env zx
import { readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "zx";

const translationsDir = join(import.meta.dirname, "../src/translations");
const compiledDir = join(translationsDir, "compiled");
const tmpTranslationsDir = join(
  tmpdir(),
  "superego-translations-check/translations",
);
const tmpCompiledDir = join(tmpdir(), "superego-translations-check/compiled");
const sourceLocale = "en.json";

// Verify that all messages have been extracted.
(() => {
  let failed = false;
  try {
    const actualSourceLocalePath = join(translationsDir, sourceLocale);
    const expectedSourceLocalePath = join(tmpTranslationsDir, sourceLocale);
    $.sync`yarn formatjs extract 'src/**/*.ts*' --ignore='**/*.d.ts' --id-interpolation-pattern='[name].[ext]_[sha512:contenthash:base64:6]' --out-file ${expectedSourceLocalePath}`;
    const actualSourceLocale = readFileSync(actualSourceLocalePath);
    const expectedSourceLocale = readFileSync(expectedSourceLocalePath);
    if (!actualSourceLocale.equals(expectedSourceLocale)) {
      console.error(
        `Locale ${sourceLocale} is out of date and needs to be re-extracted.`,
      );
      throw new Error();
    }
  } catch {
    failed = true;
  } finally {
    $.sync`rm -r ${tmpTranslationsDir}`;
    if (failed) {
      process.exit(1);
    }
  }
})();

// Verify that all messages in the source locale (en) are present in the other
// locales.
$.sync`yarn translations:verify`;

// Verify that other locales don't have "leftover" messages that are not in the
// source locale.
(() => {
  const otherLocales = readdirSync(translationsDir).filter(
    (name) => name.endsWith(".json") && name !== sourceLocale,
  );

  const sourceLocaleKeys = getLocaleMessageKeys(sourceLocale);
  for (const otherLocale of otherLocales) {
    const otherLocaleKeys = getLocaleMessageKeys(otherLocale);
    const superfluousKeys = otherLocaleKeys.difference(sourceLocaleKeys);
    if (superfluousKeys.size !== 0) {
      console.error(`Found superfluous keys in locale ${otherLocale}:`);
      console.error([...superfluousKeys]);
      process.exit(1);
    }
  }

  function getLocaleMessageKeys(fileName: string): Set<string> {
    const locale = JSON.parse(
      readFileSync(join(translationsDir, fileName), "utf8"),
    );
    return new Set(Object.keys(locale));
  }
})();

// Verify that all locales have been compiled and that there are no superfluous
// compiled locales.
(() => {
  let failed = false;
  try {
    $.sync`formatjs compile-folder --ast ${translationsDir} ${tmpCompiledDir}`;

    const actualCompiledFileNames = new Set(readdirSync(compiledDir));
    const expectedCompiledFileNames = new Set(readdirSync(tmpCompiledDir));

    const missingLocales = expectedCompiledFileNames.difference(
      actualCompiledFileNames,
    );
    if (missingLocales.size !== 0) {
      console.error("Missing compiled locales:");
      console.error([...missingLocales]);
      throw new Error();
    }

    const superfluousLocales = actualCompiledFileNames.difference(
      expectedCompiledFileNames,
    );
    if (superfluousLocales.size !== 0) {
      console.error("Found superfluous compiled locales:");
      console.error([...superfluousLocales]);
      throw new Error();
    }

    for (const compiledFileName of [...expectedCompiledFileNames]) {
      const actualCompiledLocale = readFileSync(
        join(compiledDir, compiledFileName),
      );
      const expectedCompiledLocale = readFileSync(
        join(tmpCompiledDir, compiledFileName),
      );
      if (!actualCompiledLocale.equals(expectedCompiledLocale)) {
        console.error(
          `Compiled locale ${compiledFileName} is out of date and needs to be recompiled.`,
        );
        throw new Error();
      }
    }
  } catch {
    failed = true;
  } finally {
    $.sync`rm -r ${tmpCompiledDir}`;
    if (failed) {
      process.exit(1);
    }
  }
})();
