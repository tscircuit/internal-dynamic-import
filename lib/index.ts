import { registerDynamicModule } from "./dynamic-module-registry"
import {
  getModuleName,
  supportedModules,
  type StripVersion,
  type SupportedModuleMap,
  type SupportedModuleSpecifier,
} from "./supported-modules"

export {
  getDynamicModuleRegistry,
  registerDynamicModule,
} from "./dynamic-module-registry"
export type { DynamicModuleRegistry } from "./dynamic-module-registry"
export {
  getModuleName,
  supportedModules,
} from "./supported-modules"
export type {
  StripVersion,
  SupportedModuleMap,
  SupportedModuleName,
  SupportedModuleSpecifier,
} from "./supported-modules"

const supportedModuleSet = new Set<string>(supportedModules)

export const getImportUrl = (specifier: string): string => {
  assertSupportedModule(specifier)

  return getJscdnImportUrl(specifier)
}

export const getImportUrls = (specifier: string): string[] => {
  assertSupportedModule(specifier)

  return [getJscdnImportUrl(specifier), `https://esm.run/${specifier}`]
}

function getJscdnImportUrl(specifier: string): string {
  const moduleName = getModuleName(specifier)
  const version =
    specifier.length === moduleName.length
      ? "latest"
      : specifier.slice(moduleName.length + 1)

  return `https://jscdn.tscircuit.com/${moduleName}/${version}/+esm`
}

function assertSupportedModule(specifier: string) {
  const moduleName = getModuleName(specifier)

  if (!supportedModuleSet.has(moduleName)) {
    throw new Error(`Unsupported module: ${specifier}`)
  }
}

async function importer<TSpecifier extends SupportedModuleSpecifier>(
  specifier: TSpecifier,
): Promise<SupportedModuleMap[StripVersion<TSpecifier>]>
async function importer(specifier: string): Promise<unknown>
async function importer(specifier: string): Promise<unknown> {
  let lastError: unknown

  for (const importUrl of getImportUrls(specifier)) {
    try {
      const mod = await import(/* @vite-ignore */ importUrl)
      return registerDynamicModule(getModuleName(specifier), mod)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

export default importer
