export type DynamicModuleResolver = (
  specifier: string,
) => unknown | PromiseLike<unknown>

/** A replacement may delegate selectively to the unchanged default resolver. */
export type DynamicImportResolver = (
  specifier: string,
  defaultResolver: DynamicModuleResolver,
) => unknown | PromiseLike<unknown>

declare global {
  var tscircuitDynamicImportResolver: DynamicImportResolver | undefined
}

export const getDynamicImportResolver = () =>
  globalThis.tscircuitDynamicImportResolver

/** Configure before consumers mount; call separately in browser/worker realms. */
export function setDynamicImportResolver(
  resolver: DynamicImportResolver | undefined,
): void {
  globalThis.tscircuitDynamicImportResolver = resolver
}

/**
 * An authoritative manifest of lazy bundled imports. Unknown/exact-version
 * misses reject locally. Generic callers can explicitly supply a fallback.
 */
export function createDynamicImporter<
  TLoaders extends Record<string, () => unknown | PromiseLike<unknown>>,
>(loaders: TLoaders, fallback?: DynamicModuleResolver) {
  const entries = new Map(Object.entries(loaders))
  const pending = new Map<string, Promise<unknown>>()

  function importer<TSpecifier extends keyof TLoaders & string>(
    specifier: TSpecifier,
  ): Promise<Awaited<ReturnType<TLoaders[TSpecifier]>>>
  function importer(specifier: string): Promise<unknown>
  async function importer(specifier: string): Promise<unknown> {
    const loader = entries.get(specifier)
    if (!loader) {
      if (fallback) return fallback(specifier)
      throw new Error(`No bundled module registered for: ${specifier}`)
    }
    if (!pending.has(specifier)) {
      const load = Promise.resolve()
        .then(loader)
        .catch((error) => {
          pending.delete(specifier)
          throw error
        })
      pending.set(specifier, load)
    }
    return pending.get(specifier)!
  }
  return importer
}
