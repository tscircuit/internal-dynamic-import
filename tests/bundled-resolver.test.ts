import { afterEach, expect, test } from "bun:test"
import importer, {
  createDynamicImporter,
  registerDynamicModule,
  setDynamicImportResolver,
} from "../lib/index"
import type { DynamicModuleResolver } from "../lib/index"
import { createDefaultDynamicImportResolver } from "../lib/create-importer"

const originalModules = globalThis.tscircuitDynamicModules
const originalResolver = globalThis.tscircuitDynamicImportResolver
afterEach(() => {
  globalThis.tscircuitDynamicModules = originalModules
  setDynamicImportResolver(originalResolver)
})

test("normal importer uses preregistered BOM and SVG implementations", async () => {
  globalThis.tscircuitDynamicModules = undefined
  setDynamicImportResolver(
    createDynamicImporter({
      "circuit-json-to-bom-csv": () => import("circuit-json-to-bom-csv"),
      "circuit-to-svg": () => import("circuit-to-svg"),
    }),
  )
  const bom = await importer("circuit-json-to-bom-csv")
  expect(await bom.convertCircuitJsonToBomRows({ circuitJson: [] })).toEqual([])
  const svg = await importer("circuit-to-svg")
  expect(svg.convertCircuitJsonToPcbSvg([])).toContain("<svg")
})

test("authoritative resolver rejects misses without invoking CDN fallback", async () => {
  let remoteAttempts = 0
  const online = createDefaultDynamicImportResolver(async () => {
    remoteAttempts++
    throw new Error("unexpected network import")
  })
  const bundled = createDynamicImporter({
    "bundled-package": () => ({ ok: true }),
  })
  await expect(bundled("circuit-json-to-step")).rejects.toThrow(
    "No bundled module",
  )
  const resolver = (
    specifier: string,
    _defaultResolver: DynamicModuleResolver,
  ) => bundled(specifier)
  await expect(resolver("circuit-json-to-step", online)).rejects.toThrow(
    "No bundled module",
  )
  setDynamicImportResolver(resolver)
  await expect(importer("circuit-json-to-step")).rejects.toThrow(
    "No bundled module",
  )
  expect(remoteAttempts).toBe(0)
})

test("lazy modules share one load; failure retries locally without a fallback", async () => {
  let loads = 0
  let failures = 0
  const bundled = createDynamicImporter({
    ok: async () => {
      loads++
      return { value: 42 }
    },
    flaky: async () => {
      if (failures++ === 0) throw new Error("local asset failed")
      return { recovered: true }
    },
  })
  const [left, right] = await Promise.all([bundled("ok"), bundled("ok")])
  expect(left).toBe(right)
  expect(loads).toBe(1)
  await expect(bundled("flaky")).rejects.toThrow("local asset failed")
  expect(await bundled("flaky")).toEqual({ recovered: true })
  await expect(bundled("__proto__")).rejects.toThrow("No bundled module")
})

test("explicit version requests require exact manifest keys", async () => {
  const bundled = createDynamicImporter({
    "circuit-to-svg": () => ({ version: "0.0.447" }),
    "circuit-to-svg@0.0.447": () => ({ version: "0.0.447" }),
  })
  expect(await bundled("circuit-to-svg@0.0.447")).toEqual({
    version: "0.0.447",
  })
  await expect(bundled("circuit-to-svg@0.0.339")).rejects.toThrow(
    "No bundled module",
  )
})

test("empty configuration keeps online URLs/fallback and independent packages", async () => {
  globalThis.tscircuitDynamicModules = undefined
  setDynamicImportResolver(undefined)
  const attempted: string[] = []
  const online = createDefaultDynamicImportResolver(async (url) => {
    attempted.push(url)
    if (url.includes("jscdn")) throw new Error("primary unavailable")
    return { importedFrom: url }
  })
  expect(await online("circuit-json-to-bom-csv")).toEqual({
    importedFrom: "https://esm.run/circuit-json-to-bom-csv",
  })
  expect(await online("circuit-to-svg")).toEqual({
    importedFrom: "https://esm.run/circuit-to-svg",
  })
  expect(attempted).toEqual([
    "https://jscdn.tscircuit.com/circuit-json-to-bom-csv/latest/+esm",
    "https://esm.run/circuit-json-to-bom-csv",
    "https://jscdn.tscircuit.com/circuit-to-svg/latest/+esm",
    "https://esm.run/circuit-to-svg",
  ])
})

test("online cache and eager registration preserve exact versions", async () => {
  globalThis.tscircuitDynamicModules = undefined
  const attempted: string[] = []
  const online = createDefaultDynamicImportResolver(async (url) => {
    attempted.push(url)
    return { importedFrom: url }
  })
  registerDynamicModule("circuit-to-svg@0.0.1", { registered: true })
  expect(await online("circuit-to-svg@0.0.1")).toEqual({ registered: true })
  await online("circuit-to-svg@0.0.2")
  await online("circuit-to-svg")
  expect(attempted).toEqual([
    "https://jscdn.tscircuit.com/circuit-to-svg/0.0.2/+esm",
    "https://jscdn.tscircuit.com/circuit-to-svg/latest/+esm",
  ])
})

test("web clients may override one module and delegate other requests", async () => {
  const bundled = createDynamicImporter({ special: () => ({ local: true }) })
  const attempts: string[] = []
  const defaultResolver = async (specifier: string) => {
    attempts.push(specifier)
    return { delegated: true }
  }
  const resolver = (specifier: string, fallback: typeof defaultResolver) =>
    specifier === "special" ? bundled(specifier) : fallback(specifier)
  expect(await resolver("special", defaultResolver)).toEqual({ local: true })
  expect(await resolver("other", defaultResolver)).toEqual({ delegated: true })
  expect(attempts).toEqual(["other"])
})
