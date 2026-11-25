import type {
  SupportedModuleMap,
  SupportedModuleName,
} from "./supported-modules"

export type DynamicModuleRegistry = Partial<SupportedModuleMap> &
  Record<string, unknown>

declare global {
  var tscircuitDynamicModules: DynamicModuleRegistry | undefined
}

export const getDynamicModuleRegistry = (): DynamicModuleRegistry => {
  if (globalThis.tscircuitDynamicModules) {
    return globalThis.tscircuitDynamicModules
  }

  const registry: DynamicModuleRegistry = {}
  globalThis.tscircuitDynamicModules = registry
  return registry
}

export function registerDynamicModule<TSpecifier extends SupportedModuleName>(
  name: TSpecifier,
  mod: SupportedModuleMap[TSpecifier],
): SupportedModuleMap[TSpecifier]
export function registerDynamicModule<TModule>(
  name: string,
  mod: TModule,
): TModule
export function registerDynamicModule<TModule>(
  name: string,
  mod: TModule,
): TModule {
  Object.defineProperty(getDynamicModuleRegistry(), name, {
    value: mod,
    writable: true,
    enumerable: true,
    configurable: true,
  })
  return mod
}
