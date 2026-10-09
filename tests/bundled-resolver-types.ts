import { createDynamicImporter, setDynamicImportResolver } from "../lib/index"

const bundled = createDynamicImporter({
  "circuit-to-svg": () => import("circuit-to-svg"),
  "custom-package@1.0.0": async () => ({ answer: 42 }),
})

async function verifyTypes() {
  const svg = await bundled("circuit-to-svg")
  svg.convertCircuitJsonToPcbSvg([])
  // @ts-expect-error SVG module has no KiCad converter
  svg.CircuitJsonToKicadProConverter
  const custom = await bundled("custom-package@1.0.0")
  const answer: number = custom.answer
  // @ts-expect-error loader's return value is typed
  const invalidAnswer: string = custom.answer
  void answer
  void invalidAnswer
}

setDynamicImportResolver(bundled)
void verifyTypes
