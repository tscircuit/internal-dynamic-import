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

Runtime imports are resolved through jsDelivr's bundled ESM endpoint at `https://esm.run/...`, so omitting a version uses the latest published package and adding `@...` preserves the requested version/tag.
