import { getModuleName, supportedModules } from "./supported-modules"

const supportedModuleSet = new Set<string>(supportedModules)
const browserEntrypoints = new Map<string, string>([
  ["@tscircuit/circuit-json-schematic-placement-analysis", "dist/browser.js"],
])

function assertSupportedModule(specifier: string) {
  if (!supportedModuleSet.has(getModuleName(specifier))) {
    throw new Error(`Unsupported module: ${specifier}`)
  }
}

export const getImportUrl = (specifier: string): string => {
  assertSupportedModule(specifier)
  const moduleName = getModuleName(specifier)
  const version =
    specifier.length === moduleName.length
      ? "latest"
      : specifier.slice(moduleName.length + 1)
  const entrypoint = browserEntrypoints.get(moduleName) ?? "+esm"
  return `https://jscdn.tscircuit.com/${moduleName}/${version}/${entrypoint}`
}

export const getImportUrls = (specifier: string): string[] => {
  return [getImportUrl(specifier), `https://esm.run/${specifier}`]
}
