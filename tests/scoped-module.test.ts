import { afterEach, expect, test } from "bun:test"
import importer, {
  createDynamicImporter,
  getModuleName,
  setDynamicImportResolver,
} from "../lib/index"
import { createDefaultDynamicImportResolver } from "../lib/create-importer"

const moduleName = "@tscircuit/circuit-json-schematic-placement-analysis"
const originalRegistry = globalThis.tscircuitDynamicModules
const originalResolver = globalThis.tscircuitDynamicImportResolver
afterEach(() => {
  globalThis.tscircuitDynamicModules = originalRegistry
  setDynamicImportResolver(originalResolver)
})

test("scoped package names preserve their scope and strip only the version", () => {
  expect(getModuleName(moduleName)).toBe(moduleName)
  expect(getModuleName(`${moduleName}@0.0.46`)).toBe(moduleName)
  expect(getModuleName("circuit-to-svg@0.0.447")).toBe("circuit-to-svg")
})

test("scoped default resolution keeps exact versions and existing CDN fallback", async () => {
  globalThis.tscircuitDynamicModules = undefined
  const attempts: string[] = []
  const resolve = createDefaultDynamicImportResolver(async (url) => {
    attempts.push(url)
    if (url.includes("jscdn")) throw new Error("primary unavailable")
    return { importedFrom: url }
  })
  await resolve(`${moduleName}@0.0.46`)
  await resolve(`${moduleName}@0.0.45`)
  await resolve(moduleName)
  expect(attempts).toEqual([
    `https://jscdn.tscircuit.com/${moduleName}/0.0.46/+esm`,
    `https://esm.run/${moduleName}@0.0.46`,
    `https://jscdn.tscircuit.com/${moduleName}/0.0.45/+esm`,
    `https://esm.run/${moduleName}@0.0.45`,
    `https://jscdn.tscircuit.com/${moduleName}/latest/+esm`,
    `https://esm.run/${moduleName}`,
  ])
})

test("scoped lazy registration resolves a real analyzer and rejects another version", async () => {
  const load = () =>
    import("@tscircuit/circuit-json-schematic-placement-analysis")
  setDynamicImportResolver(
    createDynamicImporter({
      [moduleName]: load,
      [`${moduleName}@0.0.46`]: load,
    }),
  )
  const analysis = await importer(moduleName)
  const report = analysis.analyzeSchematicPlacement([], { issueTypes: [] })
  expect(report.getIssues()).toEqual([])
  expect(report.getIssueCounts().ComponentOverlap).toBe(0)
  const exact = await importer(
    "@tscircuit/circuit-json-schematic-placement-analysis@0.0.46",
  )
  expect(exact).toBe(analysis)
  await expect(importer(`${moduleName}@0.0.45`)).rejects.toThrow(
    "No bundled module registered",
  )
})
