# @tscircuit/internal-dynamic-import

This module simplifies dynamically importing tscircuit modules, especially when you always want to use the latest version.

It is also approximately type-safe, meaning we package the types for the modules for a recent version here.

```tsx
import importer from "@tscircuit/internal-dynamic-import"

async function main() {
  const { convertCircuitJsonToGerber } = await importer("circuit-json-to-gerber")

  // Import a specific version
  const { convertCircuitJsonToKicadProject } = await import("circuit-json-to-kicad")

  // ...
}
```
