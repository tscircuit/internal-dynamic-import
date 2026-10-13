import { getModuleName, supportedModules } from "./supported-modules"

declare global {
  interface Window {
    TSCIRCUIT_JSCDN_BASE_URL?: string
  }
}

const defaultBaseUrl = "https://jscdn.tscircuit.com"

function getConfiguredBaseUrl(): string | undefined {
  return typeof window !== "undefined"
    ? window.TSCIRCUIT_JSCDN_BASE_URL || undefined
    : undefined
}

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
  const configuredBaseUrl = getConfiguredBaseUrl()
  const baseUrl = (configuredBaseUrl ?? defaultBaseUrl).replace(/\/+$/, "")
  const url = `${baseUrl}/${moduleName}/${version}/${entrypoint}`
  return configuredBaseUrl ? new URL(url, window.location.href).href : url
}

export const getImportUrls = (specifier: string): string[] => {
  const url = getImportUrl(specifier)
  return getConfiguredBaseUrl() ? [url] : [url, `https://esm.run/${specifier}`]
}
