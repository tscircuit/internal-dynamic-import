import { readFileSync } from "node:fs"
import path from "node:path"
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

test("published circuit-json-to-step bundle deep-imports stepts EntityId", () => {
  const stepBundlePath = path.join(
    import.meta.dir,
    "..",
    "node_modules",
    "circuit-json-to-step",
    "dist",
    "index.js",
  )
  const stepBundle = readFileSync(stepBundlePath, "utf8")

  expect(stepBundle).toContain('from "stepts/lib/core/EntityId"')
})

const runNetworkTests = process.env.RUN_NETWORK_TESTS === "1"

const networkTest = runNetworkTests ? test : test.skip

networkTest(
  "circuit-json-to-step browser bundle points at a stepts EntityId subpath that returns 404",
  async () => {
    const bundleResponse = await fetch("https://esm.run/circuit-json-to-step")
    const bundleText = await bundleResponse.text()

    expect(bundleResponse.ok).toBe(true)
    expect(bundleText).toContain(
      'from"/npm/stepts@0.0.3/lib/core/EntityId/+esm"',
    )

    const rootSteptsResponse = await fetch(
      "https://cdn.jsdelivr.net/npm/stepts@0.0.3/+esm",
    )
    expect(rootSteptsResponse.ok).toBe(true)

    const entityIdResponse = await fetch(
      "https://cdn.jsdelivr.net/npm/stepts@0.0.3/lib/core/EntityId/+esm",
    )

    expect(entityIdResponse.status).toBe(404)
    expect(getImportUrl("circuit-json-to-step")).toBe(
      "https://esm.run/circuit-json-to-step",
    )
  },
)
