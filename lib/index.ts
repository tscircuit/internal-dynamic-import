import { createDefaultDynamicImportResolver } from "./create-importer"
import { getDynamicImportResolver } from "./dynamic-import-resolver"
import {
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
  setDynamicImportResolver,
  createDynamicImporter,
} from "./dynamic-import-resolver"
export type {
  DynamicImportResolver,
  DynamicModuleResolver,
} from "./dynamic-import-resolver"
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

export { getImportUrl, getImportUrls } from "./import-urls"

const loadModule = createDefaultDynamicImportResolver()

async function importer<TSpecifier extends SupportedModuleSpecifier>(
  specifier: TSpecifier,
): Promise<SupportedModuleMap[StripVersion<TSpecifier>]>
async function importer(specifier: string): Promise<unknown>
async function importer(specifier: string): Promise<unknown> {
  const resolver = getDynamicImportResolver()
  return resolver ? resolver(specifier, loadModule) : loadModule(specifier)
}

export default importer
