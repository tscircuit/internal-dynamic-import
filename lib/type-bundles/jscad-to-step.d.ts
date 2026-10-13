import type { JscadOperation } from "jscad-planner"

type StepColorInput = number[] | string
interface Geom3Like {
  polygons: Array<{ vertices: any[] }>
  transforms?: number[]
  color?: StepColorInput
}
interface RenderedModel {
  geometries: Array<{ geom: Geom3Like; color?: StepColorInput }>
}
export interface JscadToStepOptions {
  mergeCoplanarFaces?: boolean
}
export declare function jscadToStep(
  operation: JscadOperation | RenderedModel,
  options?: JscadToStepOptions,
): string
