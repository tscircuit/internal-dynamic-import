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
  const moduleName = getModuleName(specifier)

  if (!supportedModuleSet.has(moduleName)) {
    throw new Error(`Unsupported module: ${specifier}`)
  }

  return `https://esm.run/${specifier}`
}

async function importer<TSpecifier extends SupportedModuleSpecifier>(
  specifier: TSpecifier,
): Promise<SupportedModuleMap[StripVersion<TSpecifier>]>
async function importer(specifier: string): Promise<unknown>
async function importer(specifier: string): Promise<unknown> {
  const mod = await import(/* @vite-ignore */ getImportUrl(specifier))
  return registerDynamicModule(getModuleName(specifier), mod)
}

export default importer
