import { expect, test } from "bun:test"

import importer, {
  getDynamicModuleRegistry,
  getImportUrl,
  getImportUrls,
  registerDynamicModule,
  supportedModules,
} from "lib/index"

test("supportedModules includes all requested entrypoints", () => {
  expect(supportedModules).toContain("circuit-json-to-gerber")
  expect(supportedModules).toContain("circuit-to-canvas")
  expect(supportedModules).toContain("circuit-to-svg")
})

test("getImportUrl uses jscdn bundled ESM imports", () => {
  expect(getImportUrl("circuit-json-to-gerber")).toBe(
    "https://jscdn.tscircuit.com/circuit-json-to-gerber/latest/+esm",
  )
  expect(getImportUrl("circuit-json-to-kicad@0.0.91")).toBe(
    "https://jscdn.tscircuit.com/circuit-json-to-kicad/0.0.91/+esm",
  )
})

test("getImportUrls uses jscdn first and esm.run fallback", () => {
  expect(getImportUrls("circuit-json-to-gerber")).toEqual([
    "https://jscdn.tscircuit.com/circuit-json-to-gerber/latest/+esm",
    "https://esm.run/circuit-json-to-gerber",
  ])
  expect(getImportUrls("circuit-json-to-kicad@0.0.91")).toEqual([
    "https://jscdn.tscircuit.com/circuit-json-to-kicad/0.0.91/+esm",
    "https://esm.run/circuit-json-to-kicad@0.0.91",
  ])
})

test("unsupported modules throw", () => {
  expect(() => getImportUrl("not-supported")).toThrow("Unsupported module")
  expect(() => getImportUrls("not-supported")).toThrow("Unsupported module")
})

test("importer export is a function", () => {
  expect(typeof importer).toBe("function")
})

test("getDynamicModuleRegistry initializes the shared global registry", () => {
  const originalRegistry = globalThis.tscircuitDynamicModules

  try {
    globalThis.tscircuitDynamicModules = undefined

    const registry = getDynamicModuleRegistry()

    expect(registry).toEqual({})
    expect(globalThis.tscircuitDynamicModules === registry).toBe(true)
  } finally {
    globalThis.tscircuitDynamicModules = originalRegistry
  }
})

test("getDynamicModuleRegistry reuses an existing shared global registry", () => {
  const originalRegistry = globalThis.tscircuitDynamicModules
  const existingRegistry = { existing: true }

  try {
    globalThis.tscircuitDynamicModules = existingRegistry

    expect(getDynamicModuleRegistry()).toBe(existingRegistry)
  } finally {
    globalThis.tscircuitDynamicModules = originalRegistry
  }
})

test("registerDynamicModule stores loaded modules by module name", () => {
  const originalRegistry = globalThis.tscircuitDynamicModules
  const gltfModule = { convertSceneToGLTF: () => null }

  try {
    globalThis.tscircuitDynamicModules = undefined

    expect(registerDynamicModule("circuit-json-to-gltf", gltfModule)).toBe(
      gltfModule,
    )
    expect(
      globalThis.tscircuitDynamicModules?.["circuit-json-to-gltf"] ===
        gltfModule,
    ).toBe(true)
  } finally {
    globalThis.tscircuitDynamicModules = originalRegistry
  }
})
