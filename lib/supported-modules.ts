import type * as CircuitJsonToBomCsvModule from "./type-bundles/circuit-json-to-bom-csv"
import type * as CircuitJsonToBpcModule from "./type-bundles/circuit-json-to-bpc"
import type * as CircuitJsonToConnectivityMapModule from "./type-bundles/circuit-json-to-connectivity-map"
import type * as CircuitJsonToGerberModule from "./type-bundles/circuit-json-to-gerber"
import type * as CircuitJsonToGltfModule from "./type-bundles/circuit-json-to-gltf"
import type * as CircuitJsonToKicadModule from "./type-bundles/circuit-json-to-kicad"
import type * as CircuitJsonToLbrnModule from "./type-bundles/circuit-json-to-lbrn"
import type * as CircuitJsonToPnpCsvModule from "./type-bundles/circuit-json-to-pnp-csv"
import type * as CircuitJsonToReadableNetlistModule from "./type-bundles/circuit-json-to-readable-netlist"
import type * as CircuitJsonToSimple3dModule from "./type-bundles/circuit-json-to-simple-3d"
import type * as CircuitJsonToSpiceModule from "./type-bundles/circuit-json-to-spice"
import type * as CircuitJsonToStepModule from "./type-bundles/circuit-json-to-step"
import type * as CircuitJsonToTscircuitModule from "./type-bundles/circuit-json-to-tscircuit"
import type * as CircuitToCanvasModule from "./type-bundles/circuit-to-canvas"
import type * as CircuitToSvgModule from "./type-bundles/circuit-to-svg"

export const supportedModules = [
  "circuit-json-to-bom-csv",
  "circuit-json-to-bpc",
  "circuit-json-to-connectivity-map",
  "circuit-json-to-gerber",
  "circuit-json-to-gltf",
  "circuit-json-to-kicad",
  "circuit-json-to-lbrn",
  "circuit-json-to-pnp-csv",
  "circuit-json-to-readable-netlist",
  "circuit-json-to-simple-3d",
  "circuit-json-to-spice",
  "circuit-json-to-step",
  "circuit-json-to-tscircuit",
  "circuit-to-canvas",
  "circuit-to-svg",
] as const

export type SupportedModuleName = (typeof supportedModules)[number]
export type SupportedModuleSpecifier =
  | SupportedModuleName
  | `${SupportedModuleName}@${string}`

export interface SupportedModuleMap {
  "circuit-json-to-bom-csv": typeof CircuitJsonToBomCsvModule
  "circuit-json-to-bpc": typeof CircuitJsonToBpcModule
  "circuit-json-to-connectivity-map": typeof CircuitJsonToConnectivityMapModule
  "circuit-json-to-gerber": typeof CircuitJsonToGerberModule
  "circuit-json-to-gltf": typeof CircuitJsonToGltfModule
  "circuit-json-to-kicad": typeof CircuitJsonToKicadModule
  "circuit-json-to-lbrn": typeof CircuitJsonToLbrnModule
  "circuit-json-to-pnp-csv": typeof CircuitJsonToPnpCsvModule
  "circuit-json-to-readable-netlist": typeof CircuitJsonToReadableNetlistModule
  "circuit-json-to-simple-3d": typeof CircuitJsonToSimple3dModule
  "circuit-json-to-spice": typeof CircuitJsonToSpiceModule
  "circuit-json-to-step": typeof CircuitJsonToStepModule
  "circuit-json-to-tscircuit": typeof CircuitJsonToTscircuitModule
  "circuit-to-canvas": typeof CircuitToCanvasModule
  "circuit-to-svg": typeof CircuitToSvgModule
}

export type StripVersion<TSpecifier extends string> =
  TSpecifier extends `${infer TBase}@${string}`
    ? TBase extends SupportedModuleName
      ? TBase
      : never
    : TSpecifier extends SupportedModuleName
      ? TSpecifier
      : never

export const getModuleName = (specifier: string): string => {
  const versionSeparatorIndex = specifier.indexOf("@")
  return versionSeparatorIndex === -1
    ? specifier
    : specifier.slice(0, versionSeparatorIndex)
}
