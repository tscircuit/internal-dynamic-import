# @tscircuit/internal-dynamic-import

Import supported tscircuit modules with declaration types, or supply your own
module registry and resolution functions. The default resolver checks a shared
registry, then loads supported modules from a CDN. Custom resolvers can use
installed dependencies, lazy imports, or another module source.

## Default imports

```ts
import importer from "@tscircuit/internal-dynamic-import"

const { convertSoupToGerberCommands } = await importer("circuit-json-to-gerber")
const { CircuitJsonToKicadProConverter } = await importer(
  "circuit-json-to-kicad@0.0.91",
)
const { analyzeSchematicPlacement } = await importer(
  "@tscircuit/circuit-json-schematic-placement-analysis@0.0.46",
)
```

For a supported module missing from the registry, resolution tries
its browser entrypoint on `https://jscdn.tscircuit.com`, then `https://esm.run/...`
if the first import fails. Most packages use `/+esm`; the schematic placement
analyzer uses its published `/dist/browser.js` bundle. Omitting a version
requests `latest`; adding `@...` preserves the
requested version or tag. Unsupported module names reject before a CDN import.

Supported-module declarations describe a recent package version, so the default
importer's types are approximate when loading a different runtime version.
`getImportUrl`, `getImportUrls`, and `supportedModules` expose the default URL
and module-name metadata.

## Register an existing module

```ts
import importer, {
  getDynamicModuleRegistry,
  registerDynamicModule,
} from "@tscircuit/internal-dynamic-import"
import * as svgModule from "circuit-to-svg"

registerDynamicModule("circuit-to-svg", svgModule)
const svg = await importer("circuit-to-svg")

// The shared registry also contains successful default imports.
const registry = getDynamicModuleRegistry()
```

The default resolver checks exact specifier keys in this registry before
loading remotely. Registering one module does not change resolution for other
modules. Successful CDN imports are cached under the exact requested specifier;
a versioned entry does not satisfy another version or a bare-name request.

## Create a lazy module map

```ts
import { createDynamicImporter } from "@tscircuit/internal-dynamic-import"

const loadSvg = () => import("circuit-to-svg")
const importModule = createDynamicImporter({
  "circuit-to-svg": loadSvg,
  "circuit-to-svg@0.0.447": loadSvg,
})

const svg = await importModule("circuit-to-svg")
```

The factory infers each result type from its loader. Literal imports can be
included by a bundler; install or pin the dependencies that those loaders use.
Map keys are exact: the example's versioned key should match the installed
version, and a request for any other version rejects. Bare names and versioned
aliases must be declared separately when both should work.

Each key loads lazily and caches its successful result. Concurrent requests
share the pending load. A rejected loader clears that key's pending result so
the next request retries the same loader. The factory maintains its own cache;
it does not automatically add modules to the shared eager registry.

Missing keys reject unless `createDynamicImporter(loaders, fallback)` receives
an explicit fallback resolver. The fallback handles missing keys only; it is
not called when a registered loader fails. The module map may contain custom
specifier names as well as supported tscircuit packages.

## Replace or extend default resolution

```ts
import {
  createDynamicImporter,
  setDynamicImportResolver,
} from "@tscircuit/internal-dynamic-import"

setDynamicImportResolver(createDynamicImporter({
  "circuit-json-to-bom-csv": () => import("circuit-json-to-bom-csv"),
  "circuit-to-svg": () => import("circuit-to-svg"),
}))
```

The default `importer` now delegates to this resolver. The map in this example
has no fallback, so missing packages or versions reject locally. A custom
resolver takes precedence over the default registry/CDN lookup.

To override selected requests and retain default resolution for others, use
the supplied `defaultResolver` callback:

```ts
setDynamicImportResolver((specifier, defaultResolver) => {
  if (specifier === "circuit-to-svg") return import("circuit-to-svg")
  return defaultResolver(specifier)
})

// Restore the default registry/CDN resolver.
setDynamicImportResolver(undefined)
```

Registry and resolver configuration are shared within the current JavaScript
realm. Configure each realm separately before requesting modules. This package
controls module resolution; supplied modules remain responsible for their own
requests and runtime assets, such as WASM or fonts.

The `@tscircuit/internal-dynamic-import/source` entrypoint exposes TypeScript
source for consumers that build their own bundle.
