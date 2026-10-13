import { afterEach, expect, test } from "bun:test"
import { createDefaultDynamicImportResolver } from "../lib/create-importer"
import { getImportUrl, getImportUrls } from "../lib/import-urls"

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
const originalRegistry = globalThis.tscircuitDynamicModules

function configureWindow(baseUrl?: string) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      TSCIRCUIT_JSCDN_BASE_URL: baseUrl,
      location: { href: "http://localhost:3076/project/index.html" },
    },
  })
}

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow)
  } else {
    Reflect.deleteProperty(globalThis, "window")
  }
  globalThis.tscircuitDynamicModules = originalRegistry
})

test("without a window or override, the existing CDN URLs remain available", () => {
  Reflect.deleteProperty(globalThis, "window")
  const expected = [
    "https://jscdn.tscircuit.com/circuit-json-to-gerber/latest/+esm",
    "https://esm.run/circuit-json-to-gerber",
  ]
  expect(getImportUrls("circuit-json-to-gerber")).toEqual(expected)
  configureWindow()
  expect(getImportUrls("circuit-json-to-gerber")).toEqual(expected)
  configureWindow("")
  expect(getImportUrls("circuit-json-to-gerber")).toEqual(expected)
})

test("an absolute override preserves versions and scoped browser entrypoints", () => {
  configureWindow("https://local.example/bundles///")
  expect(getImportUrls("circuit-json-to-kicad@0.0.91")).toEqual([
    "https://local.example/bundles/circuit-json-to-kicad/0.0.91/+esm",
  ])
  expect(
    getImportUrl("@tscircuit/circuit-json-schematic-placement-analysis@0.0.46"),
  ).toBe(
    "https://local.example/bundles/@tscircuit/circuit-json-schematic-placement-analysis/0.0.46/dist/browser.js",
  )
})

test("relative overrides resolve against the page rather than the importer bundle", () => {
  configureWindow("/jscdn")
  expect(getImportUrl("circuit-json-to-gerber")).toBe(
    "http://localhost:3076/jscdn/circuit-json-to-gerber/latest/+esm",
  )
  configureWindow("./jscdn/")
  expect(getImportUrl("circuit-json-to-gerber")).toBe(
    "http://localhost:3076/project/jscdn/circuit-json-to-gerber/latest/+esm",
  )
  expect(() => getImportUrl("unsupported-module")).toThrow("Unsupported module")
})

test("a failed local import has no public fallback and can be retried locally", async () => {
  configureWindow("/jscdn")
  globalThis.tscircuitDynamicModules = undefined
  const attempts: string[] = []
  const failure = new Error("local bundle missing")
  const resolve = createDefaultDynamicImportResolver(async (url) => {
    attempts.push(url)
    if (attempts.length === 1) throw failure
    return { local: true }
  })
  await expect(resolve("circuit-json-to-gerber")).rejects.toBe(failure)
  expect(attempts).toEqual([
    "http://localhost:3076/jscdn/circuit-json-to-gerber/latest/+esm",
  ])
  const module = await resolve("circuit-json-to-gerber")
  expect(module).toEqual({ local: true })
  expect(await resolve("circuit-json-to-gerber")).toBe(module)
  expect(attempts).toHaveLength(2)
})
