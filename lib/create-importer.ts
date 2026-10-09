import { getDynamicModuleRegistry } from "./dynamic-module-registry"
import { getImportUrls } from "./import-urls"

/** Internal dependency seam lets tests observe CDN attempts without a network. */
export function createDefaultDynamicImportResolver(
  importModule: (url: string) => Promise<unknown> = (url) =>
    import(/* @vite-ignore */ url),
) {
  return async (specifier: string): Promise<unknown> => {
    const modules = getDynamicModuleRegistry()
    if (Object.hasOwn(modules, specifier)) return modules[specifier]

    let lastError: unknown
    for (const importUrl of getImportUrls(specifier)) {
      try {
        const mod = await importModule(importUrl)
        // A versioned module never silently satisfies a different version or
        // an unversioned request for latest.
        modules[specifier] = mod
        return mod
      } catch (error) {
        lastError = error
      }
    }
    throw lastError
  }
}
