import importer from "lib/index"

async function verifyTyping() {
  const gerber = await importer("circuit-json-to-gerber")
  gerber.convertSoupToGerberCommands

  const kicad = await importer("circuit-json-to-kicad@0.0.91")
  kicad.CircuitJsonToKicadProConverter

  const svg = await importer("circuit-to-svg")
  svg.convertCircuitJsonToPcbSvg

  const canvas = await importer("circuit-to-canvas")
  canvas.CircuitToCanvasDrawer

  // @ts-expect-error circuit-json-to-gerber does not export KiCad converters
  gerber.CircuitJsonToKicadProConverter
}

void verifyTyping
