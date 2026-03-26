import { expect, test } from "bun:test"

import importer, { getImportUrl, supportedModules } from "lib/index"

test("supportedModules includes all requested entrypoints", () => {
  expect(supportedModules).toContain("circuit-json-to-gerber")
  expect(supportedModules).toContain("circuit-to-canvas")
  expect(supportedModules).toContain("circuit-to-svg")
})

test("getImportUrl uses jsDelivr bundled ESM imports", () => {
  expect(getImportUrl("circuit-json-to-gerber")).toBe(
    "https://esm.run/circuit-json-to-gerber",
  )
  expect(getImportUrl("circuit-json-to-kicad@0.0.91")).toBe(
    "https://esm.run/circuit-json-to-kicad@0.0.91",
  )
})

test("unsupported modules throw", () => {
  expect(() => getImportUrl("not-supported")).toThrow("Unsupported module")
})

test("importer export is a function", () => {
  expect(typeof importer).toBe("function")
})
