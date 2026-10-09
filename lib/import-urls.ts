import { getModuleName, supportedModules } from "./supported-modules"

const supportedModuleSet = new Set<string>(supportedModules)

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
  return `https://jscdn.tscircuit.com/${moduleName}/${version}/+esm`
}

export const getImportUrls = (specifier: string): string[] => {
  return [getImportUrl(specifier), `https://esm.run/${specifier}`]
}
