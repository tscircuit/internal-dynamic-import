import importer, { getDynamicModuleRegistry } from "lib/index"

async function verifyTyping() {
  const gerber = await importer("circuit-json-to-gerber")
  gerber.convertSoupToGerberCommands

  const gltf = await importer("circuit-json-to-gltf")
  gltf.convertSceneToGLTF

  const kicad = await importer("circuit-json-to-kicad@0.0.91")
  kicad.CircuitJsonToKicadProConverter

  const svg = await importer("circuit-to-svg")
  svg.convertCircuitJsonToPcbSvg

  const canvas = await importer("circuit-to-canvas")
  canvas.CircuitToCanvasDrawer

  const registry = getDynamicModuleRegistry()
  registry["circuit-json-to-gltf"] = gltf

  const maybeGltf = globalThis.tscircuitDynamicModules?.["circuit-json-to-gltf"]
  if (maybeGltf) {
    maybeGltf.convertSceneToGLTF

    // @ts-expect-error circuit-json-to-gltf does not export KiCad converters
    maybeGltf.CircuitJsonToKicadProConverter
  }

  // @ts-expect-error circuit-json-to-gerber does not export KiCad converters
  gerber.CircuitJsonToKicadProConverter
}

void verifyTyping
