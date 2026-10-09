# @tscircuit/internal-dynamic-import

This module simplifies dynamically importing tscircuit modules, especially when you always want to use the latest version.

It is also approximately type-safe, meaning we package bundled declaration types for a recent version of the supported modules here while leaving the runtime implementation remote.

```tsx
import importer from "@tscircuit/internal-dynamic-import"

async function main() {
  const { convertSoupToGerberCommands } = await importer("circuit-json-to-gerber")

  // Import a specific version
  const { CircuitJsonToKicadProConverter } = await importer(
    "circuit-json-to-kicad@0.0.91",
  )

  // ...
}
```

Runtime imports try jscdn first through `https://jscdn.tscircuit.com/.../+esm`
and fall back to `https://esm.run/...` if the jscdn import fails. Omitting a
version uses `latest`; adding `@...` preserves the requested version/tag.


## Bundle dependencies in the application

An application can provide lazy imports for its own pinned dependencies before
mounting RunFrame or other consumers:

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

These literal imports are visible to the application's bundler. The resulting
manifest is authoritative: a missing package or version throws locally, and a
failed local loader never falls back to a CDN. Concurrent requests share one
load; a failed load may be retried. A versioned request requires its exact key,
so register both the bare name and explicit version when both should work.
The factory infers each module's type from its loader.

Resolver configuration applies to the current JavaScript realm. Configure
browser windows and workers separately before their consumers execute. Modules
can also be registered eagerly with `registerDynamicModule`; the default
resolver looks up exact specifiers in that existing registry before loading
remotely.

Web applications can override one dependency while retaining normal resolution
for the others:

```ts
setDynamicImportResolver((specifier, defaultResolver) => {
  if (specifier === "circuit-to-svg") return import("circuit-to-svg")
  return defaultResolver(specifier)
})

// Restore the default resolver:
setDynamicImportResolver(undefined)
```

`createDynamicImporter(loaders, fallback)` also accepts an explicit fallback
resolver. Without a custom resolver, CDN URLs and fallback order are unchanged.
Applications remain responsible for any requests made inside the supplied
modules and for packaging their WASM, font, worker, and other runtime assets.
A source entrypoint is available at `@tscircuit/internal-dynamic-import/source`
for applications that bundle the TypeScript source.
